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

const email = `test.student.${Date.now()}@peercraft.test`;
const password = "TestPass123!";

(async () => {
  // 1. Create a confirmed student user
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "E2E Student", role: "student" },
  });
  if (createErr) throw new Error(`createUser: ${createErr.message}`);
  console.log("1. created student:", created.user.id);

  // 2. Sign in as the student using the anon key (browser-like, RLS applies)
  const sb = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  const { error: signInErr } = await sb.auth.signInWithPassword({ email, password });
  if (signInErr) throw new Error(`signIn: ${signInErr.message}`);
  console.log("2. signed in as student");

  // 3. Upload an attachment (simulates the form's file input) into own folder
  const fileName = `requests-hello-${Date.now()}.txt`;
  const fileBlob = new Blob(["peer craft request attachment"], { type: "text/plain" });
  const { data: upload, error: uploadErr } = await sb.storage
    .from("request-files")
    .upload(`${created.user.id}/${fileName}`, fileBlob);
  if (uploadErr) throw new Error(`upload: ${uploadErr.message}`);
  console.log("3. uploaded attachment:", upload.path);

  const { data: pub } = sb.storage.from("request-files").getPublicUrl(upload.path);
  console.log("   public url:", pub.publicUrl);
  const res = await fetch(pub.publicUrl);
  if (!res.ok) throw new Error(`public url not reachable: ${res.status}`);
  console.log("   public url reachable, body:", (await res.text()).trim());

  // 4. Insert a request as the student (what submitRequest does)
  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: inserted, error: insertErr } = await sb
    .from("requests")
    .insert({
      student_id: created.user.id,
      title: "E2E Essay Writing — History 201",
      description: "Verify the full flow works.",
      subject: "History 201 — American Civilization",
      deadline,
      file_urls: [pub.publicUrl],
      status: "requested",
    })
    .select("id, status, file_urls")
    .single();
  if (insertErr) throw new Error(`insert: ${insertErr.message}`);
  console.log("4. inserted request:", inserted.id, inserted.status, inserted.file_urls.length, "file(s)");

  // 5. Read it back (RLS owner read — same as the /requests page does)
  const { data: readBack, error: readErr } = await sb
    .from("requests")
    .select("id, title, status, deadline, created_at")
    .eq("id", inserted.id)
    .single();
  if (readErr) throw new Error(`read back: ${readErr.message}`);
  console.log("5. read back:", readBack.title, "| status:", readBack.status, "| deadline:", readBack.deadline);

  // 6. Verify helper-listing policy allows viewing open requests (not owner)
  const helperEmail = `test.helper.${Date.now()}@peercraft.test`;
  const { data: helper, error: helperErr } = await admin.auth.admin.createUser({
    email: helperEmail,
    password,
    email_confirm: true,
    user_metadata: { name: "E2E Helper", role: "helper" },
  });
  if (helperErr) throw new Error(`create helper: ${helperErr.message}`);
  const helperSb = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  await helperSb.auth.signInWithPassword({ email: helperEmail, password });
  const { data: openRequests } = await helperSb
    .from("requests")
    .select("id, title, status")
    .eq("status", "requested");
  const notVisible = !(openRequests ?? []).some((r) => r.id === inserted.id);
  console.log("6a. helper cannot see unassigned request:", notVisible);

  const { error: assignErr } = await sb
    .from("requests")
    .update({ helper_id: helper.user.id })
    .eq("id", inserted.id);
  if (assignErr) throw new Error(`assign helper: ${assignErr.message}`);
  const { data: openAfter } = await helperSb
    .from("requests")
    .select("id, title, status, helper_id, sent_at")
    .eq("id", inserted.id);
  const found = (openAfter ?? []).some((r) => r.id === inserted.id && r.helper_id === helper.user.id && !!r.sent_at);
  console.log("6b. helper sees request after targeted assignment (sent_at set):", found);
  await admin.auth.admin.deleteUser(helper.user.id);

  // cleanup
  const rem = await sb.storage.from("request-files").remove([upload.path]);
  console.log("7a remove:", JSON.stringify(rem));
  const del = await admin.from("requests").delete().eq("id", inserted.id);
  console.log("7b delete request:", JSON.stringify(del));
  const gone = await admin.auth.admin.deleteUser(created.user.id);
  console.log("7c delete user:", JSON.stringify(gone));
  console.log("7. cleaned up");
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});