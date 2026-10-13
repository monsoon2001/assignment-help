const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=256&auto=format&fit=crop`;

export const FEMALE_AVATAR_URL = UNSPLASH("photo-1438761681033-6461ffad8d80");

export const DEFAULT_AVATAR_URL = FEMALE_AVATAR_URL;

// Distinct portraits for the seeded, non-Google helper accounts. Every helper on
// the platform is female, so these stand in for helpers who signed up with an
// email/password account and therefore have no Google profile photo.
export const HELPER_AVATARS: Record<string, string> = {
  "Sneha Shrestha": UNSPLASH("photo-1494790108377-be9c29b29330"),
  "Riya Patel": UNSPLASH("photo-1531123897727-8f129e1688ce"),
  "Prerna Thapa": UNSPLASH("photo-1573496359142-b8d87734a5a2"),
  "Diya Nair": UNSPLASH("photo-1580489944761-15a19d654956"),
  "Ananya Sharma": UNSPLASH("photo-1534528741775-53994a69daeb"),
  "Aayusha Adhikari": UNSPLASH("photo-1544005313-94ddf0286df2"),
};

// Spares for any other non-Google helper. Picked deterministically from the
// name so a given account always shows the same face across renders/devices.
const HELPER_AVATAR_POOL = [
  UNSPLASH("photo-1524504388940-b1c1722653e1"),
  UNSPLASH("photo-1517841905240-472988babdf9"),
  UNSPLASH("photo-1489424731084-a5d8b219a5bb"),
  ...Object.values(HELPER_AVATARS),
];

// The only removable profile photos are Google ones; any other stored URL (e.g.
// seeded Unsplash stand-ins) is treated as a placeholder.
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
 *   * A known non-Google helper gets their assigned female portrait by name.
 *   * Any other helper gets a stable female portrait from the spare pool.
 *   * Everyone else (students, admins) without a Google photo shows initials.
 */
export function avatarFor(
  name: string | null | undefined,
  src?: string | null,
  role?: string | null
): string {
  if (src && isGoogleAvatar(src)) return src;

  const key = (name ?? "").trim();
  if (key && HELPER_AVATARS[key]) return HELPER_AVATARS[key];

  if (role === "helper") {
    return HELPER_AVATAR_POOL[hashName(key || "helper") % HELPER_AVATAR_POOL.length];
  }

  return "";
}
