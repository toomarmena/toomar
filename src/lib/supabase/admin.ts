import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Bypasses row-level security. Only for server code that has already
 * checked the caller is the editor, and for seeding.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
