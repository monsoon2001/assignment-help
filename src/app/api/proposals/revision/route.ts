import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Student asks the helper for a different price. The existing quote is kept in
 * history and moves to "revision_requested" so the helper can send a revised
 * quote.
 */
export async function POST(request: Request) {
  let body: {
    proposal_id?: unknown;
    request_id?: unknown;
    note?: unknown;
    target_price?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const proposalId = body.proposal_id;
  const requestId = body.request_id;
  if (
    typeof proposalId !== "string" ||
    proposalId.length === 0 ||
    typeof requestId !== "string" ||
    requestId.length === 0
  ) {
    return NextResponse.json({ error: "Missing proposal or request id." }, { status: 400 });
  }

  let note: string | null = null;
  if (body.note !== undefined && body.note !== null) {
    if (typeof body.note !== "string") {
      return NextResponse.json({ error: "The note must be text." }, { status: 400 });
    }
    note = body.note.trim() || null;
    if (note && note.length > 2000) {
      return NextResponse.json(
        { error: "Keep the revision note under 2000 characters." },
        { status: 400 },
      );
    }
  }

  let targetPrice: number | null = null;
  if (body.target_price !== undefined && body.target_price !== null) {
    if (typeof body.target_price !== "number" || !Number.isFinite(body.target_price)) {
      return NextResponse.json({ error: "Enter a valid target price." }, { status: 400 });
    }
    targetPrice = Math.round(body.target_price);
    if (targetPrice <= 0) {
      return NextResponse.json({ error: "Enter a positive target price." }, { status: 400 });
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to request a revised price." },
      { status: 401 },
    );
  }

  const { error } = await supabase.rpc("request_proposal_revision", {
    p_proposal_id: proposalId,
    p_request_id: requestId,
    p_note: note,
    p_target_price: targetPrice,
  });

  if (error) {
    console.error("proposal revision: database operation failed", error);
    return NextResponse.json(
      { error: error.message || "Could not request a revised price. Please try again." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
