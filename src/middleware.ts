import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionToken, isAdminToken } from "@/lib/auth-middleware";
import {
  RETURNING_USER_COOKIE,
  RETURNING_PARAM,
  getAuthPath,
  isReturningUser,
} from "@/lib/auth-redirect";

function markReturningUser(res: NextResponse) {
  res.cookies.set(RETURNING_USER_COOKIE, "1", {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getSessionToken(req);
  const isLoggedIn = !!token;
  const isAdmin = isAdminToken(token);
  const returning = isReturningUser(req.cookies.get(RETURNING_USER_COOKIE)?.value);
  const wantsLogin = req.nextUrl.searchParams.get(RETURNING_PARAM) === "1";

  const protectedRoutes = ["/dashboard", "/checkout", "/wishlist"];
  const adminRoutes = ["/admin"];

  // First-time visitors always start on Create Account
  if (!isLoggedIn && pathname === "/" && !returning) {
    return NextResponse.redirect(new URL("/register", req.url));
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isLoggedIn) {
    const authPath = getAuthPath(returning, pathname);
    return NextResponse.redirect(new URL(authPath, req.url));
  }

  if (adminRoutes.some((route) => pathname.startsWith(route)) && !isAdmin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Block login until user has chosen "Sign in" or registered before
  if (!isLoggedIn && pathname === "/login" && !returning && !wantsLogin) {
    const registerUrl = new URL("/register", req.url);
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl) registerUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(registerUrl);
  }

  if (!isLoggedIn && pathname === "/login" && (returning || wantsLogin)) {
    return markReturningUser(NextResponse.next());
  }

  if (!isLoggedIn && pathname === "/register") {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/checkout",
    "/wishlist",
    "/admin",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
