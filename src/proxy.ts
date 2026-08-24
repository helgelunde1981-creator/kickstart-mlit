import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  }
  const login = new URL("/login", request.url);
  // Send brukeren tilbake dit hen faktisk skulle etter innlogging.
  if (pathname !== "/" && pathname !== "/login") {
    login.searchParams.set("neste", pathname + request.nextUrl.search);
  }
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/kickstart/:path*"],
};
