/**
 * Exercises the like, report and stats paths as the test creator, through the
 * same REST endpoints the buttons use (row-level security included).
 *   node scripts/check-reactions.mjs <email> <episodeId> <seriesId>
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/(rest|auth|storage)\/v1\/?$/i, "").replace(/\/+$/, "");
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const [email, episodeId, seriesId] = process.argv.slice(2);

const { data: link, error: linkErr } = await admin.auth.admin.generateLink({ type: "magiclink", email });
if (linkErr) throw linkErr;
const user = createClient(url, anon, { auth: { persistSession: false } });
const { data: session, error: verifyErr } = await user.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: "magiclink" });
if (verifyErr) throw verifyErr;
const uid = session.user.id;
console.log("signed in as", email);

const { error: likeErr } = await user.from("episode_reactions").upsert({ user_id: uid, episode_id: episodeId });
console.log("like:", likeErr ? likeErr.message : "ok");
const { error: repErr } = await user.from("reports").insert({ series_id: seriesId, episode_id: episodeId, reporter_id: uid, reason: "بلاغ تجريبي من سكربت الاختبار" });
console.log("report:", repErr ? repErr.message : "ok");
const { data: stats, error: statsErr } = await user.rpc("series_stats", { sid: seriesId });
console.log("stats:", statsErr ? statsErr.message : stats.filter((r) => r.episode_id === episodeId));
const { data: reports } = await admin.from("reports").select("reason, resolved_at").eq("series_id", seriesId);
console.log("admin sees reports:", reports);
const { error: anonErr } = await createClient(url, anon, { auth: { persistSession: false } }).from("episode_reactions").insert({ user_id: uid, episode_id: episodeId });
console.log("anonymous like blocked:", anonErr ? "yes (" + anonErr.code + ")" : "NO");
