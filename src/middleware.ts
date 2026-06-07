import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionToken, isAdminToken } from "@/lib/auth-middleware";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getSessionToken(req);
  const isLoggedIn = !!token;
  const isAdmin = isAdminToken(token);

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
  matcher: [
    "/dashboard/:path*",
    "/checkout",
    "/wishlist",
    "/admin",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
