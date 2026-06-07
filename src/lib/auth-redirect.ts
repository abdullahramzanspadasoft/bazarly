export const RETURNING_USER_COOKIE = "bazaarly_returning";
export const RETURNING_PARAM = "returning";

export function isReturningUser(cookieValue?: string | null): boolean {
  return cookieValue === "1";
}

export function getAuthPath(isReturning: boolean, callbackUrl?: string): string {
  const page = isReturning ? "/login" : "/register";
  if (!callbackUrl || callbackUrl === "/") return page;
  return `${page}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export function getLoginUrl(callbackUrl?: string): string {
  const params = new URLSearchParams({ [RETURNING_PARAM]: "1" });
  if (callbackUrl && callbackUrl !== "/") {
    params.set("callbackUrl", callbackUrl);
  }
  return `/login?${params.toString()}`;
}

export function getClientAuthPath(callbackUrl = "/"): string {
  if (typeof document === "undefined") return getAuthPath(false, callbackUrl);

  const isReturning = document.cookie
    .split(";")
    .some((c) => c.trim() === `${RETURNING_USER_COOKIE}=1`);

  return getAuthPath(isReturning, callbackUrl);
}

export function setReturningUserClient(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${RETURNING_USER_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function isReturningUserClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim() === `${RETURNING_USER_COOKIE}=1`);
}
