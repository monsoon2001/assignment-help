export const SESSION_TIMEBOX_MS = 24 * 60 * 60 * 1000;
export const AUTH_AT_COOKIE = "pc-auth-at";
export const AUTH_AT_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export function supabaseCookiePrefix(supabaseUrl: string): string {
  const match = supabaseUrl.match(/https:\/\/([^.]+)\./);
  return match ? `sb-${match[1]}-` : "sb-";
}

export function parseAuthAt(value: string | undefined | null): number | null {
  if (!value) return null;
  const time = Number(value);
  if (!Number.isFinite(time)) return null;
  if (time > Date.now() + 60_000) return null;
  return time;
}

export function authAtCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  maxAge: number;
  path: "/";
} {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_AT_COOKIE_MAX_AGE,
    path: "/",
  };
}

export function stampAuthAtCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_AT_COOKIE}=${Date.now()}; path=/; max-age=${AUTH_AT_COOKIE_MAX_AGE}; samesite=lax`;
}