/**
 * Security regression checks for the audit fixes in
 * supabase/migrations/20261010000001_business_flow_hardening.sql and the
 * signed-URL file access path.
 *
 * RUN AGAINST A DEV/STAGING PROJECT ONLY (never production):
 *   1. supabase db push            # apply the new migration
 *   2. npm run dev                 # API signed-URL test needs localhost:3000
 *   3. node scripts/test-security-audit.mjs
 *
 * Uses .env.local for credentials, mirroring scripts/test-rbac.mjs.
 */
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

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function createUser(role, tag) {
  const email = `audit.${role}.${tag}@acadivo.test`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "TestPass123!",
    email_confirm: true,
    user_metadata: { name: `Audit ${role}` },
  });
  if (error) throw error;
  await admin.from("users").update({ role }).eq("id", data.user.id);
  const client = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  const { error: signErr } = await client.auth.signInWithPassword({
    email,
    password: "TestPass123!",
  });
  if (signErr) throw signErr;
  return { id: data.user.id, client };
}

(async () => {
  const tag = Date.now();
  const studentA = await createUser("student", `a${tag}`);
  const studentB = await createUser("student", `b${tag}`);
  const helper = await createUser("helper", `h${tag}`);

  // 1. Student creates a request targeted at a real helper.
  const { data: request, error: reqErr } = await studentA.client
    .from("requests")
    .insert({ student_id: studentA.id, helper_id: helper.id, title: "Audit request", status: "requested" })
    .select("id")
    .single();
  check("student can create targeted request", !reqErr && !!request, reqErr?.message);

  // 2. Student can read their OWN request (regression for the dropped policy).
  const { data: ownReq } = await studentA.client
    .from("requests")
    .select("id")
    .eq("id", request.id)
    .maybeSingle();
  check("student can read own request", !!ownReq);

  // 3. Another student cannot read it.
  const { data: otherReq } = await studentB.client
    .from("requests")
    .select("id")
    .eq("id", request.id)
    .maybeSingle();
  check("other student cannot read request", !otherReq);

  // 4. Helper proposes, student accepts, helper must not be able to reprice.
  const { data: proposal, error: propErr } = await helper.client
    .from("proposals")
    .insert({ request_id: request.id, helper_id: helper.id, price: 100, currency: "USD", status: "pending" })
    .select("id")
    .single();
  check("helper can propose on assigned request", !propErr && !!proposal, propErr?.message);

  await studentA.client.from("proposals").update({ status: "accepted" }).eq("id", proposal.id);
  await helper.client
    .from("proposals")
    .update({ price: 5000 })
    .eq("id", proposal.id)
    .select("id");
  const { data: stillPriced } = await admin
    .from("proposals")
    .select("price")
    .eq("id", proposal.id)
    .single();
  check(
    "accepted proposal is frozen (helper cannot reprice)",
    Number(stillPriced?.price) === 100,
    `price=${stillPriced?.price}`
  );

  // 5. Student creates the order, then cannot force unpaid statuses.
  const { data: order, error: orderErr } = await studentA.client
    .from("orders")
    .insert({
      proposal_id: proposal.id,
      student_id: studentA.id,
      helper_id: helper.id,
      status: "payment_pending",
      price: 100,
      currency: "USD",
    })
    .select("id")
    .single();
  check("student can create order from own proposal", !orderErr && !!order, orderErr?.message);

  if (order) {
    const { error: skipPayErr } = await studentA.client
      .from("orders")
      .update({ status: "completed" })
      .eq("id", order.id)
      .select("id");
    check("cannot complete an unpaid order", !!skipPayErr, skipPayErr ? "blocked" : "ALLOWED");

    const { error: reviewErr } = await studentA.client
      .from("reviews")
      .insert({ order_id: order.id, rating: 5, comment: "self review" });
    check("cannot review an unpaid order", !!reviewErr, reviewErr ? "blocked" : "ALLOWED");
  }

  // 6. Signed-URL endpoint refuses non-participants.
  try {
    const res = await fetch(
      `${BASE}/api/files/url?bucket=request-files&path=${encodeURIComponent(`${helper.id}/x/y.pdf`)}`,
      { headers: { cookie: "" } }
    );
    check("signed-url endpoint rejects anonymous", res.status === 401 || res.status === 403, `status ${res.status}`);
  } catch {
    console.log("SKIP  signed-url endpoint (dev server not running)");
  }
  const { data: sessionA } = await studentA.client.auth.getSession();
  if (sessionA?.session) {
    const res = await fetch(
      `${BASE}/api/files/url?bucket=request-files&path=${encodeURIComponent(`${helper.id}/secret/paper.pdf`)}`,
      { headers: { Authorization: `Bearer ${sessionA.session.access_token}` } }
    );
    check(
      "signed-url endpoint rejects non-participant file",
      res.status === 401 || res.status === 403,
      `status ${res.status}`
    );
  }

  await admin.auth.admin.deleteUser(studentA.id);
  await admin.auth.admin.deleteUser(studentB.id);
  await admin.auth.admin.deleteUser(helper.id);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) process.exit(1);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});