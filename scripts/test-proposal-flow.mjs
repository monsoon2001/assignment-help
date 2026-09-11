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
const emailStudent = `p3.student.${Date.now()}@peercraft.test`;
const emailHelper = `p3.helper.${Date.now()}@peercraft.test`;

let studentCreated;
let helperCreated;
let requestId;
let proposalId;

(async () => {
  // 1. Create student + helper users
  const { data: cS, error: eS } = await admin.auth.admin.createUser({
    email: emailStudent, password, email_confirm: true,
    user_metadata: { name: "P3 Student", role: "student" },
  });
  if (eS) throw new Error(`create student: ${eS.message}`);
  studentCreated = cS;

  const { data: cH, error: eH } = await admin.auth.admin.createUser({
    email: emailHelper, password, email_confirm: true,
    user_metadata: { name: "P3 Helper", role: "helper" },
  });
  if (eH) throw new Error(`create helper: ${eH.message}`);
  helperCreated = cH;
  console.log("1. created student + helper");

  // 2. Student signs in and creates a request
  const sb = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  await sb.auth.signInWithPassword({ email: emailStudent, password });

  const { data: inserted, error: insErr } = await sb
    .from("requests")
    .insert({
      student_id: studentCreated.user.id,
      title: "P3 Proposal Flow — Sociology Essay",
      description: "Need a proposal so I can review it on My Requests.",
      subject: "Sociology",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      file_urls: [],
      helper_id: helperCreated.user.id,
      status: "requested",
    })
    .select("id, status")
    .single();
  if (insErr) throw new Error(`insert request: ${insErr.message}`);
  requestId = inserted.id;
  console.log("2. student created request:", requestId);

  // 3. Helper signs in, sees open requests, submits proposal (RLS insert)
  const helperSb = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  await helperSb.auth.signInWithPassword({ email: emailHelper, password });

  const { data: open } = await helperSb
    .from("requests")
    .select("id, status")
    .eq("status", "requested")
    .eq("id", requestId);
  if (!(open ?? []).some((r) => r.id === requestId)) {
    throw new Error("helper cannot see open request");
  }
  console.log("3. helper sees open request");

  const { data: prop, error: propErr } = await helperSb
    .from("proposals")
    .insert({
      request_id: requestId,
      helper_id: helperCreated.user.id,
      price: 42.0,
      description: "I'll structure, edit, and polish your sociology essay.",
      revisions_included: 2,
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    })
    .select("id, price, revisions_included")
    .single();
  if (propErr) throw new Error(`insert proposal: ${propErr.message}`);
  proposalId = prop.id;
  console.log("4. helper inserted proposal:", prop.id, "$" + prop.price, prop.revisions_included, "revs");

  // 5. Helper flips request to proposal_sent (new RLS policy)
  const { data: updated, error: updErr } = await helperSb
    .from("requests")
    .update({ status: "proposal_sent" })
    .eq("id", requestId)
    .select("id, status")
    .single();
  if (updErr) throw new Error(`flip status: ${updErr.message}`);
  if (updated.status !== "proposal_sent") throw new Error("status not proposal_sent");
  console.log("5. helper advanced request ->", updated.status);

  // 6. Duplicate proposal blocked by unique(request_id, helper_id)
  const { error: dupErr } = await helperSb
    .from("proposals")
    .insert({
      request_id: requestId,
      helper_id: helperCreated.user.id,
      price: 99.0,
      description: "duplicate",
    });
  if (!dupErr || dupErr.code !== "23505") {
    throw new Error(`expected unique violation, got: ${dupErr?.code || "no error"}`);
  }
  console.log("6. duplicate proposal blocked (unique constraint)");

  // 7. Student (browser client) sees the proposal with helper name joined
  const { data: proposals } = await sb
    .from("proposals")
    .select("id, request_id, price, description, revisions_included, expires_at, helper:users(id, name)")
    .eq("request_id", requestId);
  const seen = (proposals ?? []).find((p) => p.id === proposalId);
  if (!seen) throw new Error("student cannot see proposal");
  const name = Array.isArray(seen.helper) ? seen.helper[0]?.name : seen.helper?.name;
  console.log("7. student sees proposal from", name, "at $", seen.price);

  // cleanup
  await admin.from("proposals").delete().eq("id", proposalId);
  await admin.from("requests").delete().eq("id", requestId);
  await admin.auth.admin.deleteUser(studentCreated.user.id);
  await admin.auth.admin.deleteUser(helperCreated.user.id);
  console.log("8. cleaned up. PASS");
})().catch(async (e) => {
  console.error("FAILED:", e.message);
  if (requestId) await admin.from("requests").delete().eq("id", requestId).then(() => {});
  if (proposalId) await admin.from("proposals").delete().eq("id", proposalId).then(() => {});
  if (studentCreated) await admin.auth.admin.deleteUser(studentCreated.user.id).then(() => {});
  if (helperCreated) await admin.auth.admin.deleteUser(helperCreated.user.id).then(() => {});
  process.exit(1);
});