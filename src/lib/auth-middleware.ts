import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";
import { isAdminEmail } from "@/lib/admin-users";

export function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

export function shouldUseSecureCookies(req: NextRequest): boolean {
  if (process.env.NEXTAUTH_URL?.startsWith("https://")) return true;
  if (process.env.VERCEL === "1" || process.env.VERCEL_URL) return true;
  return req.nextUrl.protocol === "https:";
}

export async function getSessionToken(req: NextRequest): Promise<JWT | null> {
  const secret = getAuthSecret();
  if (!secret) return null;

  return getToken({
    req,
    secret,
    secureCookie: shouldUseSecureCookies(req),
  });
}

export function isAdminToken(token: JWT | null): boolean {
  if (!token) return false;
  const email = typeof token.email === "string" ? token.email : "";
  const role = typeof token.role === "string" ? token.role : "";
  return role === "admin" && !!email && isAdminEmail(email);
}
