import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { readFileSync, writeFileSync } from "node:fs";
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
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket },
});

const stamp = Date.now();
const password = "TestPass123!";
const studentEmail = `qa.delivery.student.${stamp}@acadivo.test`;
const helperEmail = `qa.delivery.helper.${stamp}@acadivo.test`;
const adminEmail = `qa.delivery.admin.${stamp}@acadivo.test`;

const created = {
  password,
  users: {},
  orders: {},
  requests: {},
  files: [],
};

async function createUser(email, name, role) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });
  if (error) throw new Error(`create ${role}: ${error.message}`);
  const id = data.user.id;
  const { error: upErr } = await admin
    .from("users")
    .update({ name, role, status: "active" })
    .eq("id", id);
  if (upErr) throw new Error(`update ${role} profile: ${upErr.message}`);
  return { id, email, name };
}

async function upload(orderId, name, bytes) {
  const path = `${orderId}/qa/${name}`;
  const { error } = await admin.storage
    .from("order-files")
    .upload(path, new Uint8Array(Buffer.from(bytes)), {
      contentType: name.endsWith(".pdf") ? "application/pdf" : "text/plain",
      upsert: true,
    });
  if (error) throw new Error(`upload ${name}: ${error.message}`);
  created.files.push(path);
  return `${url}/storage/v1/object/public/order-files/${path}`;
}

async function makeOrder({ key, title, subject, status }) {
  const { data: request, error: reqErr } = await admin
    .from("requests")
    .insert({
      student_id: created.users.student.id,
      helper_id: created.users.helper.id,
      title,
      description: `QA fixture for ${title}.`,
      subject,
      deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      file_urls: [],
      status: "accepted",
    })
    .select("id")
    .single();
  if (reqErr) throw new Error(`request ${key}: ${reqErr.message}`);

  const { data: proposal, error: propErr } = await admin
    .from("proposals")
    .insert({
      request_id: request.id,
      helper_id: created.users.helper.id,
      price: 120,
      currency: "USD",
      description: "QA delivery fixture proposal.",
      revisions_included: 3,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: "accepted",
    })
    .select("id")
    .single();
  if (propErr) throw new Error(`proposal ${key}: ${propErr.message}`);

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      proposal_id: proposal.id,
      student_id: created.users.student.id,
      helper_id: created.users.helper.id,
      status,
      price: 120,
      currency: "USD",
      base_currency: "USD",
      base_amount: 120,
      charge_currency: "USD",
      charge_amount: 120,
      charge_locked_at: new Date().toISOString(),
      deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    })
    .select("id")
    .single();
  if (orderErr) throw new Error(`order ${key}: ${orderErr.message}`);

  const { error: payErr } = await admin.from("payments").insert({
    order_id: order.id,
    amount: 120,
    currency: "USD",
    stripe_payment_intent_id: `pi_qa_${key}_${stamp}`,
    status: "paid",
  });
  if (payErr) throw new Error(`payment ${key}: ${payErr.message}`);

  created.requests[key] = request.id;
  created.orders[key] = order.id;
  return order.id;
}

(async () => {
  created.users.student = await createUser(studentEmail, "QA Student", "student");
  created.users.helper = await createUser(helperEmail, "QA Helper", "helper");
  created.users.admin = await createUser(adminEmail, "QA Admin", "admin");

  const { error: hpErr } = await admin.from("helper_profiles").upsert({
    user_id: created.users.helper.id,
    subjects: ["Economics", "Statistics"],
    skills: ["Editing", "Research"],
    bio: "QA helper profile.",
    hourly_rate: 30,
  });
  if (hpErr) throw new Error(`helper profile: ${hpErr.message}`);

  // 1. Delivered order with history: earlier delivery, change request, revision.
  const historyOrder = await makeOrder({
    key: "history",
    title: "QA Delivery History — Economics Report",
    subject: "Economics",
    status: "delivered",
  });

  const fileA = await upload(historyOrder, "qa-first-draft.pdf", "first draft fixture".repeat(80));
  const fileB = await upload(historyOrder, "qa-final-report.pdf", "final report fixture".repeat(220));
  const fileC = await upload(historyOrder, "qa-review-notes.txt", "review notes fixture".repeat(40));

  const now = Date.now();
  const { error: d1Err } = await admin.from("deliveries").insert({
    order_id: historyOrder,
    message: "First draft attached. Please check the introduction and data section.",
    file_urls: [fileA],
    created_at: new Date(now - 3 * 86400000).toISOString(),
  });
  if (d1Err) throw new Error(`history delivery 1: ${d1Err.message}`);

  const { error: d2Err } = await admin.from("deliveries").insert({
    order_id: historyOrder,
    revision_note:
      "The regression table needs a plain-English explanation and the reference list is missing two sources.",
    file_urls: [],
    created_at: new Date(now - 2 * 86400000).toISOString(),
  });
  if (d2Err) throw new Error(`history revision note: ${d2Err.message}`);

  const { error: d3Err } = await admin.from("deliveries").insert({
    order_id: historyOrder,
    message:
      "Revised after your notes: added the plain-English regression explanation and the two missing references.",
    file_urls: [fileB, fileC],
    created_at: new Date(now - 86400000).toISOString(),
  });
  if (d3Err) throw new Error(`history delivery 2: ${d3Err.message}`);

  // 2. In-progress order with no delivery yet (empty state + helper upload).
  const uploadOrder = await makeOrder({
    key: "upload",
    title: "QA Empty Delivery — Statistics Problem Set",
    subject: "Statistics",
    status: "in_progress",
  });

  // 3. Revision-requested order (student waiting, helper working).
  const revisionOrder = await makeOrder({
    key: "revision",
    title: "QA Revision State — Literature Review",
    subject: "Literature",
    status: "revision_requested",
  });
  const fileD = await upload(revisionOrder, "qa-lit-review.pdf", "literature review fixture".repeat(120));
  await admin.from("deliveries").insert({
    order_id: revisionOrder,
    message: "Initial literature review draft.",
    file_urls: [fileD],
    created_at: new Date(now - 86400000).toISOString(),
  });
  await admin.from("deliveries").insert({
    order_id: revisionOrder,
    revision_note: "Please tighten the methodology critique and add 2024 sources.",
    file_urls: [],
    created_at: new Date(now - 3600000).toISOString(),
  });

  const outPath = process.env.QA_FIXTURES_PATH ?? "/private/var/folders/nl/5v2zw4194zl_zzmyb32h8scr0000gn/T/opencode/qa-delivery-fixtures.json";
  writeFileSync(outPath, JSON.stringify(created, null, 2));
  console.log(JSON.stringify(created, null, 2));
  console.log(`\nWrote ${outPath}`);
})().catch((error) => {
  console.error("FIXTURE SETUP FAILED:", error);
  process.exit(1);
});
