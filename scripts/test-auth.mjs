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

(async () => {
  // 1. Create a user directly with confirmed email (service role), role defaults to student via trigger
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: "TestPass123!",
    email_confirm: true,
    user_metadata: { name: "Test Student", role: "student" },
  });
  if (createErr) throw new Error(`createUser: ${createErr.message}`);
  console.log("1. created user:", created.user.id);

  // 2. Verify the users table row was created with role=student via trigger
  const { data: row, error: rowErr } = await admin
    .from("users")
    .select("id, email, role, name")
    .eq("id", created.user.id)
    .single();
  if (rowErr) throw new Error(`users row: ${rowErr.message}`);
  console.log("2. users row:", row.id, row.email, row.role, row.name);

  // 3. Sign in with password (as the real app would)
  const sb = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  const { data: signIn, error: signInErr } = await sb.auth.signInWithPassword({ email, password: "TestPass123!" });
  if (signInErr) throw new Error(`signIn: ${signInErr.message}`);
  console.log("3. sign-in session:", !!signIn.session, "user:", signIn.user?.email);

  // 4. Verify role lookup as an authenticated user (proxy does the same)
  const authd = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${signIn.session.access_token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: WebSocket },
  });
  const { data: profile } = await authd.from("users").select("role").eq("id", created.user.id).single();
  console.log("4. authenticated role lookup:", profile?.role);

  // cleanup
  await admin.auth.admin.deleteUser(created.user.id);
  console.log("5. cleaned up test user");
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});