import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
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
const base = process.env.E2E_BASE_URL || "http://localhost:3000";

if (!url || !anonKey || !secretKey) throw new Error("Missing Supabase env vars");

const admin = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket },
});

const password = "TestPass123!";
const stamp = Date.now();
const emailStudent = `groupc.student.${stamp}@acadivo.test`;
const emailHelper = `groupc.helper.${stamp}@acadivo.test`;

let studentId;
let helperId;
let requestId;
let firstProposalId;
let revisedProposalId;
let orderId;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function ssrSession() {
  const jar = new Map();
  const client = createServerClient(url, anonKey, {
    realtime: { transport: WebSocket },
    cookies: {
      getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (list) => {
        for (const { name, value } of list) jar.set(name, value);
      },
    },
  });
  return {
    client,
    cookieHeader: () =>
      [...jar.entries()].map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join("; "),
  };
}

async function api(path, cookieHeader, body) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: cookieHeader },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function waitFor(fn, label, attempts = 20) {
  for (let i = 0; i < attempts; i++) {
    const value = await fn();
    if (value) return value;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function main() {
  // --- users ---------------------------------------------------------------
  const { data: cS, error: eS } = await admin.auth.admin.createUser({
    email: emailStudent,
    password,
    email_confirm: true,
    user_metadata: { name: "Group C Student", role: "student" },
  });
  if (eS) throw new Error(`create student: ${eS.message}`);
  studentId = cS.user.id;

  const { data: cH, error: eH } = await admin.auth.admin.createUser({
    email: emailHelper,
    password,
    email_confirm: true,
    user_metadata: { name: "Group C Helper", role: "helper" },
  });
  if (eH) throw new Error(`create helper: ${eH.message}`);
  helperId = cH.user.id;
  console.log("1. created student + helper");

  const student = ssrSession();
  const helper = ssrSession();
  const sLogin = await student.client.auth.signInWithPassword({ email: emailStudent, password });
  if (sLogin.error) throw new Error(`student sign in: ${sLogin.error.message}`);
  const hLogin = await helper.client.auth.signInWithPassword({ email: emailHelper, password });
  if (hLogin.error) throw new Error(`helper sign in: ${hLogin.error.message}`);
  const studentCookie = student.cookieHeader();
  const helperCookie = helper.cookieHeader();
  console.log("2. signed in both parties");

  // --- request + idempotency ----------------------------------------------
  const idempotencyKey = `groupc-${stamp}`;
  const requestPayload = {
    student_id: studentId,
    helper_id: helperId,
    title: "Group C E2E — Proposal lifecycle",
    description: "Testing proposal history and payment actions.",
    subject: "Sociology",
    deadline: new Date(Date.now() + 7 * 864e5).toISOString(),
    file_urls: [],
    status: "requested",
    idempotency_key: idempotencyKey,
  };
  const { data: inserted, error: insErr } = await student.client
    .from("requests")
    .insert(requestPayload)
    .select("id")
    .single();
  if (insErr) throw new Error(`insert request: ${insErr.message}`);
  requestId = inserted.id;

  const { error: dupErr } = await student.client.from("requests").insert(requestPayload);
  assert(dupErr?.code === "23505", `expected idempotency unique violation, got ${dupErr?.code}`);
  const { data: sameRequest } = await student.client
    .from("requests")
    .select("id")
    .eq("student_id", studentId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  assert(sameRequest?.id === requestId, "idempotent lookup did not return the same request");
  console.log("3. request idempotency works");

  // --- first quote ---------------------------------------------------------
  const { data: first, error: firstErr } = await helper.client.rpc("submit_or_revise_proposal", {
    p_request_id: requestId,
    p_price: 120,
    p_currency: "CAD",
    p_description: "First quote — research and outline included.",
    p_revisions_included: 2,
  });
  if (firstErr) throw new Error(`first proposal: ${firstErr.message}`);
  firstProposalId = first.id;
  assert(first.revised === false, "first quote should not be marked revised");

  const { data: firstRow } = await admin
    .from("proposals")
    .select("id, status, currency, price, revision_of, replaced_by")
    .eq("id", firstProposalId)
    .single();
  assert(firstRow.status === "pending", `first quote status ${firstRow.status}`);
  assert(firstRow.currency === "CAD", `first quote currency ${firstRow.currency}`);
  assert(firstRow.revision_of === null && firstRow.replaced_by === null, "first quote links wrong");
  console.log("4. helper sent first quote in CAD");

  const studentNotice = await waitFor(async () => {
    const { data } = await admin
      .from("notifications")
      .select("id, message")
      .eq("user_id", studentId)
      .eq("type", "proposal")
      .order("created_at", { ascending: false })
      .limit(1);
    return data?.[0] ?? null;
  }, "student proposal notification");
  assert(/proposal/i.test(studentNotice.message), "student notification text unexpected");
  console.log("5. student got in-app proposal notification");

  // --- student asks for a different price ---------------------------------
  const revise = await api("/api/proposals/revision", studentCookie, {
    proposal_id: firstProposalId,
    request_id: requestId,
    note: "The brief is shorter than expected; can you do 90?",
    target_price: 90,
  });
  assert(revise.status === 200 && revise.data?.ok === true, `revision API: ${JSON.stringify(revise)}`);

  const { data: revisionRow } = await admin
    .from("proposals")
    .select("status, student_note, target_price")
    .eq("id", firstProposalId)
    .single();
  assert(revisionRow.status === "revision_requested", `revision status ${revisionRow.status}`);
  assert(revisionRow.target_price === 90, "target price not stored");
  assert(/shorter than expected/.test(revisionRow.student_note), "student note not stored");

  const notifyRevision = await api("/api/notify", studentCookie, {
    event: "proposal.revision_requested",
    id: requestId,
  });
  assert(notifyRevision.status === 200, `revision notify: ${JSON.stringify(notifyRevision)}`);
  const helperRevisionNotice = await waitFor(async () => {
    const { data } = await admin
      .from("notifications")
      .select("id, message")
      .eq("user_id", helperId)
      .eq("type", "proposal")
      .order("created_at", { ascending: false })
      .limit(1);
    return data?.[0] ?? null;
  }, "helper revision notification");
  assert(/new price/i.test(helperRevisionNotice.message), "helper revision notification text");
  console.log("6. revision requested; history kept; helper notified");

  // --- helper sends a revised quote ---------------------------------------
  const { data: revised, error: revisedErr } = await helper.client.rpc(
    "submit_or_revise_proposal",
    {
      p_request_id: requestId,
      p_price: 90,
      p_currency: "CAD",
      p_description: "Revised quote at your target.",
      p_revisions_included: 2,
    },
  );
  if (revisedErr) throw new Error(`revised proposal: ${revisedErr.message}`);
  revisedProposalId = revised.id;
  assert(revised.revised === true, "revised quote should be marked revised");
  assert(revised.replaced_id === firstProposalId, "revised quote did not link the old quote");

  const { data: oldAfterRevision } = await admin
    .from("proposals")
    .select("status, replaced_by")
    .eq("id", firstProposalId)
    .single();
  assert(oldAfterRevision.status === "replaced", `old quote status ${oldAfterRevision.status}`);
  assert(oldAfterRevision.replaced_by === revisedProposalId, "old quote replaced_by not set");

  const { data: newRow } = await admin
    .from("proposals")
    .select("status, revision_of, price, currency")
    .eq("id", revisedProposalId)
    .single();
  assert(newRow.status === "pending", `new quote status ${newRow.status}`);
  assert(newRow.revision_of === firstProposalId, "new quote revision_of not set");
  assert(Number(newRow.price) === 90 && newRow.currency === "CAD", "new quote amount/currency wrong");
  console.log("7. revised quote created; old quote marked replaced");

  // --- student declines the revised quote ---------------------------------
  const decline = await api("/api/proposals/decline", studentCookie, {
    proposal_id: revisedProposalId,
    request_id: requestId,
    reason: "Still outside my budget.",
  });
  assert(decline.status === 200 && decline.data?.ok === true, `decline API: ${JSON.stringify(decline)}`);
  const { data: declinedRow } = await admin
    .from("proposals")
    .select("status, decline_reason")
    .eq("id", revisedProposalId)
    .single();
  assert(declinedRow.status === "declined", `declined status ${declinedRow.status}`);
  assert(/outside my budget/.test(declinedRow.decline_reason), "decline reason not stored");

  const notifyDecline = await api("/api/notify", studentCookie, {
    event: "proposal.declined",
    id: revisedProposalId,
  });
  assert(notifyDecline.status === 200, `decline notify: ${JSON.stringify(notifyDecline)}`);
  const helperDeclineNotice = await waitFor(async () => {
    const { data } = await admin
      .from("notifications")
      .select("id, message")
      .eq("user_id", helperId)
      .eq("type", "proposal")
      .order("created_at", { ascending: false })
      .limit(1);
    return data?.[0] ?? null;
  }, "helper decline notification");
  assert(/declined/i.test(helperDeclineNotice.message), "helper decline notification text");
  console.log("8. decline kept reason and notified helper");

  // --- helper sends a fresh quote, student accepts ------------------------
  const { data: fresh, error: freshErr } = await helper.client.rpc("submit_or_revise_proposal", {
    p_request_id: requestId,
    p_price: 85,
    p_currency: "CAD",
    p_description: "Final quote.",
    p_revisions_included: 2,
  });
  if (freshErr) throw new Error(`fresh proposal: ${freshErr.message}`);
  const freshProposalId = fresh.id;

  const accept = await api("/api/orders/accept", studentCookie, {
    proposal_id: freshProposalId,
    request_id: requestId,
  });
  assert(accept.status === 200 && accept.data?.orderId, `accept API: ${JSON.stringify(accept)}`);
  orderId = accept.data.orderId;
  assert(
    typeof accept.data.chargeAmount === "number" && accept.data.chargeAmount > 0,
    "accept did not return a locked charge amount",
  );
  assert(typeof accept.data.chargeCurrency === "string", "accept did not return charge currency");

  const { data: orderRow } = await admin
    .from("orders")
    .select("status, price, currency, charge_amount, charge_currency, proposal_id")
    .eq("id", orderId)
    .single();
  assert(orderRow.status === "payment_pending", `order status ${orderRow.status}`);
  assert(orderRow.proposal_id === freshProposalId, "order linked to wrong proposal");
  assert(
    Number(orderRow.charge_amount) === Number(accept.data.chargeAmount),
    "locked charge amount mismatch",
  );
  assert(orderRow.charge_currency === accept.data.chargeCurrency, "locked charge currency mismatch");

  const { data: acceptedRow } = await admin
    .from("proposals")
    .select("status")
    .eq("id", freshProposalId)
    .single();
  assert(acceptedRow.status === "accepted", `accepted proposal status ${acceptedRow.status}`);

  const helperAcceptNotice = await waitFor(async () => {
    const { data } = await admin
      .from("notifications")
      .select("id, message")
      .eq("user_id", helperId)
      .eq("type", "payment")
      .order("created_at", { ascending: false })
      .limit(1);
    return data?.[0] ?? null;
  }, "helper acceptance notification");
  assert(/accepted/i.test(helperAcceptNotice.message), "helper acceptance notification text");
  console.log(
    `9. accepted at locked ${accept.data.chargeCurrency} ${accept.data.chargeAmount}; helper notified`,
  );

  // --- student cancels the unpaid order -----------------------------------
  const cancel = await api("/api/proposals/decline", studentCookie, {
    proposal_id: freshProposalId,
    request_id: requestId,
  });
  assert(cancel.status === 200 && cancel.data?.ok === true, `cancel API: ${JSON.stringify(cancel)}`);

  const { data: cancelledOrder } = await admin
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();
  assert(!cancelledOrder, "unpaid order was not removed on cancel");
  const { data: cancelledProposal } = await admin
    .from("proposals")
    .select("status, decline_reason")
    .eq("id", freshProposalId)
    .single();
  assert(cancelledProposal.status === "declined", "cancelled proposal not declined");
  console.log("10. unpaid order cancelled; proposal history preserved");

  console.log("PASS: Group C lifecycle verified end to end");
}

async function cleanup() {
  if (requestId) {
    await admin.from("notifications").delete().in("user_id", [studentId, helperId].filter(Boolean));
    await admin.from("orders").delete().eq("student_id", studentId);
    await admin.from("proposals").delete().eq("request_id", requestId);
    await admin.from("requests").delete().eq("id", requestId);
  }
  if (studentId) await admin.auth.admin.deleteUser(studentId);
  if (helperId) await admin.auth.admin.deleteUser(helperId);
}

main()
  .then(async () => {
    await cleanup();
    console.log("cleanup complete");
  })
  .catch(async (error) => {
    console.error("FAILED:", error.message);
    try {
      await cleanup();
    } catch (cleanupError) {
      console.error("cleanup failed:", cleanupError.message);
    }
    process.exit(1);
  });
