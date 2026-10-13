import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort ISO 3166-1 alpha-2 country for the current request, derived from
 * the hosting platform's geolocation headers (Vercel / Cloudflare). Returns null
 * when the country cannot be determined (e.g. local development).
 *
 * This is only used to pick an *approximate* display currency; it never
 * influences the amount charged.
 */
export async function getIpCountry(): Promise<string | null> {
  try {
    const h = await headers();
    const raw =
      h.get("x-vercel-ip-country") ??
      h.get("cf-ipcountry") ??
      h.get("x-country-code") ??
      h.get("x-geo-country");
    if (!raw) return null;
    const code = raw.trim().toUpperCase();
    return /^[A-Z]{2}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}
