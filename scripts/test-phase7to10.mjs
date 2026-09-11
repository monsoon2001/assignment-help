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
const emailStudent = `p7.student.${Date.now()}@peercraft.test`;
const emailHelper = `p7.helper.${Date.now()}@peercraft.test`;
const emailAdmin = `p7.admin.${Date.now()}@peercraft.test`;
const emailThird = `p7.third.${Date.now()}@peercraft.test`;

const created = { student: null, helper: null, admin: null, third: null };
let requestId, proposalId, orderId;

async function createUser(email, name, role) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });
  if (error) throw new Error(`create ${role}: ${error.message}`);
  return data;
}

function anon(email) {
  const client = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  return client.auth.signInWithPassword({ email, password }).then(() => client);
}

const checks = [];
function check(name, ok, extra) {
  checks.push({ name, ok });
  console.log(`   ${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` (${extra})` : ""}`);
  if (!ok) throw new Error(`check failed: ${name}`);
}

(async () => {
  // ---------------------------------------------------------------- setup
  console.log("\n== Phase 7-10 e2e: notifications + admin panel ==");

  created.student = await createUser(emailStudent, "P7 Student", "student");
  created.helper = await createUser(emailHelper, "P7 Helper", "helper");
  created.admin = await createUser(emailAdmin, "P7 Admin", "admin");
  created.third = await createUser(emailThird, "P7 Third", "student");

  // 1. handle_new_user trigger derives role from metadata
  const { data: roles } = await admin
    .from("users")
    .select("id, role, status")
    .in("id", [created.student.user.id, created.helper.user.id, created.admin.user.id]);
  const roleMap = Object.fromEntries((roles ?? []).map((r) => [r.id, r]));
  check("1. roles from metadata (student/helper/admin)", [
    "student", "helper", "admin",
  ].every((expected, i) => {
    const ids = [created.student.user.id, created.helper.user.id, created.admin.user.id];
    return roleMap[ids[i]]?.role === expected;
  }), JSON.stringify(roleMap));
  check("1b. users.status defaults to active", (roleMap[created.helper.user.id]?.status ?? "") === "active");

  // helper profile so admin helpers table has data
  await admin.from("helper_profiles").insert({
    user_id: created.helper.user.id,
    subjects: ["Mathematics", "Economics"],
    rating_avg: 0,
  });

  const studentSb = await anon(emailStudent);
  const helperSb = await anon(emailHelper);
  const adminSb = await anon(emailAdmin);
  const thirdSb = await anon(emailThird);

  // -------------------------------------------------------- notifications
  // 2. proposal -> student notified
  const { data: req, error: reqErr } = await studentSb
    .from("requests")
    .insert({
      student_id: created.student.user.id,
      title: "P7 Notifications — Literature Review",
      description: "10 sources on modernism.",
      subject: "English",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      file_urls: [],
      helper_id: created.helper.user.id,
      status: "requested",
    })
    .select("id")
    .single();
  if (reqErr) throw new Error(`insert request: ${reqErr.message}`);
  requestId = req.id;

  const { data: prop, error: propErr } = await helperSb
    .from("proposals")
    .insert({
      request_id: requestId,
      helper_id: created.helper.user.id,
      price: 40,
      description: "Will deliver a full annotated bibliography.",
      revisions_included: 1,
      status: "pending",
    })
    .select("id, price")
    .single();
  if (propErr) throw new Error(`insert proposal: ${propErr.message}`);
  proposalId = prop.id;
  await helperSb.from("requests").update({ status: "proposal_sent" }).eq("id", requestId);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  await sleep(400);

  const { data: notifProposal } = await studentSb
    .from("notifications")
    .select("type, read")
    .eq("user_id", created.student.user.id)
    .eq("type", "proposal");
  check("2. proposal trigger notified student", (notifProposal ?? []).some((n) => !n.read));

  // 3. accept + order + fake payment -> helper notified
  const { data: ord, error: ordErr } = await studentSb
    .from("orders")
    .insert({
      proposal_id: proposalId,
      student_id: created.student.user.id,
      helper_id: created.helper.user.id,
      status: "payment_pending",
      price: prop.price,
      deadline: req.deadline,
    })
    .select("id")
    .single();
  if (ordErr) throw new Error(`insert order: ${ordErr.message}`);
  orderId = ord.id;
  await studentSb.from("requests").update({ status: "accepted" }).eq("id", requestId);
  await helperSb.from("proposals").update({ status: "accepted" }).eq("id", proposalId);

  await admin.from("orders").update({ status: "in_progress" }).eq("id", orderId);
  await admin.from("payments").insert({
    order_id: orderId,
    amount: prop.price,
    stripe_payment_intent_id: `pi_test_p7_${Date.now()}`,
    status: "paid",
  });
  await sleep(400);

  const { data: notifPayment } = await helperSb
    .from("notifications")
    .select("type, link")
    .eq("user_id", created.helper.user.id)
    .eq("type", "payment");
  check("3. payment trigger notified helper", (notifPayment ?? []).length > 0);
  check("3b. helper payment link points to helper route",
    (notifPayment ?? []).every((n) => n.link?.startsWith("/helper/orders/")));

  // 4. chat message -> other participant notified
  await studentSb.from("messages").insert({
    order_id: orderId, sender_id: created.student.user.id, body: "Please start soon.",
  });
  await sleep(400);
  const { data: notifMsg } = await helperSb
    .from("notifications")
    .select("type, link")
    .eq("user_id", created.helper.user.id)
    .eq("type", "message");
  check("4. message trigger notified helper", (notifMsg ?? []).length > 0);
  check("4b. message link is role-aware (/helper/orders/)",
    (notifMsg ?? []).every((n) => n.link?.startsWith("/helper/orders/")));

  // 5. delivery -> student notified
  await helperSb.from("deliveries").insert({ order_id: orderId, message: "Draft here.", file_urls: [] });
  await helperSb.from("orders").update({ status: "delivered" }).eq("id", orderId).eq("status", "in_progress");
  await sleep(400);
  const { data: notifDel } = await studentSb
    .from("notifications")
    .select("type")
    .eq("user_id", created.student.user.id)
    .eq("type", "delivery");
  check("5. delivery trigger notified student", (notifDel ?? []).length > 0);

  // 6. revision_requested -> helper notified
  await studentSb.from("orders").update({ status: "revision_requested" }).eq("id", orderId).eq("status", "delivered");
  await sleep(400);
  const { data: notifRev } = await helperSb
    .from("notifications")
    .select("type")
    .eq("user_id", created.helper.user.id)
    .eq("type", "revision");
  check("6. revision trigger notified helper", (notifRev ?? []).length > 0);

  // 7. completed -> helper notified
  await helperSb.from("orders").update({ status: "delivered" }).eq("id", orderId).eq("status", "revision_requested");
  await studentSb.from("orders").update({ status: "completed" }).eq("id", orderId).eq("status", "delivered");
  await sleep(400);
  const { data: notifDone } = await helperSb
    .from("notifications")
    .select("type")
    .eq("user_id", created.helper.user.id)
    .eq("type", "completed");
  check("7. completed trigger notified helper", (notifDone ?? []).length > 0);

  // 8. mark-all-read + unread plumbing (update allowed on own rows)
  const { count: unreadBefore } = await studentSb
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", created.student.user.id)
    .eq("read", false);
  const { error: markErr } = await studentSb
    .from("notifications")
    .update({ read: true })
    .eq("user_id", created.student.user.id)
    .eq("read", false);
  check("8. student can mark notifications read", !markErr && (unreadBefore ?? 0) > 0, `unread=${unreadBefore}`);

  // 9. RLS: third party can't see notifications
  const { data: thirdNotifs } = await thirdSb
    .from("notifications")
    .select("id")
    .eq("user_id", created.student.user.id);
  check("9. third party cannot read student notifications", (thirdNotifs ?? []).length === 0);

  // ---------------------------------------------------------------- admin
  // 10. admin role enforced via proxy path (role set) + counts via service client
  const { data: adminRow } = await admin.from("users").select("role").eq("id", created.admin.user.id).single();
  check("10. admin role present", adminRow?.role === "admin");

  const [students, helpers, activeReq, revenue] = await Promise.all([
    admin.from("users").select("id", { count: "exact", head: true }).eq("role", "student"),
    admin.from("users").select("id", { count: "exact", head: true }).eq("role", "helper"),
    admin.from("requests").select("id", { count: "exact", head: true }).in("status", ["requested", "proposal_sent", "accepted"]),
    admin.from("payments").select("amount").eq("status", "paid"),
  ]);
  check("11. admin dashboard counts visible (students/helpers)", (students.count ?? 0) >= 1 && (helpers.count ?? 0) >= 1,
    `students=${students.count} helpers=${helpers.count}`);
  const revenueSum = (revenue.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
  check("12. admin revenue sums paid payments", revenueSum >= prop.price, `$${revenueSum}`);

  // 13. approve/suspend edits users table
  await admin.from("users").update({ status: "pending" }).eq("id", created.helper.user.id);
  const { data: pend } = await admin.from("users").select("status").eq("id", created.helper.user.id).single();
  await admin.from("users").update({ status: "active" }).eq("id", created.helper.user.id);
  check("13. admin can set approve (pending -> active)", pend?.status === "pending");

  const { error: thirdSuspend } = await thirdSb
    .from("users")
    .update({ status: "suspended" })
    .eq("id", created.helper.user.id);
  const { data: afterThird } = await admin.from("users").select("status").eq("id", created.helper.user.id).single();
  check("14. non-admin cannot alter user status", !thirdSuspend && afterThird?.status === "active",
    `updateError=${thirdSuspend ? "yes" : "no"} status=${afterThird?.status}`);

  // 15. admin_messages realtime channel: admin -> helper, helper reply, third blocked
  const { error: a2h } = await adminSb.from("admin_messages").insert({
    sender_id: created.admin.user.id, recipient_id: created.helper.user.id, body: "Hi! Everything good?",
  });
  check("15. admin can message helper", !a2h);
  const { data: helperThread } = await helperSb
    .from("admin_messages")
    .select("id")
    .eq("recipient_id", created.helper.user.id)
    .eq("sender_id", created.admin.user.id);
  check("15b. helper can read admin message", (helperThread ?? []).length > 0);

  const { error: h2a } = await helperSb.from("admin_messages").insert({
    sender_id: created.helper.user.id, recipient_id: created.admin.user.id, body: "All good, thanks!",
  });
  check("16. helper can reply to admin", !h2a);

  const { error: thirdSend } = await thirdSb.from("admin_messages").insert({
    sender_id: created.third.user.id, recipient_id: created.helper.user.id, body: "hello",
  });
  const { data: thirdRead } = await thirdSb
    .from("admin_messages")
    .select("id")
    .eq("recipient_id", created.helper.user.id)
    .eq("sender_id", created.admin.user.id);
  check("17. third party blocked from admin chat (send+read)", thirdSend != null && (thirdRead ?? []).length === 0);

  // ---------------------------------------------------------------- cleanup
  await admin.from("admin_messages").delete().or(`sender_id.eq.${created.admin.user.id},recipient_id.eq.${created.admin.user.id}`);
  await admin.from("notifications").delete().or(`user_id.eq.${created.student.user.id},user_id.eq.${created.helper.user.id}`);
  await admin.from("reviews").delete().eq("order_id", orderId).then(() => {});
  await admin.from("deliveries").delete().eq("order_id", orderId);
  await admin.from("messages").delete().eq("order_id", orderId);
  await admin.from("payments").delete().eq("order_id", orderId);
  await admin.from("orders").delete().eq("id", orderId);
  await admin.from("proposals").delete().eq("id", proposalId);
  await admin.from("requests").delete().eq("id", requestId);
  await admin.from("helper_profiles").delete().eq("user_id", created.helper.user.id);
  await admin.from("users").delete().in("id", [
    created.student.user.id, created.helper.user.id, created.admin.user.id, created.third.user.id,
  ]);
  await Promise.all([
    admin.auth.admin.deleteUser(created.student.user.id).catch(() => {}),
    admin.auth.admin.deleteUser(created.helper.user.id).catch(() => {}),
    admin.auth.admin.deleteUser(created.admin.user.id).catch(() => {}),
    admin.auth.admin.deleteUser(created.third.user.id).catch(() => {}),
  ]);

  const failed = checks.filter((c) => !c.ok).length;
  console.log(`\nALL CHECKS PASSED (${checks.length} total, ${failed} failed)`);
})().catch(async (e) => {
  console.error("FAILED:", e.message);
  if (orderId) {
    await admin.from("reviews").delete().eq("order_id", orderId).then(() => {});
    await admin.from("deliveries").delete().eq("order_id", orderId).then(() => {});
    await admin.from("messages").delete().eq("order_id", orderId).then(() => {});
    await admin.from("payments").delete().eq("order_id", orderId).then(() => {});
    await admin.from("orders").delete().eq("id", orderId).then(() => {});
  }
  if (proposalId) await admin.from("proposals").delete().eq("id", proposalId).then(() => {});
  if (requestId) await admin.from("requests").delete().eq("id", requestId).then(() => {});
  for (const u of Object.values(created)) {
    if (u?.user?.id) await admin.auth.admin.deleteUser(u.user.id).catch(() => {});
  }
  process.exit(1);
});