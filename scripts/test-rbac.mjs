import { createServerClient } from "@supabase/ssr";
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

const BASE = "http://localhost:3000";

async function createUser(role, tag) {
  const email = `test.${role}.${tag}@peercraft.test`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "TestPass123!",
    email_confirm: true,
    user_metadata: { name: `Test ${role}`, role },
  });
  if (error) throw error;
  await admin.from("users").update({ role }).eq("id", data.user.id);
  return data.user.id;
}

// Build a real ssr cookie for a user's session and return a Cookie header
async function buildCookieHeader(role, tag) {
  const uid = await createUser(role, tag);
  const sb = createClient(url, anonKey, { realtime: { transport: WebSocket } });
  const { data: auth, error } = await sb.auth.signInWithPassword({
    email: `test.${role}.${tag}@peercraft.test`,
    password: "TestPass123!",
  });
  if (error) throw error;
  const session = auth.session;

  const cookies = {};
  const serverClient = createServerClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: false },
    realtime: { transport: WebSocket },
    cookies: {
      getAll() {
        return Object.entries(cookies).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          cookies[name] = value;
        });
      },
    },
  });
  const { error: setErr } = await serverClient.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (setErr) throw setErr;

  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  return { uid, cookieHeader };
}

async function hit(cookieHeader, path) {
  const res = await fetch(BASE + path, {
    redirect: "manual",
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
  return { status: res.status, location: res.headers.get("location") };
}

(async () => {
  const tag = Date.now();
  const student = await buildCookieHeader("student", tag);
  const helper = await buildCookieHeader("helper", tag);

  console.log("-- student --");
  console.log("/dashboard:", JSON.stringify(await hit(student.cookieHeader, "/dashboard")));
  console.log("/helper/dashboard:", JSON.stringify(await hit(student.cookieHeader, "/helper/dashboard")));
  console.log("/admin/dashboard:", JSON.stringify(await hit(student.cookieHeader, "/admin/dashboard")));
  console.log("/sign-up:", JSON.stringify(await hit(student.cookieHeader, "/sign-up")));

  console.log("-- helper --");
  console.log("/helper/dashboard:", JSON.stringify(await hit(helper.cookieHeader, "/helper/dashboard")));
  console.log("/dashboard:", JSON.stringify(await hit(helper.cookieHeader, "/dashboard")));
  console.log("/admin/dashboard:", JSON.stringify(await hit(helper.cookieHeader, "/admin/dashboard")));
  console.log("/sign-in:", JSON.stringify(await hit(helper.cookieHeader, "/sign-in")));

  await admin.auth.admin.deleteUser(student.uid);
  await admin.auth.admin.deleteUser(helper.uid);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});