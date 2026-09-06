/**
 * Prints a one-time sign-in link for an existing account (for testing).
 *   node scripts/sign-in-link.mjs test-creator@example.com /studio
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/(rest|auth|storage)\/v1\/?$/i, "").replace(/\/+$/, "");
const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const [email, next = "/"] = process.argv.slice(2);
const site = process.env.SITE_URL || "https://toomar.vercel.app";
const { data, error } = await db.auth.admin.generateLink({ type: "magiclink", email });
if (error) throw error;
console.log(`${site}/auth/callback?token_hash=${data.properties.hashed_token}&type=magiclink&next=${encodeURIComponent(next)}`);
