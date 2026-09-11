export type UserRole = "student" | "helper" | "admin";

export const ROLE_HOME: Record<UserRole, string> = {
  student: "/dashboard",
  helper: "/helper/dashboard",
  admin: "/admin/dashboard",
};

export function roleToHome(role?: string | null): string {
  return ROLE_HOME[(role as UserRole) ?? "student"] ?? "/dashboard";
}

export function isStudentRoute(pathname: string): boolean {
  return [
    "/dashboard",
    "/requests",
    "/orders",
    "/messages",
    "/notifications",
    "/profile",
  ].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isHelperRoute(pathname: string): boolean {
  return pathname === "/helper" || pathname.startsWith("/helper/");
}

export function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isAuthRoute(pathname: string): boolean {
  return pathname === "/sign-in" || pathname === "/sign-up";
}