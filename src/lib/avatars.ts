const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=256&auto=format&fit=crop`;

// Neutral, professional stand-in used when a helper signed up without Google and
// therefore has no real profile photo to show.
export const ASSISTANT_AVATAR_URL = UNSPLASH("photo-1544005313-94ddf0286df2");

export const FEMALE_AVATAR_URL = ASSISTANT_AVATAR_URL;
export const DEFAULT_AVATAR_URL = ASSISTANT_AVATAR_URL;

// The platform's designated helper is presented to *students* as a branded
// identity rather than a personal account: students never see the helper's own
// name or photo, only this label and its initials avatar. Admin and helper
// surfaces still show the helper's real name and Google profile photo.
export const ACADIVO_HELPER_NAME = "Acadivo Helper";

function isAcadivoHelper(name: string): boolean {
  return name.trim().toLowerCase() === ACADIVO_HELPER_NAME.toLowerCase();
}

// Portrait pool for non-Google helpers. Picked deterministically from the name
// so a given account always shows the same face across renders and devices.
const HELPER_AVATAR_POOL = [
  ASSISTANT_AVATAR_URL,
  UNSPLASH("photo-1573496359142-b8d87734a5a2"),
  UNSPLASH("photo-1580489944761-15a19d654956"),
  UNSPLASH("photo-1524504388940-b1c1722653e1"),
];

// The only removable profile photos are Google ones; any other stored URL (e.g.
// a seeded stand-in) is treated as a placeholder.
function isGoogleAvatar(src: string): boolean {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && /(^|\.)(googleusercontent\.com|ggpht\.com)$/.test(url.hostname);
  } catch {
    return false;
  }
}

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Resolve the portrait to show in a profile-picture slot.
 *
 *   * A Google/Gmail account keeps its own Google profile photo.
 *   * The branded "Acadivo Helper" identity never shows a personal photo — it
 *     falls through to the initials avatar so students only ever see "AH".
 *   * Any other helper without a Google photo gets a stable assistant portrait.
 *   * Everyone else (students, admins) without a Google photo shows initials.
 */
export function avatarFor(
  name: string | null | undefined,
  src?: string | null,
  role?: string | null
): string {
  if (src && isGoogleAvatar(src)) return src;

  const key = (name ?? "").trim();
  if (key && isAcadivoHelper(key)) return "";

  if (role === "helper") {
    return HELPER_AVATAR_POOL[hashName(key || "helper") % HELPER_AVATAR_POOL.length];
  }

  return "";
}
