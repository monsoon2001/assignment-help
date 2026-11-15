export type UserRole = "student" | "helper" | "admin";

export const ROLE_HOME: Record<UserRole, string> = {
  student: "/dashboard",
  helper: "/helper/dashboard",
  admin: "/admin/dashboard",
};

export function roleToHome(role?: string | null): string {
  return ROLE_HOME[(role as UserRole) ?? "student"] ?? "/dashboard";
}

/**
 * Returns a same-origin relative path safe to redirect to, or null.
 *
 * The naive guard `startsWith("/") && !startsWith("//")` still admits values
 * such as `/\evil.com` that the WHATWG URL parser normalises into a
 * cross-origin redirect; reject backslashes/control chars and re-parse.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next) return null;
  if (/[\\\u0000-\u001f\u007f]/.test(next)) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  try {
    const resolved = new URL(next, "https://internal.invalid");
    if (resolved.origin !== "https://internal.invalid") return null;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return null;
  }
}

export function isStudentRoute(pathname: string): boolean {
  return ["/dashboard", "/requests", "/orders", "/messages", "/notifications", "/profile"].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isHelperRoute(pathname: string): boolean {
  return pathname === "/helper" || pathname.startsWith("/helper/");
}

export function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isAuthRoute(pathname: string): boolean {
  return (
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/login" ||
    pathname === "/signup"
  );
}

/**
 * Checks whether a relative path is allowed for a given role.
 * Only same-site safe relative paths matching the role's allowed routes return true.
 */
export function isRouteAllowedForRole(role: string | null | undefined, pathname: string): boolean {
  const safe = safeNextPath(pathname);
  if (!safe) return false;

  const targetPath = safe.split("?")[0].split("#")[0];

  // Auth routes are never valid after sign in
  if (isAuthRoute(targetPath) || targetPath === "/") return false;

  const r = (role as UserRole) ?? "student";
  if (r === "admin") {
    // Admin can access admin routes and shared inspection routes
    return isAdminRoute(targetPath) || !isHelperRoute(targetPath);
  }
  if (r === "helper") {
    // Helpers can access helper routes and shared public assets/info
    return isHelperRoute(targetPath);
  }
  if (r === "student") {
    // Students cannot access helper or admin areas
    return !isHelperRoute(targetPath) && !isAdminRoute(targetPath);
  }
  return false;
}
