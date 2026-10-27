// The platform's designated helper is presented to students by this branded
// identity, never by the helper's personal name or photo.
export const ACADIVO_HELPER_NAME = "Acadivo Helper";

// The only profile photos we trust are Google ones. Anything else (seeded
// stand-ins, stock portraits) is treated as a placeholder and replaced with an
// initials avatar so we never show a stranger's face next to a real name.
function isGoogleAvatar(src: string): boolean {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && /(^|\.)(googleusercontent\.com|ggpht\.com)$/.test(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Only show account photos hosted by Google. Everyone else uses initials.
 */
export function avatarFor(src?: string | null): string {
  return src && isGoogleAvatar(src) ? src : "";
}
