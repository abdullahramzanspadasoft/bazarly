import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;
  const isAdmin = token?.role === "admin";

  const protectedRoutes = ["/dashboard", "/checkout", "/wishlist"];
  const adminRoutes = ["/admin"];

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (adminRoutes.some((route) => pathname.startsWith(route)) && !isAdmin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/checkout", "/wishlist", "/admin/:path*", "/login", "/register"],
};
