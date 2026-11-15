import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { normalizeCurrency } from "@/lib/currency";
import { calculateQuotePrice, getPricingRates } from "@/lib/pricing.server";

export const dynamic = "force-dynamic";

/**
 * Server endpoint for submitting or revising a proposal.
 * Calculates final_cad and fee_cad on the server according to admin-configured
 * pricing rates and the student's country.
 * Stores base_cad, final_cad, and fee_cad on the proposal.
 */
export async function POST(request: Request) {
  let body: {
    request_id?: unknown;
    price?: unknown;
    currency?: unknown;
    description?: unknown;
    revisions_included?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const requestId = body.request_id;
  const rawPrice = Number(body.price);

  if (typeof requestId !== "string" || !requestId) {
    return NextResponse.json({ error: "Missing request id." }, { status: 400 });
  }

  const basePrice = Math.round(rawPrice);
  if (!Number.isFinite(rawPrice) || !Number.isSafeInteger(basePrice) || basePrice <= 0) {
    return NextResponse.json(
      { error: "Enter a valid whole-number proposal price." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to send a proposal." },
      { status: 401 },
    );
  }

  // 1. Verify user is helper
  const { data: userProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (userProfile?.role !== "helper") {
    return NextResponse.json(
      { error: "Only assigned helpers can send proposals." },
      { status: 403 },
    );
  }

  // 2. Fetch student country from request (or student profile)
  const { data: reqRow, error: reqError } = await adminClient
    .from("requests")
    .select("id, student_id, country, status, helper_id")
    .eq("id", requestId)
    .maybeSingle();

  if (reqError || !reqRow) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  if (reqRow.helper_id !== user.id) {
    return NextResponse.json({ error: "This request is not assigned to you." }, { status: 403 });
  }

  let studentCountry = reqRow.country;
  if (!studentCountry && reqRow.student_id) {
    const { data: studentUser } = await adminClient
      .from("users")
      .select("country")
      .eq("id", reqRow.student_id)
      .maybeSingle();
    studentCountry = studentUser?.country ?? null;
  }

  // 3. Compute quote price with server-side rates
  const rates = await getPricingRates();
  const { finalCad, feeCad } = calculateQuotePrice(basePrice, studentCountry, rates);

  // 4. Submit via RPC with helper's authenticated client
  const { data: rpcResult, error: rpcError } = await supabase.rpc("submit_or_revise_proposal", {
    p_request_id: requestId,
    p_price: basePrice,
    p_currency: normalizeCurrency(typeof body.currency === "string" ? body.currency : "CAD"),
    p_description: typeof body.description === "string" ? body.description : null,
    p_revisions_included:
      typeof body.revisions_included === "number" ? body.revisions_included : 0,
  });

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 400 });
  }

  const result = rpcResult as { id?: string; revised?: boolean } | null;
  if (!result?.id || typeof result.revised !== "boolean") {
    return NextResponse.json(
      { error: "The proposal was saved, but its result could not be confirmed." },
      { status: 500 },
    );
  }

  // 5. Update proposal with base_cad, final_cad, fee_cad using adminClient
  const { error: updateError } = await adminClient
    .from("proposals")
    .update({
      base_cad: basePrice,
      final_cad: finalCad,
      fee_cad: feeCad,
    })
    .eq("id", result.id);

  if (updateError) {
    console.error("Failed to update proposal pricing columns:", updateError);
  }

  return NextResponse.json({
    id: result.id,
    revised: result.revised,
    finalCad,
  });
}
