import { NextRequest, NextResponse } from "next/server";
import { isAppRoute } from "@/lib/routes";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAppRoute(pathname)) return NextResponse.next();

  if (!request.cookies.get("illustriober_refresh")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
