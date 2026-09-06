import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./env";

/** Anonymous, session-less client for public data outside a request (sitemap, OG images). */
export function createPublicClient() {
  return createClient(supabaseUrl(), supabaseAnonKey(), { auth: { persistSession: false, autoRefreshToken: false } });
}
