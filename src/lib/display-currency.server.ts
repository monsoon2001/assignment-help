import "server-only";
import {
  DEFAULT_DISPLAY_CURRENCY,
  currencyForCountry,
  type DisplayCurrency,
} from "@/lib/currency";
import { getIpCountry } from "@/lib/geo.server";

/**
 * Pick the default display currency for the current visitor:
 *   1. the country stored on their account (captured at sign-up),
 *   2. otherwise the country inferred from their IP,
 *   3. otherwise CAD.
 *
 * Display-only. The amount charged is always CAD.
 */
export async function resolveDisplayCurrency(
  userCountry?: string | null
): Promise<DisplayCurrency> {
  const fromAccount = currencyForCountry(userCountry);
  if (fromAccount) return fromAccount;

  const ipCountry = await getIpCountry();
  const fromIp = currencyForCountry(ipCountry);
  if (fromIp) return fromIp;

  return DEFAULT_DISPLAY_CURRENCY;
}
