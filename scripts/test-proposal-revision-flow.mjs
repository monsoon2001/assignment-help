// Acceptance tests for Group C: requests & proposals (fixes 9, 10, 13).
//
// Covers:
//   * Fix 9  — request idempotency: a duplicate submit with the same key can
//              never create a second request (unique partial index).
//   * Fix 10 — proposal statuses and history: quote -> revision requested ->
//              revised quote (old row "replaced") -> decline, with notes,
//              target price and decline reasons visible to both sides, plus
//              in-app notifications on every status change.
//   * Fix 13 — accept path: one order with a locked charge, and cancelling the
//              unpaid order marks the proposal declined and removes the order.
//
// Prerequisites:
//   * supabase/migrations/2026110800000{1,2,3}_*.sql applied
//   * a dev server running at http://localhost:3000
//   * .env.local with Supabase keys
//
// Run: node scripts/test-proposal-revision-flow.mjs

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) {
      const value = match[2].replace(/^"|"$/g, "");
      if (!process.env[match[1]]) process.env[match[1]] = value;
    }
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = "http://localhost:3000";

const admin = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket },
});

let passed = 0;
let failed = 0;
const results = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed++;
    results.push(`PASS  ${name}`);
  } else {
    failed++;
    results.push(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function createUser(role, tag, country) {
  const email = `groupc.${role}.${tag}@acadivo.test`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "TestPass123!",
    email_confirm: true,
    user_metadata: { name: `Group C ${role}`, role },
  });
  if (error) throw error;
  await admin.from("users").update({ role, ...(country ? { country } : {}) }).eq("id", data.user.id);
  return { id: data.user.id, email };
}

async function buildSession(user) {
  const sb = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  const { data, error } = await sb.auth.signInWithPassword({
    email: user.email,
    password: "TestPass123!",
  });
  if (error) throw error;
  const cookies = {};
  const serverClient = createServerClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: false },
    realtime: { transport: WebSocket },
    cookies: {
      getAll() {
        return Object.entries(cookies).map(([name, value]) => ({ name, value }));
      },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => (cookies[name] = value));
      },
    },
  });
  await serverClient.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  return { sb, cookieHeader };
}

async function post(path, cookieHeader, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: cookieHeader },
    body: JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* ignore */
  }
  return { status: res.status, json };
}

let student, helper, studentSession, helperSession;
const createdUserIds = [];
const createdRequestIds = [];
let firstProposalId;
let revisedProposalId;
let thirdProposalId;
let orderId;

(async () => {
  // Fail fast if the Group C migrations were not applied.
  const { error: enumErr } = await admin.rpc("request_proposal_revision", {
    p_proposal_id: "00000000-0000-0000-0000-000000000000",
    p_request_id: "00000000-0000-0000-0000-000000000000",
    p_note: null,
    p_target_price: null,
  });
  if (!enumErr || /does not exist|Could not find/i.test(enumErr.message)) {
    throw new Error("request_proposal_revision RPC is missing — apply 20261108000002 first");
  }

  student = await createUser("student", Date.now(), "CA");
  helper = await createUser("helper", Date.now(), null);
  createdUserIds.push(student.id, helper.id);
  studentSession = await buildSession(student);
  helperSession = await buildSession(helper);
  console.log("setup: student + helper created");

  // ---------------------------------------------------------------- Fix 9 --
  // A retried/double-clicked submit with the same idempotency key cannot
  // create a second request (unique partial index), and the client's
  // lookup-by-key path finds the original row.
  const idempotencyKey = `groupc-${Date.now()}`;
  const baseRequest = {
    student_id: student.id,
    title: "Group C — Proposal revision flow",
    description: "Testing revision, decline and cancel paths end to end.",
    subject: "Computer Science",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    file_urls: [],
    helper_id: helper.id,
    status: "requested",
    idempotency_key: idempotencyKey,
  };
  const { data: requestRow, error: requestErr } = await studentSession.sb
    .from("requests")
    .insert(baseRequest)
    .select("id, status")
    .single();
  check("request created with idempotency key", !requestErr && !!requestRow, requestErr?.message);
  if (requestErr || !requestRow) throw new Error(`request insert failed: ${requestErr?.message}`);
  const requestId = requestRow.id;
  createdRequestIds.push(requestId);

  const { error: duplicateErr } = await studentSession.sb
    .from("requests")
    .insert({ ...baseRequest, title: "duplicate should fail" })
    .select("id");
  check(
    "duplicate submit with same key rejected (23505)",
    duplicateErr?.code === "23505",
    `got ${duplicateErr?.code ?? "no error"}`,
  );

  const { data: existingByKey } = await studentSession.sb
    .from("requests")
    .select("id")
    .eq("student_id", student.id)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  check("client recovers the original request by key", existingByKey?.id === requestId);

  // --------------------------------------------------------------- Fix 10 --
  // Helper sends the first quote through the same RPC the UI uses.
  const { data: quote, error: quoteErr } = await helperSession.sb.rpc("submit_or_revise_proposal", {
    p_request_id: requestId,
    p_price: 120,
    p_currency: "cad",
    p_description: "First quote for the revision flow test.",
    p_revisions_included: 2,
  });
  check("helper sends first quote via RPC", !quoteErr && quote?.revised === false, quoteErr?.message);
  if (quoteErr || !quote?.id) throw new Error(`first quote RPC failed: ${quoteErr?.message}`);
  firstProposalId = quote.id;

  const { data: firstRow } = await admin.from("proposals").select("*").eq("id", firstProposalId).single();
  check("first quote is pending", firstRow?.status === "pending");
  check("first quote is CAD", firstRow?.currency === "CAD", `got ${firstRow?.currency}`);
  const { data: requestAfterQuote } = await admin
    .from("requests")
    .select("status")
    .eq("id", requestId)
    .single();
  check("request advanced to proposal_sent", requestAfterQuote?.status === "proposal_sent");

  // A second active quote for the same helper/request is refused.
  const { error: dupQuoteErr } = await helperSession.sb.rpc("submit_or_revise_proposal", {
    p_request_id: requestId,
    p_price: 999,
    p_currency: "CAD",
    p_description: "should be blocked",
    p_revisions_included: 0,
  });
  check(
    "duplicate active quote refused",
    !!dupQuoteErr && /already been sent/.test(dupQuoteErr.message),
    dupQuoteErr?.message,
  );

  // Only helpers can quote (a student calling the RPC must be refused).
  const { error: studentQuoteErr } = await studentSession.sb.rpc("submit_or_revise_proposal", {
    p_request_id: requestId,
    p_price: 50,
    p_currency: "CAD",
    p_description: "student cannot quote",
    p_revisions_included: 0,
  });
  check(
    "student cannot send a quote (role guard)",
    !!studentQuoteErr && /Only assigned helpers/.test(studentQuoteErr.message),
    studentQuoteErr?.message,
  );

  // The insert trigger notifies the student in-app.
  const { data: studentNotices } = await admin
    .from("notifications")
    .select("message")
    .eq("user_id", student.id)
    .eq("type", "proposal")
    .order("created_at", { ascending: false })
    .limit(5);
  check(
    "student notified in-app of the new quote",
    (studentNotices ?? []).some((n) => /sent you a proposal/.test(n.message)),
  );

  // Student asks for a different price (with note + target) via the API route.
  const revision = await post("/api/proposals/revision", studentSession.cookieHeader, {
    proposal_id: firstProposalId,
    request_id: requestId,
    note: "This is above my budget for a two-page task.",
    target_price: 90,
  });
  check("revision request accepted (200)", revision.status === 200, JSON.stringify(revision.json));

  const { data: revisionRow } = await admin
    .from("proposals")
    .select("status, student_note, target_price, revision_requested_at")
    .eq("id", firstProposalId)
    .single();
  check("proposal moved to revision_requested", revisionRow?.status === "revision_requested");
  check(
    "student note stored",
    revisionRow?.student_note === "This is above my budget for a two-page task.",
  );
  check("target price stored", Number(revisionRow?.target_price) === 90);
  check("revision timestamp stored", !!revisionRow?.revision_requested_at);

  // The browser flow pings /api/notify, which fans out to the helper in-app.
  const revisionNotify = await post("/api/notify", studentSession.cookieHeader, {
    event: "proposal.revision_requested",
    id: requestId,
  });
  check("revision notify fan-out ok", revisionNotify.status === 200, JSON.stringify(revisionNotify.json));
  const { data: helperNotices } = await admin
    .from("notifications")
    .select("message")
    .eq("user_id", helper.id)
    .order("created_at", { ascending: false })
    .limit(10);
  check(
    "helper notified in-app of the revision request",
    (helperNotices ?? []).some((n) => /requested a new price/.test(n.message)),
  );

  // Helper sends the revised quote; the old row becomes history ("replaced").
  const { data: revised, error: revisedErr } = await helperSession.sb.rpc(
    "submit_or_revise_proposal",
    {
      p_request_id: requestId,
      p_price: 95,
      p_currency: "CAD",
      p_description: "Revised quote after the student's note.",
      p_revisions_included: 2,
    },
  );
  check("helper sends revised quote via RPC", !revisedErr && revised?.revised === true, revisedErr?.message);
  if (revisedErr || !revised?.id) throw new Error(`revised quote RPC failed: ${revisedErr?.message}`);
  check("revised quote links back to the old row", revised?.replaced_id === firstProposalId);
  revisedProposalId = revised.id;

  const { data: oldRow } = await admin
    .from("proposals")
    .select("status, replaced_by")
    .eq("id", firstProposalId)
    .single();
  check("old quote marked replaced", oldRow?.status === "replaced");
  check("old quote points at its replacement", oldRow?.replaced_by === revisedProposalId);

  const { data: revisedRow } = await admin
    .from("proposals")
    .select("status, revision_of, currency, price")
    .eq("id", revisedProposalId)
    .single();
  check("revised quote is pending", revisedRow?.status === "pending");
  check("revised quote has revision_of set", revisedRow?.revision_of === firstProposalId);
  check("revised quote stays in CAD", revisedRow?.currency === "CAD");

  const { data: studentNotices2 } = await admin
    .from("notifications")
    .select("message")
    .eq("user_id", student.id)
    .eq("type", "proposal")
    .order("created_at", { ascending: false })
    .limit(5);
  check(
    "student notified in-app of the revised quote",
    (studentNotices2 ?? []).some((n) => /sent a revised quote/.test(n.message)),
  );

  // Student declines the revised quote with a reason.
  const decline = await post("/api/proposals/decline", studentSession.cookieHeader, {
    proposal_id: revisedProposalId,
    request_id: requestId,
    reason: "Found someone else, sorry.",
  });
  check("decline accepted (200)", decline.status === 200, JSON.stringify(decline.json));

  const { data: declinedRow } = await admin
    .from("proposals")
    .select("status, decline_reason")
    .eq("id", revisedProposalId)
    .single();
  check("revised quote marked declined", declinedRow?.status === "declined");
  check("decline reason stored", declinedRow?.decline_reason === "Found someone else, sorry.");

  const { data: requestAfterDecline } = await admin
    .from("requests")
    .select("status")
    .eq("id", requestId)
    .single();
  check("request settled to declined", requestAfterDecline?.status === "declined");

  const declineNotify = await post("/api/notify", studentSession.cookieHeader, {
    event: "proposal.declined",
    id: revisedProposalId,
  });
  check("decline notify fan-out ok", declineNotify.status === 200, JSON.stringify(declineNotify.json));
  const { data: helperNotices2 } = await admin
    .from("notifications")
    .select("message")
    .eq("user_id", helper.id)
    .order("created_at", { ascending: false })
    .limit(10);
  check(
    "helper notified in-app of the decline",
    (helperNotices2 ?? []).some((n) => /declined/.test(n.message)),
  );

  // --------------------------------------------------------------- Fix 13 --
  // The helper may quote again on the declined request; the student accepts;
  // the order locks the charge; cancelling the unpaid order removes it.
  const { data: third, error: thirdErr } = await helperSession.sb.rpc("submit_or_revise_proposal", {
    p_request_id: requestId,
    p_price: 100,
    p_currency: "CAD",
    p_description: "Fresh quote after the decline.",
    p_revisions_included: 1,
  });
  check("helper can quote again after decline", !thirdErr && third?.revised === false, thirdErr?.message);
  thirdProposalId = third.id;

  const accept = await post("/api/orders/accept", studentSession.cookieHeader, {
    proposal_id: thirdProposalId,
    request_id: requestId,
  });
  check("student accepts the quote (200)", accept.status === 200, JSON.stringify(accept.json));
  orderId = accept.json?.orderId;

  // A Canadian student is charged in CAD with the flat processing buffer,
  // rounded to a whole major unit (100 -> 104).
  const CA_CHARGE = Math.round(100 * 1.039);
  check(
    "accept returns the locked charge amount",
    Math.abs(Number(accept.json?.chargeAmount) - CA_CHARGE) < 0.01,
    `got ${accept.json?.chargeAmount}`,
  );
  check("accept returns CAD as the charge currency", accept.json?.chargeCurrency === "CAD");

  const { data: orderRow } = await admin
    .from("orders")
    .select("id, status, price, currency, charge_amount, charge_currency, proposal_id")
    .eq("id", orderId)
    .single();
  check("order created as payment_pending", orderRow?.status === "payment_pending");
  check("order price matches the accepted quote", Number(orderRow?.price) === 100);
  check("order charge is locked", Number(orderRow?.charge_amount) === CA_CHARGE && orderRow?.charge_currency === "CAD");
  check("order points at the accepted proposal", orderRow?.proposal_id === thirdProposalId);

  const { data: acceptedRow } = await admin
    .from("proposals")
    .select("status")
    .eq("id", thirdProposalId)
    .single();
  check("proposal marked accepted", acceptedRow?.status === "accepted");

  // Security regression: the guard trigger must still block a helper from
  // directly repricing an accepted proposal (bypassing the RPC).
  const { error: tamperErr } = await helperSession.sb
    .from("proposals")
    .update({ price: 1 })
    .eq("id", thirdProposalId);
  check(
    "helper cannot directly reprice an accepted quote",
    !!tamperErr && /locked and can no longer be edited/.test(tamperErr.message),
    tamperErr?.message,
  );
  const { data: stillAccepted } = await admin
    .from("proposals")
    .select("price")
    .eq("id", thirdProposalId)
    .single();
  check("accepted quote price unchanged", Number(stillAccepted?.price) === 100);

  const { data: requestAfterAccept } = await admin
    .from("requests")
    .select("status")
    .eq("id", requestId)
    .single();
  check("request settled to accepted", requestAfterAccept?.status === "accepted");

  // Cancelling the unpaid order (the "Cancel this order" text link) removes
  // the order and keeps the proposal as declined history.
  const cancel = await post("/api/proposals/decline", studentSession.cookieHeader, {
    proposal_id: thirdProposalId,
    request_id: requestId,
  });
  check("unpaid order cancelled via decline route (200)", cancel.status === 200, JSON.stringify(cancel.json));

  const { data: goneOrder } = await admin.from("orders").select("id").eq("id", orderId).maybeSingle();
  check("unpaid order removed", !goneOrder);

  const { data: cancelledRow } = await admin
    .from("proposals")
    .select("status, decline_reason")
    .eq("id", thirdProposalId)
    .single();
  check("cancelled proposal marked declined", cancelledRow?.status === "declined");
  check(
    "cancellation reason recorded",
    cancelledRow?.decline_reason === "Order cancelled before payment",
  );

  const { data: requestAfterCancel } = await admin
    .from("requests")
    .select("status")
    .eq("id", requestId)
    .single();
  check("request returned to declined after cancel", requestAfterCancel?.status === "declined");

  // ----------------------------------------------------------------- done --
  console.log();
  for (const line of results) console.log(line);
  console.log();
  console.log(`${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
})()
  .catch(async (e) => {
    console.error("FAILED:", e.message ?? e);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Cleanup: remove every row created by this run, then the users.
    try {
      for (const requestId of createdRequestIds) {
        await admin.from("proposals").delete().eq("request_id", requestId);
        await admin.from("requests").delete().eq("id", requestId);
      }
      if (orderId) await admin.from("orders").delete().eq("id", orderId);
      for (const userId of createdUserIds) {
        await admin.from("notifications").delete().eq("user_id", userId);
        await admin.auth.admin.deleteUser(userId);
      }
      console.log("cleanup: removed test rows and users");
    } catch (e) {
      console.error("cleanup failed:", e.message);
      if (!process.exitCode) process.exitCode = 1;
    }
  });
