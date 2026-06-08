import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Always pass through internal Next.js paths and API routes
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/studio") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Subdomain rewrite:
  // e.g. sweet-melody-123.vercel.app → rewrite to /sweet-melody-123
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "mixtape-love.vercel.app";

  if (
    hostname !== mainDomain &&
    hostname !== "localhost:3000" &&
    (hostname.endsWith(".vercel.app") || hostname.endsWith(".pages.dev"))
  ) {
    const slug = hostname
      .replace(".vercel.app", "")
      .replace(".pages.dev", "");

    if (url.pathname === "/") {
      return NextResponse.rewrite(new URL(`/${slug}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
