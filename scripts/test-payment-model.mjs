// Acceptance tests for the multi-currency local-charge + manual-payout model.
//
// Prerequisites:
//   * supabase/migrations/20261013000001_multicurrency_local_charge.sql applied
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
// Canadian students pay a flat 3.9% processing fee (no FX conversion).
const CA_PROCESSING_PERCENT = 3.9;
const CA_CHARGE = Math.round(PRICE * (1 + CA_PROCESSING_PERCENT / 100) * 100) / 100;

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

async function createUser(role, tag, country) {
  const email = `pay.${role}.${tag}@acadivo.test`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "TestPass123!",
    email_confirm: true,
    user_metadata: { name: `Pay ${role}`, role },
  });
  if (error) throw error;
  await admin
    .from("users")
    .update({ role, ...(country ? { country } : {}) })
    .eq("id", data.user.id);
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
let requestId2, proposalId2, orderId2, student2, student2Session;
const createdEventIds = [];

(async () => {
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set in .env.local");

  // Fail fast if the migration was not applied.
  const { error: schemaErr } = await admin
    .from("platform_settings")
    .select("fx_surcharge_percent")
    .limit(1);
  if (schemaErr) {
    throw new Error(
      `Migration 20261013000001 does not appear to be applied (${schemaErr.message}). ` +
        "Apply it before running this test."
    );
  }

  const tag = Date.now();
  // A Canadian student is charged a flat 3.9% processing fee (no FX conversion),
  // so the charge is deterministic (no network rate is required) — keeps the
  // test hermetic.
  student = await createUser("student", tag, "CA");
  helper = await createUser("helper", tag);
  studentSession = await buildSession(student);

  // --- seed a request -> pending proposal -------------------------------------
  const deadline = new Date(Date.now() + 7 * 864e5).toISOString();
  const { data: req, error: reqErr } = await admin
    .from("requests")
    .insert({
      student_id: student.id,
      title: "Multi-currency acceptance test",
      description: "Local charge acceptance test request.",
      subject: "Economics",
      deadline,
      file_urls: [],
      helper_id: helper.id,
      status: "proposal_sent",
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
      status: "pending",
    })
    .select("id")
    .single();
  if (propErr) throw propErr;
  proposalId = prop.id;

  // --- 1. Accepting via the server route locks the local charge ----------------
  const acceptRes = await fetch(`${BASE}/api/orders/accept`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: studentSession.cookieHeader },
    body: JSON.stringify({ proposal_id: proposalId, request_id: requestId }),
  });
  const acceptBody = await acceptRes.json().catch(() => ({}));
  check("accept route creates an order", acceptRes.status === 200 && !!acceptBody.orderId, JSON.stringify(acceptBody));
  orderId = acceptBody.orderId;

  if (!orderId) {
    throw new Error("Order was not created; cannot continue.");
  }

  const { data: orderRow } = await admin
    .from("orders")
    .select("status, price, currency, base_amount, base_currency, charge_amount, charge_currency, charge_locked_at")
    .eq("id", orderId)
    .single();
  check("order base amount locked to proposal", Number(orderRow?.base_amount) === PRICE, `got ${orderRow?.base_amount}`);
  check("order base currency is CAD", orderRow?.base_currency === "CAD", `got ${orderRow?.base_currency}`);
  check("order charge locked to CAD for a Canadian student", orderRow?.charge_currency === "CAD", `got ${orderRow?.charge_currency}`);
  check("order charge includes the 3.9% Canadian processing fee", Math.abs(Number(orderRow?.charge_amount) - CA_CHARGE) < 0.01, `got ${orderRow?.charge_amount}`);
  check("order charge locked timestamp set", !!orderRow?.charge_locked_at);

  // --- 2. Checkout: charges the locked currency/amount, ignores the client -----
  const coRes = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: studentSession.cookieHeader },
    body: JSON.stringify({ orderId, currency: "USD", price: 1, amount: 1 }),
  });
  const coBody = await coRes.json().catch(() => ({}));
  check("checkout returns a session", coRes.status === 200 && !!coBody.sessionId, JSON.stringify(coBody));

  if (coBody.sessionId) {
    const session = await stripe.checkout.sessions.retrieve(coBody.sessionId);
    check("checkout currency matches locked charge (cad)", session.currency === "cad", `got ${session.currency}`);
    check(
      "checkout amount equals locked charge (client ignored)",
      session.amount_total === Math.round(CA_CHARGE * 100),
      `got ${session.amount_total}`
    );
  } else {
    check("checkout currency matches locked charge (cad)", false, "no session");
    check("checkout amount equals locked charge (client ignored)", false, "no session");
  }

  // --- 3. Student-facing checkout page shows no fee/share breakdown -----------
  const pageRes = await fetch(`${BASE}/orders/${orderId}/payment`, {
    headers: { cookie: studentSession.cookieHeader },
    redirect: "manual",
  });
  const pageHtml = pageRes.status === 200 ? await pageRes.text() : "";
  const leaks = ["Payment breakdown", "Helper receives", "service fee", "Platform fee", "Our fee", "commission"].filter(
    (needle) => pageHtml.toLowerCase().includes(needle.toLowerCase())
  );
  check("student checkout page shows no fee/share breakdown", leaks.length === 0, `found: ${leaks.join(", ")}`);

  // --- 4. Forged webhook is rejected ------------------------------------------
  const forged = await fetch(`${BASE}/api/stripe/webhook`, {
    method: "POST",
    headers: { "stripe-signature": "t=1,v1=deadbeef", "content-type": "application/json" },
    body: JSON.stringify({ id: "evt_forged", type: "checkout.session.completed", data: { object: {} } }),
  });
  check("forged webhook rejected (400)", forged.status === 400, `got ${forged.status}`);

  // --- 5. Real signed event is processed, and replay cannot double-count ------
  piId = `pi_test_${Math.random().toString(36).slice(2, 12)}`;
  const completed = signedEvent("checkout.session.completed", {
    id: `cs_test_${Math.random().toString(36).slice(2, 10)}`,
    object: "checkout.session",
    mode: "payment",
    payment_status: "paid",
    payment_intent: piId,
    client_reference_id: orderId,
    amount_total: Math.round(CA_CHARGE * 100),
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
    .select("id, gross_cad, net_cad, charge_currency, charge_amount, charge_to_cad_rate, platform_fee_cad, helper_payout_status, disputed, status, stripe_payment_intent_id")
    .eq("order_id", orderId);
  check("exactly one payment recorded for replay", (payRows ?? []).length === 1, `count ${(payRows ?? []).length}`);

  const { data: orderAfter } = await admin.from("orders").select("status").eq("id", orderId).single();
  check("order moved to in_progress by webhook", orderAfter?.status === "in_progress", `got ${orderAfter?.status}`);

  // --- 6. Ledger values are correct -------------------------------------------
  const pay = (payRows ?? [])[0];
  check("ledger gross_cad correct", Math.abs(Number(pay?.gross_cad) - CA_CHARGE) < 0.01, `got ${pay?.gross_cad}`);
  check("ledger charge currency recorded", pay?.charge_currency === "CAD", `got ${pay?.charge_currency}`);
  check("ledger charge amount recorded", Math.abs(Number(pay?.charge_amount) - CA_CHARGE) < 0.01, `got ${pay?.charge_amount}`);
  check("ledger charge_to_cad_rate is 1 for CAD", Number(pay?.charge_to_cad_rate) === 1, `got ${pay?.charge_to_cad_rate}`);
  check("ledger platform buffer = 3.9% for Canada", Math.abs(Number(pay?.platform_fee_cad) - CA_PROCESSING_PERCENT) < 0.01, `got ${pay?.platform_fee_cad}`);
  check("ledger payout status starts unpaid", pay?.helper_payout_status === "unpaid", `got ${pay?.helper_payout_status}`);

  // --- 7. Partial refund is recorded (no share to reduce) ----------------------
  const refunded = signedEvent("charge.refunded", {
    id: `ch_test_${Math.random().toString(36).slice(2, 10)}`,
    object: "charge",
    payment_intent: piId,
    amount_refunded: 2500, // 25%
    amount: Math.round(CA_CHARGE * 100),
  });
  createdEventIds.push(refunded.id);
  const refRes = await postWebhook(refunded);
  check("refund webhook accepted", refRes.status === 200, `got ${refRes.status}`);

  const { data: afterRefund } = await admin
    .from("payments")
    .select("refunded_amount_cad, status")
    .eq("order_id", orderId)
    .single();
  check("refund recorded", Number(afterRefund?.refunded_amount_cad) === 25, `got ${afterRefund?.refunded_amount_cad}`);

  // --- 8. Recording a manual payout marks exactly the selected order paid ------
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

  // --- 9. Dispute puts the payout on hold --------------------------------------
  const dispute = signedEvent("charge.dispute.created", {
    id: `dp_test_${Math.random().toString(36).slice(2, 10)}`,
    object: "dispute",
    payment_intent: piId,
    amount: Math.round(CA_CHARGE * 100),
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

  // --- 10. Non-admin cannot read the private ledger ----------------------------
  const { error: colErr, data: colData } = await studentSession.sb
    .from("payments")
    .select("charge_amount, platform_fee_cad")
    .eq("order_id", orderId);
  check(
    "student cannot read ledger columns (charge/platform fee)",
    !!(colErr || (colData ?? []).length === 0),
    colErr ? "" : `leaked ${JSON.stringify(colData)}`
  );

  const { error: settingsErr } = await studentSession.sb.from("platform_settings").select("id").limit(1);
  check("student cannot read platform_settings", !!settingsErr, "no error returned");

  const { error: payoutsErr } = await studentSession.sb.from("manual_payouts").select("id").limit(1);
  check("student cannot read manual_payouts", !!payoutsErr, "no error returned");

  const { error: itemsErr } = await studentSession.sb.from("manual_payout_items").select("id").limit(1);
  check("student cannot read manual_payout_items", !!itemsErr, "no error returned");

  // Student should still be able to read their own non-sensitive payment fields.
  const { error: safeErr } = await studentSession.sb
    .from("payments")
    .select("id, amount, currency, status, created_at")
    .eq("order_id", orderId);
  check("student can still read non-sensitive payment fields", !safeErr, safeErr?.message ?? "");

  // --- 11. A non-Canadian student is charged in their local currency + buffer -----
  student2 = await createUser("student", `${tag}b`, "US");
  student2Session = await buildSession(student2);

  const { data: req2, error: req2Err } = await admin
    .from("requests")
    .insert({
      student_id: student2.id,
      title: "Multi-currency local charge (US)",
      description: "US local charge acceptance test request.",
      subject: "Economics",
      deadline,
      file_urls: [],
      helper_id: helper.id,
      status: "proposal_sent",
    })
    .select("id")
    .single();
  if (req2Err) throw req2Err;
  requestId2 = req2.id;

  const { data: prop2, error: prop2Err } = await admin
    .from("proposals")
    .insert({
      request_id: requestId2,
      helper_id: helper.id,
      price: PRICE,
      currency: "CAD",
      description: "US acceptance test proposal.",
      revisions_included: 1,
      expires_at: new Date(Date.now() + 3 * 864e5).toISOString(),
      status: "pending",
    })
    .select("id")
    .single();
  if (prop2Err) throw prop2Err;
  proposalId2 = prop2.id;

  const accept2Res = await fetch(`${BASE}/api/orders/accept`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: student2Session.cookieHeader },
    body: JSON.stringify({ proposal_id: proposalId2, request_id: requestId2 }),
  });
  const accept2Body = await accept2Res.json().catch(() => ({}));
  check("US accept route creates an order", accept2Res.status === 200 && !!accept2Body.orderId, JSON.stringify(accept2Body));
  orderId2 = accept2Body.orderId;

  if (orderId2) {
    const { data: order2 } = await admin
      .from("orders")
      .select("charge_amount, charge_currency")
      .eq("id", orderId2)
      .single();
    check("US order charged in USD", order2?.charge_currency === "USD", `got ${order2?.charge_currency}`);

    // Recompute the expected charge from the same live rate the server uses.
    const rateRes = await fetch("https://api.frankfurter.dev/v1/latest?base=CAD&symbols=USD");
    const rateJson = await rateRes.json().catch(() => null);
    const usdPerCad = rateJson?.rates?.USD;
    const { data: settings } = await admin
      .from("platform_settings")
      .select("fx_surcharge_percent")
      .limit(1)
      .single();
    const surcharge = Number(settings?.fx_surcharge_percent ?? 0);

    if (Number.isFinite(usdPerCad) && usdPerCad > 0) {
      const unconverted = PRICE * usdPerCad;
      const expected = Math.round(unconverted * (1 + surcharge / 100) * 100) / 100;
      check("US charge includes the hidden buffer (never shown)", Number(order2?.charge_amount) > unconverted, `got ${order2?.charge_amount}`);
      check("US charge matches converted base + buffer", Math.abs(Number(order2?.charge_amount) - expected) < 0.02, `got ${order2?.charge_amount}, expected ~${expected}`);
    } else {
      check("US charge includes the hidden buffer (never shown)", false, "no live USD rate");
      check("US charge matches converted base + buffer", false, "no live USD rate");
    }
  } else {
    check("US order charged in USD", false, "no order");
    check("US charge includes the hidden buffer (never shown)", false, "no order");
    check("US charge matches converted base + buffer", false, "no order");
  }

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
    if (orderId2) {
      await admin.from("manual_payout_items").delete().eq("order_id", orderId2);
      await admin.from("payments").delete().eq("order_id", orderId2);
      await admin.from("orders").delete().eq("id", orderId2);
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
    if (proposalId2) await admin.from("proposals").delete().eq("id", proposalId2);
    if (requestId2) await admin.from("requests").delete().eq("id", requestId2);
    if (proposalId) await admin.from("proposals").delete().eq("id", proposalId);
    if (requestId) await admin.from("requests").delete().eq("id", requestId);
    if (helper) await admin.from("helper_profiles").delete().eq("user_id", helper.id);
    if (student2) await admin.auth.admin.deleteUser(student2.id);
    if (student) await admin.auth.admin.deleteUser(student.id);
    if (helper) await admin.auth.admin.deleteUser(helper.id);
  } catch (err) {
    console.warn("cleanup warning:", err.message);
  }
}
