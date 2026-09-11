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

const admin = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket },
});

const password = "TestPass123!";
const emailStudent = `p4.student.${Date.now()}@peercraft.test`;
const emailHelper = `p4.helper.${Date.now()}@peercraft.test`;

let studentCreated, helperCreated, thirdCreated, requestId, proposalId, orderId;

(async () => {
  // 1. Create users
  const { data: cS, error: eS } = await admin.auth.admin.createUser({
    email: emailStudent, password, email_confirm: true,
    user_metadata: { name: "P4 Student", role: "student" },
  });
  if (eS) throw new Error(`create student: ${eS.message}`);
  studentCreated = cS;

  const { data: cH, error: eH } = await admin.auth.admin.createUser({
    email: emailHelper, password, email_confirm: true,
    user_metadata: { name: "P4 Helper", role: "helper" },
  });
  if (eH) throw new Error(`create helper: ${eH.message}`);
  helperCreated = cH;
  console.log("1. created student + helper");

  const sb = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  await sb.auth.signInWithPassword({ email: emailStudent, password });

  // 2. Student creates a request, helper proposes
  const { data: ins, error: insErr } = await sb
    .from("requests")
    .insert({
      student_id: studentCreated.user.id,
      title: "P4 Order Flow — Economics Paper",
      description: "Draft a 6-page economics analysis.",
      subject: "Economics",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      file_urls: [],
      helper_id: helperCreated.user.id,
      status: "requested",
    })
    .select("id, deadline")
    .single();
  if (insErr) throw new Error(`insert request: ${insErr.message}`);
  requestId = ins.id;
  console.log("2. student request:", requestId);

  const helperSb = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  await helperSb.auth.signInWithPassword({ email: emailHelper, password });

  const { data: prop, error: propErr } = await helperSb
    .from("proposals")
    .insert({
      request_id: requestId,
      helper_id: helperCreated.user.id,
      price: 55.0,
      description: "I'll deliver a polished 6-page paper with full citations.",
      revisions_included: 2,
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    })
    .select("id, price")
    .single();
  if (propErr) throw new Error(`insert proposal: ${propErr.message}`);
  proposalId = prop.id;
  console.log("3. helper proposed at $", prop.price);

  const { error: advErr } = await helperSb
    .from("requests")
    .update({ status: "proposal_sent" })
    .eq("id", requestId);
  if (advErr) throw new Error(`advance request: ${advErr.message}`);
  console.log("4. request -> proposal_sent");

  // 5. Student accepts (mirrors lib/orders.ts acceptProposal)
  const { data: o, error: oErr } = await sb
    .from("orders")
    .insert({
      proposal_id: proposalId,
      student_id: studentCreated.user.id,
      helper_id: helperCreated.user.id,
      status: "payment_pending",
      price: prop.price,
      deadline: ins.deadline,
    })
    .select("id, status, student_id, helper_id, price")
    .single();
  if (oErr) throw new Error(`insert order: ${oErr.message}`);
  orderId = o.id;

  const { error: reqErr } = await sb
    .from("requests")
    .update({ status: "accepted" })
    .eq("id", requestId);
  if (reqErr) throw new Error(`accept request: ${reqErr.message}`);

  const { error: propAccErr } = await sb
    .from("proposals")
    .update({ status: "accepted" })
    .eq("id", proposalId);
  if (propAccErr) throw new Error(`accept proposal: ${propAccErr.message}`);

  if (o.status !== "payment_pending") throw new Error("order not payment_pending");
  if (Number(o.price) !== prop.price) throw new Error("order price mismatch");
  const { data: reqAfter } = await sb.from("requests").select("status").eq("id", requestId).single();
  const { data: propAfter } = await sb.from("proposals").select("status").eq("id", proposalId).single();
  if (reqAfter.status !== "accepted" || propAfter.status !== "accepted") {
    throw new Error("request/proposal not accepted");
  }
  console.log("5. order created (payment_pending); request + proposal -> accepted");

  // 6. Duplicate accept blocked: a second order is rejected by RLS (proposal must be from own request + unique proposal)
  const { error: dupOrderErr } = await sb
    .from("orders")
    .insert({
      proposal_id: proposalId,
      student_id: studentCreated.user.id,
      helper_id: helperCreated.user.id,
      status: "payment_pending",
      price: prop.price,
      deadline: ins.deadline,
    });
  if (!dupOrderErr) throw new Error("second order for same proposal should be blocked");
  console.log("6. duplicate order blocked (unique proposal_id)");

  // 7. Simulate checkout completion (webhook/confirmed page server logic)
  const { error: upErr } = await admin
    .from("orders")
    .update({ status: "in_progress" })
    .eq("id", orderId);
  if (upErr) throw new Error(`finalize order: ${upErr.message}`);
  const { error: payErr } = await admin.from("payments").insert({
    order_id: orderId,
    amount: prop.price,
    stripe_payment_intent_id: `pi_test_${Math.random().toString(36).slice(2)}`,
    status: "paid",
  });
  if (payErr) throw new Error(`insert payment: ${payErr.message}`);
  const { data: paidCheck } = await sb.from("orders").select("status").eq("id", orderId).single();
  if (paidCheck.status !== "in_progress") throw new Error("order not in_progress after payment");
  console.log("7. order -> in_progress (payment finalized)");

  // 8. Chat: student sends, helper reads; helper replies
  const { error: msgErr } = await sb
    .from("messages")
    .insert({ order_id: orderId, sender_id: studentCreated.user.id, body: "Happy to start! When can you deliver?" });
  if (msgErr) throw new Error(`send message (student): ${msgErr.message}`);
  const { data: msgs } = await helperSb
    .from("messages")
    .select("id, body, sender_id")
    .eq("order_id", orderId);
  if (!(msgs ?? []).some((m) => m.sender_id === studentCreated.user.id && m.body.includes("When can you deliver"))) {
    throw new Error("helper cannot read student message");
  }
  const { error: msgErr2 } = await helperSb
    .from("messages")
    .insert({ order_id: orderId, sender_id: helperCreated.user.id, body: "By Friday evening." });
  if (msgErr2) throw new Error(`send message (helper): ${msgErr2.message}`);
  const { data: msgs2 } = await sb
    .from("messages")
    .select("id")
    .eq("order_id", orderId);
  if (!(msgs2 ?? []).some((m) => true)) throw new Error("student cannot read conversation");
  console.log("8. chat works both directions (student<->helper)");

  // 9. Helper delivers a file via storage + delivery row, then marks order delivered
  const uploader = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  await uploader.auth.signInWithPassword({ email: emailHelper, password });
  const path = `${orderId}/e2e/draft.txt`;
  const { error: stErr } = await uploader.storage
    .from("order-files")
    .upload(path, new Uint8Array(Buffer.from("Phase 4-6 e2e deliverable")), {
      contentType: "text/plain",
      upsert: true,
    });
  if (stErr) throw new Error(`upload file: ${stErr.message}`);
  const fileUrl = `${url}/storage/v1/object/public/order-files/${path}`;

  const { error: delErr } = await helperSb
    .from("deliveries")
    .insert({ order_id: orderId, message: "First draft attached.", file_urls: [fileUrl] });
  if (delErr) throw new Error(`insert delivery: ${delErr.message}`);
  const { error: deliveredErr } = await helperSb
    .from("orders")
    .update({ status: "delivered" })
    .eq("id", orderId)
    .eq("status", "in_progress");
  if (deliveredErr) throw new Error(`mark delivered: ${deliveredErr.message}`);
  console.log("9. helper uploaded file + submitted delivery -> delivered");

  // verify public file URL fetches (bucket is public)
  const resp = await fetch(fileUrl);
  if (!resp.ok) throw new Error(`public file not fetchable: ${resp.status}`);

  // 10. Student requests a change -> revision_requested
  const { error: revErr } = await sb
    .from("orders")
    .update({ status: "revision_requested" })
    .eq("id", orderId)
    .eq("status", "delivered");
  if (revErr) throw new Error(`request revision: ${revErr.message}`);
  const { data: o2 } = await admin.from("orders").select("status").eq("id", orderId).single();
  if (o2.status !== "revision_requested") throw new Error("revision not applied");
  console.log("10. student requested a revision ->", o2.status);

  // 11. Helper redelivers; student accepts & completes
  const { error: delErr2 } = await helperSb
    .from("deliveries")
    .insert({ order_id: orderId, message: "Revised per your notes.", file_urls: [] });
  if (delErr2) throw new Error(`insert revision delivery: ${delErr2.message}`);
  const { error: deliveredErr2 } = await helperSb
    .from("orders")
    .update({ status: "delivered" })
    .eq("id", orderId)
    .eq("status", "revision_requested");
  if (deliveredErr2) throw new Error(`redeliver: ${deliveredErr2.message}`);
  const { error: compErr } = await sb
    .from("orders")
    .update({ status: "completed" })
    .eq("id", orderId)
    .eq("status", "delivered");
  if (compErr) throw new Error(`complete: ${compErr.message}`);
  const { data: o3 } = await admin.from("orders").select("status").eq("id", orderId).single();
  if (o3.status !== "completed") throw new Error("order not completed");
  console.log("11. redelivered -> student accepted & completed");

  // 12. Student leaves a review -> helper rating recalculated
  const { error: revInsErr } = await sb
    .from("reviews")
    .insert({ order_id: orderId, rating: 5, comment: "Excellent work, on time." });
  if (revInsErr) throw new Error(`insert review: ${revInsErr.message}`);
  const { data: hp } = await admin
    .from("helper_profiles")
    .select("rating_avg")
    .eq("user_id", helperCreated.user.id)
    .maybeSingle();
  if (!hp || Number(hp.rating_avg) !== 5) {
    throw new Error(`rating not recalculated: ${JSON.stringify(hp)}`);
  }
  console.log(`12. review stored; helper avg rating -> ${hp.rating_avg}`);

  // 13. RLS: an unrelated third party cannot read order chat/deliveries/review the order again
  const { data: third, error: thirdErr } = await admin.auth.admin.createUser({
    email: `p4.third.${Date.now()}@peercraft.test`, password, email_confirm: true,
    user_metadata: { name: "P4 Third", role: "student" },
  });
  if (thirdErr) throw new Error(`create third user: ${thirdErr.message}`);
  thirdCreated = third;
  const thirdSb = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  await thirdSb.auth.signInWithPassword({ email: third.user.email, password });
  const { data: thirdMsgs } = await thirdSb.from("messages").select("id").eq("order_id", orderId);
  if ((thirdMsgs ?? []).length > 0) throw new Error("third party can read order messages!");
  const { data: thirdDels } = await thirdSb.from("deliveries").select("id").eq("order_id", orderId);
  if ((thirdDels ?? []).length > 0) throw new Error("third party can read order deliveries!");
  const { error: thirdOrderErr } = await thirdSb
    .from("orders")
    .update({ status: "disputed" })
    .eq("id", orderId);
  const { data: statusAfter } = await admin
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();
  if (statusAfter.status !== "completed") {
    throw new Error(`third party updated the order! status=${statusAfter.status}`);
  }
  console.log("13. RLS: third party blocked from chat/deliveries/order-mutation");

  // cleanup
  await uploader.storage.from("order-files").remove([`${orderId}/e2e/draft.txt`]).then(() => {});
  await admin.from("reviews").delete().eq("order_id", orderId);
  await admin.from("deliveries").delete().eq("order_id", orderId);
  await admin.from("messages").delete().eq("order_id", orderId);
  await admin.from("payments").delete().eq("order_id", orderId);
  await admin.from("orders").delete().eq("id", orderId);
  await admin.from("proposals").delete().eq("id", proposalId);
  await admin.from("requests").delete().eq("id", requestId);
  await admin.from("helper_profiles").delete().eq("user_id", helperCreated.user.id);
  if (thirdCreated) await admin.auth.admin.deleteUser(thirdCreated.user.id);
  await admin.auth.admin.deleteUser(studentCreated.user.id);
  await admin.auth.admin.deleteUser(helperCreated.user.id);
  console.log("14. cleaned up. ALL PHASE 4-6 CHECKS PASS");
})().catch(async (e) => {
  console.error("FAILED:", e.message);
  if (requestId) await admin.from("requests").delete().eq("id", requestId).then(() => {});
  if (proposalId) await admin.from("proposals").delete().eq("id", proposalId).then(() => {});
  if (orderId) {
    await admin.from("reviews").delete().eq("order_id", orderId).then(() => {});
    await admin.from("deliveries").delete().eq("order_id", orderId).then(() => {});
    await admin.from("messages").delete().eq("order_id", orderId).then(() => {});
    await admin.from("payments").delete().eq("order_id", orderId).then(() => {});
    await admin.from("orders").delete().eq("id", orderId).then(() => {});
    await admin.storage.from("order-files").remove([`${orderId}/e2e/draft.txt`]).catch(() => {});
  }
  if (thirdCreated) await admin.auth.admin.deleteUser(thirdCreated.user.id).then(() => {});
  if (studentCreated) await admin.auth.admin.deleteUser(studentCreated.user.id).then(() => {});
  if (helperCreated) await admin.auth.admin.deleteUser(helperCreated.user.id).then(() => {});
  process.exit(1);
});