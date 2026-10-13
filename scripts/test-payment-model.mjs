// Acceptance tests for the platform-collected, CAD-only payment model.
//
// Prerequisites:
//   * supabase/migrations/20261011000001_payment_model_cad_ledger.sql applied
//   * a dev server running at http://localhost:3000
//   * .env.local with Supabase + Stripe (test mode) keys
//
// Run: node scripts/test-payment-model.mjs

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
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
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const BASE = "http://localhost:3000";
const PRICE = 100.0;
const SHARE_PERCENT = 80;

const admin = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket },
});
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

async function createUser(role, tag) {
  const email = `pay.${role}.${tag}@acadivo.test`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "TestPass123!",
    email_confirm: true,
    user_metadata: { name: `Pay ${role}`, role },
  });
  if (error) throw error;
  await admin.from("users").update({ role }).eq("id", data.user.id);
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

function signedEvent(type, object) {
  const payload = JSON.stringify({
    id: `evt_test_${type.replace(/[^a-z]/gi, "_")}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    object: "event",
    type,
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    data: { object },
  });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });
  return { payload, signature, id: JSON.parse(payload).id };
}

async function postWebhook(evt) {
  const res = await fetch(`${BASE}/api/stripe/webhook`, {
    method: "POST",
    headers: { "stripe-signature": evt.signature, "content-type": "application/json" },
    body: evt.payload,
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* ignore */
  }
  return { status: res.status, body };
}

let requestId, proposalId, orderId, student, helper, studentSession, piId;
const createdEventIds = [];

(async () => {
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set in .env.local");

  // Fail fast if the migration was not applied.
  const { error: schemaErr } = await admin
    .from("platform_settings")
    .select("id")
    .limit(1);
  if (schemaErr) {
    throw new Error(
      `Migration 20261011000001 does not appear to be applied (${schemaErr.message}). ` +
        "Apply it before running this test."
    );
  }

  const tag = Date.now();
  student = await createUser("student", tag);
  helper = await createUser("helper", tag);
  studentSession = await buildSession(student);

  // --- seed a request -> proposal (accepted) -> order (payment_pending) -------
  const deadline = new Date(Date.now() + 7 * 864e5).toISOString();
  const { data: req, error: reqErr } = await admin
    .from("requests")
    .insert({
      student_id: student.id,
      title: "Payment model acceptance test",
      description: "CAD ledger acceptance test request.",
      subject: "Economics",
      deadline,
      file_urls: [],
      helper_id: helper.id,
      status: "accepted",
    })
    .select("id")
    .single();
  if (reqErr) throw reqErr;
  requestId = req.id;

  const { data: prop, error: propErr } = await admin
    .from("proposals")
    .insert({
      request_id: requestId,
      helper_id: helper.id,
      price: PRICE,
      currency: "CAD",
      description: "Acceptance test proposal.",
      revisions_included: 1,
      expires_at: new Date(Date.now() + 3 * 864e5).toISOString(),
      status: "accepted",
    })
    .select("id")
    .single();
  if (propErr) throw propErr;
  proposalId = prop.id;

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      proposal_id: proposalId,
      student_id: student.id,
      helper_id: helper.id,
      status: "payment_pending",
      price: PRICE,
      currency: "CAD",
      deadline,
    })
    .select("id")
    .single();
  if (orderErr) throw orderErr;
  orderId = order.id;

  // --- 1. Checkout: CAD only, amount from the stored proposal, client ignored -
  const coRes = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: studentSession.cookieHeader },
    body: JSON.stringify({ orderId, currency: "USD", price: 1, amount: 1 }),
  });
  const coBody = await coRes.json().catch(() => ({}));
  check("checkout returns a session", coRes.status === 200 && !!coBody.sessionId, JSON.stringify(coBody));

  if (coBody.sessionId) {
    const session = await stripe.checkout.sessions.retrieve(coBody.sessionId);
    check("checkout currency is cad", session.currency === "cad", `got ${session.currency}`);
    check(
      "checkout amount equals agreed proposal price (client ignored)",
      session.amount_total === Math.round(PRICE * 100),
      `got ${session.amount_total}`
    );
  } else {
    check("checkout currency is cad", false, "no session");
    check("checkout amount equals agreed proposal price (client ignored)", false, "no session");
  }

  // --- 2. Student-facing checkout page shows no fee/share breakdown -----------
  const pageRes = await fetch(`${BASE}/orders/${orderId}/payment`, {
    headers: { cookie: studentSession.cookieHeader },
    redirect: "manual",
  });
  const pageHtml = pageRes.status === 200 ? await pageRes.text() : "";
  const leaks = ["Payment breakdown", "Helper receives", "service fee", "Platform fee", "Our fee"].filter(
    (needle) => pageHtml.toLowerCase().includes(needle.toLowerCase())
  );
  check("student checkout page shows no fee/share breakdown", leaks.length === 0, `found: ${leaks.join(", ")}`);

  // --- 3. Forged webhook is rejected ------------------------------------------
  const forged = await fetch(`${BASE}/api/stripe/webhook`, {
    method: "POST",
    headers: { "stripe-signature": "t=1,v1=deadbeef", "content-type": "application/json" },
    body: JSON.stringify({ id: "evt_forged", type: "checkout.session.completed", data: { object: {} } }),
  });
  check("forged webhook rejected (400)", forged.status === 400, `got ${forged.status}`);

  // --- 4. Real signed event is processed, and replay cannot double-count ------
  piId = `pi_test_${Math.random().toString(36).slice(2, 12)}`;
  const completed = signedEvent("checkout.session.completed", {
    id: `cs_test_${Math.random().toString(36).slice(2, 10)}`,
    object: "checkout.session",
    mode: "payment",
    payment_status: "paid",
    payment_intent: piId,
    client_reference_id: orderId,
    amount_total: Math.round(PRICE * 100),
    currency: "cad",
    customer_email: student.email,
    metadata: { order_id: orderId },
  });
  createdEventIds.push(completed.id);

  const first = await postWebhook(completed);
  check("valid signed webhook accepted", first.status === 200, `got ${first.status}`);
  const second = await postWebhook(completed);
  check("replayed webhook accepted as duplicate", second.status === 200 && second.body?.duplicate === true, JSON.stringify(second.body));

  const { data: payRows } = await admin
    .from("payments")
    .select("id, gross_cad, net_cad, helper_share_cad, helper_payout_status, disputed, status, stripe_payment_intent_id")
    .eq("order_id", orderId);
  check("exactly one payment recorded for replay", (payRows ?? []).length === 1, `count ${(payRows ?? []).length}`);

  const { data: orderAfter } = await admin.from("orders").select("status").eq("id", orderId).single();
  check("order moved to in_progress by webhook", orderAfter?.status === "in_progress", `got ${orderAfter?.status}`);

  // --- 5. Ledger values are correct -------------------------------------------
  const pay = (payRows ?? [])[0];
  check("ledger gross_cad correct", Number(pay?.gross_cad) === PRICE, `got ${pay?.gross_cad}`);
  check(
    "ledger helper_share_cad = 80% of gross",
    Number(pay?.helper_share_cad) === (PRICE * SHARE_PERCENT) / 100,
    `got ${pay?.helper_share_cad}`
  );
  check("ledger payout status starts unpaid", pay?.helper_payout_status === "unpaid", `got ${pay?.helper_payout_status}`);

  // --- 6. Partial refund reduces what is owed ----------------------------------
  const refunded = signedEvent("charge.refunded", {
    id: `ch_test_${Math.random().toString(36).slice(2, 10)}`,
    object: "charge",
    payment_intent: piId,
    amount_refunded: 2500, // 25%
    amount: Math.round(PRICE * 100),
  });
  createdEventIds.push(refunded.id);
  const refRes = await postWebhook(refunded);
  check("refund webhook accepted", refRes.status === 200, `got ${refRes.status}`);

  const { data: afterRefund } = await admin
    .from("payments")
    .select("refunded_amount_cad, helper_share_cad, status")
    .eq("order_id", orderId)
    .single();
  check("refund recorded", Number(afterRefund?.refunded_amount_cad) === 25, `got ${afterRefund?.refunded_amount_cad}`);
  check(
    "refund reduces amount owed",
    Number(afterRefund?.helper_share_cad) === 60,
    `got ${afterRefund?.helper_share_cad}`
  );

  // --- 7. Recording a payout marks exactly the selected order paid -------------
  const { data: payoutId, error: payoutErr } = await admin.rpc("record_helper_payout", {
    p_helper_id: helper.id,
    p_order_ids: [orderId],
    p_amount_sent_cad: 60,
    p_method: "wise",
    p_reference: "TEST-PAYOUT",
    p_notes: "acceptance test",
    p_amount_received: null,
    p_received_currency: null,
    p_created_by: null,
  });
  check("payout recorded via RPC", !payoutErr && !!payoutId, payoutErr?.message ?? "");

  const { data: afterPayout } = await admin
    .from("payments")
    .select("helper_payout_status")
    .eq("order_id", orderId)
    .single();
  check("helper marked paid after payout", afterPayout?.helper_payout_status === "paid", `got ${afterPayout?.helper_payout_status}`);

  const { data: items } = await admin
    .from("manual_payout_items")
    .select("order_id")
    .eq("payout_id", payoutId);
  check("payout item links the order", (items ?? []).length === 1 && items[0].order_id === orderId);

  const { error: doubleErr } = await admin.rpc("record_helper_payout", {
    p_helper_id: helper.id,
    p_order_ids: [orderId],
    p_amount_sent_cad: 60,
  });
  check("double payout blocked", !!doubleErr, "second payout unexpectedly succeeded");

  // --- 8. Dispute puts the payout on hold --------------------------------------
  const dispute = signedEvent("charge.dispute.created", {
    id: `dp_test_${Math.random().toString(36).slice(2, 10)}`,
    object: "dispute",
    payment_intent: piId,
    amount: Math.round(PRICE * 100),
  });
  createdEventIds.push(dispute.id);
  const disRes = await postWebhook(dispute);
  check("dispute webhook accepted", disRes.status === 200, `got ${disRes.status}`);

  const { data: afterDispute } = await admin
    .from("payments")
    .select("disputed, helper_payout_status")
    .eq("order_id", orderId)
    .single();
  check("dispute flags payment", afterDispute?.disputed === true, `got ${afterDispute?.disputed}`);
  check("dispute puts payout on hold", afterDispute?.helper_payout_status === "on_hold", `got ${afterDispute?.helper_payout_status}`);

  // --- 9. Non-admin cannot read the private ledger -----------------------------
  const { error: colErr, data: colData } = await studentSession.sb
    .from("payments")
    .select("helper_share_cad")
    .eq("order_id", orderId);
  check(
    "student cannot read ledger column (helper_share_cad)",
    !!(colErr || (colData ?? []).length === 0),
    colErr ? "" : `leaked ${JSON.stringify(colData)}`
  );

  const { error: settingsErr } = await studentSession.sb.from("platform_settings").select("id").limit(1);
  check("student cannot read platform_settings", !!settingsErr, "no error returned");

  const { error: payoutsErr } = await studentSession.sb.from("manual_payouts").select("id").limit(1);
  check("student cannot read manual_payouts", !!payoutsErr, "no error returned");

  const { error: compErr } = await studentSession.sb.from("helper_compensation").select("helper_id").limit(1);
  check("student cannot read helper_compensation", !!compErr, "no error returned");

  // Student should still be able to read their own non-sensitive payment fields.
  const { error: safeErr } = await studentSession.sb
    .from("payments")
    .select("id, amount, currency, status, created_at")
    .eq("order_id", orderId);
  check("student can still read non-sensitive payment fields", !safeErr, safeErr?.message ?? "");

  // --- report ------------------------------------------------------------------
  console.log("\n" + results.join("\n"));
  console.log(`\n${passed} passed, ${failed} failed`);
  await cleanup();
  process.exit(failed === 0 ? 0 : 1);
})().catch(async (e) => {
  console.error("FAILED:", e.message);
  if (results.length) console.log("\n" + results.join("\n"));
  await cleanup();
  process.exit(1);
});

async function cleanup() {
  try {
    if (orderId) {
      await admin.from("manual_payout_items").delete().eq("order_id", orderId);
      await admin.from("payments").delete().eq("order_id", orderId);
      await admin.from("orders").delete().eq("id", orderId);
    }
    if (createdEventIds.length) {
      await admin.from("processed_stripe_events").delete().in("event_id", createdEventIds);
    }
    // Remove any manual payouts created by this test for the helper.
    if (helper) {
      const { data: payouts } = await admin.from("manual_payouts").select("id").eq("helper_id", helper.id);
      for (const p of payouts ?? []) {
        await admin.from("manual_payout_items").delete().eq("payout_id", p.id);
        await admin.from("manual_payouts").delete().eq("id", p.id);
      }
    }
    if (proposalId) await admin.from("proposals").delete().eq("id", proposalId);
    if (requestId) await admin.from("requests").delete().eq("id", requestId);
    if (helper) await admin.from("helper_profiles").delete().eq("user_id", helper.id);
    if (student) await admin.auth.admin.deleteUser(student.id);
    if (helper) await admin.auth.admin.deleteUser(helper.id);
  } catch (err) {
    console.warn("cleanup warning:", err.message);
  }
}
