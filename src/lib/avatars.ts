export const FEMALE_AVATAR_URL =
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const DEFAULT_AVATAR_URL = FEMALE_AVATAR_URL;

// The only removable profile photos are Google ones; any other stored URL (e.g.
// the seeded Unsplash stand-ins) is treated as a placeholder and swapped for
// the female default, which all current non-Google accounts expect.
function isGoogleAvatar(src: string): boolean {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && /(^|\.)(googleusercontent\.com|ggpht\.com)$/.test(url.hostname);
  } catch {
    return false;
  }
}

export function avatarFor(_name: string | null | undefined, src?: string | null): string {
  if (src && (isGoogleAvatar(src) || src === FEMALE_AVATAR_URL)) return src;
  return FEMALE_AVATAR_URL;
}