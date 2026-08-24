import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  safeEqual,
} from "@/lib/auth/session";

export const runtime = "nodejs";

// Brute-force-brems. In-memory er «best effort» på Vercel (én teller per
// lambda-instans), men stopper det realistiske scenariet: et skript som hamrer
// mot /api/auth fra én IP. Trenger vi hardere garantier må det til Upstash —
// se docs/ROADMAP.md.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; firstAt: number }>();

function rateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(ip, { count: 0, firstAt: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.firstAt + WINDOW_MS - now) / 1000),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

function registerFailure(ip: string) {
  const entry = attempts.get(ip) ?? { count: 0, firstAt: Date.now() };
  entry.count += 1;
  attempts.set(ip, entry);
}

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "ukjent";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `For mange forsøk. Prøv igjen om ${Math.ceil(limit.retryAfterSeconds / 60)} minutter.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { email?: unknown; password?: unknown }
    | null;
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) {
    console.error("[auth] ADMIN_EMAIL/ADMIN_PASSWORD mangler i miljøet");
    return NextResponse.json({ error: "Innlogging er ikke konfigurert" }, { status: 500 });
  }

  // Begge sammenligningene kjøres alltid — ingen tidlig retur som lekker om det
  // var e-posten eller passordet som var feil.
  const emailOk = safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase());
  const passwordOk = safeEqual(password, expectedPassword);
  if (!emailOk || !passwordOk) {
    registerFailure(ip);
    console.warn(`[auth] Mislykket innlogging fra ${ip}`);
    return NextResponse.json({ error: "Ugyldig brukernavn eller passord" }, { status: 401 });
  }

  attempts.delete(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
