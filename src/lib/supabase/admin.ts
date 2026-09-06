import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

/**
 * Bypasses row-level security. Only for server code that has already
 * checked the caller is the editor, and for seeding.
 */
export function createAdminClient() {
  const url = supabaseUrl();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
