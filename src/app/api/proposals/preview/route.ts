import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { calculateQuotePrice, getPricingRates } from "@/lib/pricing.server";

export const dynamic = "force-dynamic";

/**
 * Preview endpoint for the helper quote form.
 * Returns only the final_cad amount so the helper sees:
 * "Student will see: C$X" (final price only, with no breakdown).
 * Pricing rates are kept server-side and never returned to the client.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const baseCadStr = searchParams.get("base");
  const requestId = searchParams.get("requestId");

  if (!baseCadStr || !requestId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const baseCad = Number(baseCadStr);
  if (!Number.isFinite(baseCad) || baseCad <= 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look up request to determine student country
  const { data: req } = await adminClient
    .from("requests")
    .select("country, student_id")
    .eq("id", requestId)
    .maybeSingle();

  let country = req?.country;
  if (!country && req?.student_id) {
    const { data: student } = await adminClient
      .from("users")
      .select("country")
      .eq("id", req.student_id)
      .maybeSingle();
    country = student?.country;
  }

  const rates = await getPricingRates();
  const { finalCad } = calculateQuotePrice(baseCad, country, rates);

  return NextResponse.json({ finalCad });
}
