export const DEFAULT_AVATAR_URL = "https://images.unsplash.com/photo-1584999734482-0361aecad844?q=80&w=256&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return "AC";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
