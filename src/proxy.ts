import { NextRequest, NextResponse } from "next/server";

const ADMIN_PATHS = ["/admin", "/api/kickstart"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get("admin_session");
  if (!session || session.value !== "authenticated") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/kickstart/:path*"],
};
