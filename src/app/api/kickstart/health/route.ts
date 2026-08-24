import { NextResponse } from "next/server";
import { missingStandardsFiles } from "@/lib/kickstart/standards";
import { CLAUDE_MODEL } from "@/lib/kickstart/model";
import { probeSelfUrl } from "@/lib/kickstart/dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Svarer på spørsmålet «virker dette akkurat nå?» uten å starte en generering
 * som tar 15 minutter og koster penger. Bak admin-cookien (proxy.ts matcher
 * /api/kickstart/*), så den lekker ingenting.
 */
export async function GET() {
  const missing = missingStandardsFiles();
  const env = {
    ANTHROPIC_API_KEY: Boolean(process.env.ANTHROPIC_API_KEY),
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    ADMIN_EMAIL: Boolean(process.env.ADMIN_EMAIL),
    ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
    GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY),
    BOOTSTRAP_GITHUB_TOKEN: Boolean(process.env.BOOTSTRAP_GITHUB_TOKEN),
    SUPABASE_MANAGEMENT_TOKEN: Boolean(process.env.SUPABASE_MANAGEMENT_TOKEN),
    VERCEL_TOKEN: Boolean(process.env.VERCEL_TOKEN),
    LEADRADAR_HANDOFF_SECRET: Boolean(process.env.LEADRADAR_HANDOFF_SECRET),
  };

  // Bakgrunnsgenereringen står og faller på at appen når seg selv.
  const self = await probeSelfUrl();

  // Kun det som må være på plass for kjerneflyten avgjør ok/ikke ok.
  const required = [
    "ANTHROPIC_API_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
  ] as const;
  const missingEnv = required.filter((k) => !env[k]);

  const ok = missing.length === 0 && missingEnv.length === 0 && self.reachable;

  return NextResponse.json(
    {
      ok,
      model: CLAUDE_MODEL,
      missing_standards: missing,
      missing_env: missingEnv,
      self_url: self,
      env,
    },
    { status: ok ? 200 : 503 },
  );
}
