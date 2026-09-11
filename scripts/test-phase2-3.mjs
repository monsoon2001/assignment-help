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
const emailStudent = `p10.student.${Date.now()}@peercraft.test`;
const emailHelperA = `p10.helpera.${Date.now()}@peercraft.test`;
const emailHelperB = `p10.helperb.${Date.now()}@peercraft.test`;

let studentCreated;
let helperA;
let helperB;
let requestId;
let proposalId;

const anon = (email) => {
  const c = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  return c.auth.signInWithPassword({ email, password }).then(() => c);
};

(async () => {
  // 1. Create a student + two helpers
  const { data: cS, error: eS } = await admin.auth.admin.createUser({
    email: emailStudent, password, email_confirm: true,
    user_metadata: { name: "P10 Student", role: "student" },
  });
  if (eS) throw new Error(`create student: ${eS.message}`);
  studentCreated = cS;

  const { data: cA, error: eA } = await admin.auth.admin.createUser({
    email: emailHelperA, password, email_confirm: true,
    user_metadata: { name: "P10 Helper A", role: "helper" },
  });
  if (eA) throw new Error(`create helper A: ${eA.message}`);
  helperA = cA;

  const { data: cB, error: eB } = await admin.auth.admin.createUser({
    email: emailHelperB, password, email_confirm: true,
    user_metadata: { name: "P10 Helper B", role: "helper" },
  });
  if (eB) throw new Error(`create helper B: ${eB.message}`);
  helperB = cB;
  console.log("1. created student + helper A + helper B");

  await admin.from("helper_profiles").insert({
    user_id: helperA.user.id, subjects: ["History"], rating_avg: 4.8, bio: "History tutor.",
  });
  await admin.from("helper_profiles").insert({
    user_id: helperB.user.id, subjects: ["History"], rating_avg: 4.5, bio: "History grader.",
  });

  // 2. Student creates a TARGETED request (helper_id set) — sent_at auto-set
  const sb = await anon(emailStudent);
  const { data: req, error: insErr } = await sb
    .from("requests")
    .insert({
      student_id: studentCreated.user.id,
      helper_id: helperA.user.id,
      title: "P10 — History 201 Essay",
      description: "Need help drafting a thesis for American Civilization.",
      subject: "History",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      file_urls: [],
      status: "requested",
    })
    .select("id, status, helper_id, sent_at")
    .single();
  if (insErr) throw new Error(`insert targeted request: ${insErr.message}`);
  requestId = req.id;
  if (req.helper_id !== helperA.user.id) throw new Error("helper_id not stored");
  if (!req.sent_at) throw new Error("sent_at not auto-set");
  const sentAt1 = new Date(req.sent_at).getTime();
  console.log("2. targeted request created (helper_id + sent_at):", requestId);

  // 3. Assigned helper sees it; unassigned helper B does NOT
  const helperSbA = await anon(emailHelperA);
  const helperSbB = await anon(emailHelperB);

  const { data: seenA } = await helperSbA.from("requests").select("id, status, sent_at").eq("id", requestId);
  if (!(seenA ?? []).some((r) => r.id === requestId)) throw new Error("assigned helper cannot see request");

  const { data: seenB } = await helperSbB.from("requests").select("id").eq("id", requestId);
  if ((seenB ?? []).some((r) => r.id === requestId)) throw new Error("unassigned helper sees targeted request");
  console.log("3. targeted visibility: helper A only");

  // 4. Assigned helper proposes; unassigned helper B is blocked by RLS
  const { data: prop, error: propErr } = await helperSbA
    .from("proposals")
    .insert({
      request_id: requestId,
      helper_id: helperA.user.id,
      price: 42.0,
      description: "I'll outline, draft, and polish the essay.",
      revisions_included: 2,
      status: "pending",
    })
    .select("id, price")
    .single();
  if (propErr) throw new Error(`proposal (assigned helper): ${propErr.message}`);
  proposalId = prop.id;
  console.log("4a. assigned helper proposed at $", prop.price);

  const { error: blockedErr } = await helperSbB
    .from("proposals")
    .insert({
      request_id: requestId,
      helper_id: helperB.user.id,
      price: 30.0,
      description: "Should be blocked.",
      status: "pending",
    });
  if (!blockedErr) throw new Error("unassigned helper should not be able to propose");
  console.log("4b. unassigned helper blocked from proposing (RLS):", blockedErr.message);

  const { error: advErr } = await helperSbA.from("requests").update({ status: "proposal_sent" }).eq("id", requestId);
  if (advErr) throw new Error(`advance status: ${advErr.message}`);
  console.log("4c. request -> proposal_sent");

  // 5. Student sees the pending proposal in the conversation
  const { data: proposals } = await sb.from("proposals").select("id, status, price").eq("request_id", requestId);
  const seenProp = (proposals ?? []).find((p) => p.id === proposalId);
  if (!seenProp || seenProp.status !== "pending") throw new Error("student cannot see pending proposal");
  console.log("5. student sees pending proposal at $", seenProp.price);

  // 6. Request-scoped chat: helper sends, student reads, outsider cannot
  const { error: msgErr } = await helperSbA.from("messages").insert({
    request_id: requestId,
    sender_id: helperA.user.id,
    body: "Hi! I can start today — happy to hash out scope first.",
  });
  if (msgErr) throw new Error(`helper send request message: ${msgErr.message}`);

  const { data: msgs } = await sb
    .from("messages")
    .select("id, body, sender_id")
    .eq("request_id", requestId);
  if (!(msgs ?? []).some((m) => m.sender_id === helperA.user.id)) throw new Error("student cannot read request chat");

  const { data: outsiderMsgs } = await helperSbB
    .from("messages")
    .select("id")
    .eq("request_id", requestId);
  if ((outsiderMsgs ?? []).length > 0) throw new Error("outsider can read request chat");
  console.log("6. request chat works: helper + student only");

  // 7. Student re-assigns to helper B after 2h no-response window; sent_at resets
  await new Promise((r) => setTimeout(r, 50));
  const { data: reassigned, error: reErr } = await sb
    .from("requests")
    .update({ helper_id: helperB.user.id, status: "requested" })
    .eq("id", requestId)
    .select("id, helper_id, sent_at, status")
    .single();
  if (reErr) throw new Error(`reassign: ${reErr.message}`);
  const sentAt2 = new Date(reassigned.sent_at).getTime();
  if (reassigned.helper_id !== helperB.user.id) throw new Error("helper_id not updated");
  if (reassigned.status !== "requested") throw new Error("status not reset");
  if (sentAt2 < sentAt1) throw new Error("sent_at not reset");
  console.log("7. reassigned to helper B, sent_at reset");

  const { data: afterReassignA } = await helperSbA.from("requests").select("id").eq("id", requestId);
  if ((afterReassignA ?? []).length > 0) throw new Error("old helper still sees request after reassign");
  const { data: afterReassignB } = await helperSbB.from("requests").select("id").eq("id", requestId);
  if (!(afterReassignB ?? []).some((r) => r.id === requestId)) throw new Error("new helper cannot see request");
  console.log("8. visibility moved to helper B");

  // cleanup
  await admin.from("proposals").delete().eq("id", proposalId);
  await admin.from("requests").delete().eq("id", requestId);
  await admin.from("helper_profiles").delete().eq("user_id", helperA.user.id);
  await admin.from("helper_profiles").delete().eq("user_id", helperB.user.id);
  await admin.auth.admin.deleteUser(studentCreated.user.id);
  await admin.auth.admin.deleteUser(helperA.user.id);
  await admin.auth.admin.deleteUser(helperB.user.id);
  console.log("9. cleaned up. PASS");
})().catch(async (e) => {
  console.error("FAILED:", e.message);
  if (proposalId) await admin.from("proposals").delete().eq("id", proposalId).then(() => {});
  if (requestId) await admin.from("requests").delete().eq("id", requestId).then(() => {});
  if (helperA) await admin.from("helper_profiles").delete().eq("user_id", helperA.user.id).then(() => {});
  if (helperB) await admin.from("helper_profiles").delete().eq("user_id", helperB.user.id).then(() => {});
  if (studentCreated) await admin.auth.admin.deleteUser(studentCreated.user.id).then(() => {});
  if (helperA) await admin.auth.admin.deleteUser(helperA.user.id).then(() => {});
  if (helperB) await admin.auth.admin.deleteUser(helperB.user.id).then(() => {});
  process.exit(1);
});