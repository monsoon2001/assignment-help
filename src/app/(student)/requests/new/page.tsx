import { createClient } from "@/lib/supabase/server";
import { getIpCountry } from "@/lib/geo.server";
import { countryNameFor, DEFAULT_COUNTRY } from "@/lib/currency";
import NewRequestView from "@/components/requests/new-request-view";

export const dynamic = "force-dynamic";

export default async function NewRequestPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let accountCountry: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("country")
      .eq("id", user.id)
      .maybeSingle();
    accountCountry = (profile as { country?: string | null } | null)?.country ?? null;
  }

  const ipCountry = await getIpCountry();
  const resolvedName = countryNameFor(accountCountry) ?? countryNameFor(ipCountry);
  const countryKnown = Boolean(resolvedName);
  const defaultCountry = resolvedName ?? DEFAULT_COUNTRY;

  return <NewRequestView defaultCountry={defaultCountry} countryKnown={countryKnown} />;
}
