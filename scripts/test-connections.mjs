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

console.log("Supabase URL:", url);

const results = [];

async function testAnonConnection() {
  const client = createClient(url, anonKey, {
    realtime: { transport: WebSocket },
  });
  const { error } = await client.from("users").select("id").limit(1);
  if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
    results.push(["anon/publishable key", "connected (schema not yet applied)"]);
  } else if (error) {
    results.push(["anon/publishable key", `error: ${error.message}`]);
  } else {
    results.push(["anon/publishable key", "connected, users table query OK"]);
  }
}

async function testAdminConnection() {
  const admin = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: WebSocket },
  });
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    results.push(["service/secret key", `auth admin error: ${error.message}`]);
  } else {
    results.push(["service/secret key", `connected, ${data.total ?? data.users.length} users in auth`]);
  }
}

async function testHealth() {
  try {
    const res = await fetch(`${url}/auth/v1/health`);
    results.push(["auth health", `HTTP ${res.status}`]);
  } catch (error) {
    results.push(["auth health", `error: ${error.message}`]);
  }
}

(async () => {
  await testAnonConnection();
  await testAdminConnection();
  await testHealth();

  for (const [name, status] of results) {
    console.log(`${name.padEnd(24)} => ${status}`);
  }
})();