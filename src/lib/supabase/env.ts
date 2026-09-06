/**
 * Supabase connection values, tolerant of how the dashboard presents them:
 * the URL may be pasted with a trailing slash or a `/rest/v1` path.
 */
export function supabaseUrl(raw = process.env.NEXT_PUBLIC_SUPABASE_URL) {
  return (raw ?? "").trim().replace(/\/(rest|auth|storage)\/v1\/?$/i, "").replace(/\/+$/, "");
}

export function supabaseAnonKey(raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  return (raw ?? "").trim();
}
