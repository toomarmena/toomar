import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseUrl } from "@/lib/supabase/env";

/** Reports whether the server can reach its services. Never returns key values. */
export async function GET() {
  const report: Record<string, string> = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? `set (${process.env.NEXT_PUBLIC_SUPABASE_URL.length} chars, using ${supabaseUrl().length})` : "missing",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `set (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length} chars, starts ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 14)})` : "missing",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? `set (${process.env.SUPABASE_SERVICE_ROLE_KEY.length} chars)` : "missing",
    r2AccountId: process.env.R2_ACCOUNT_ID ? "set" : "missing",
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID ? "set" : "missing",
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY ? "set" : "missing",
    r2PublicUrl: process.env.R2_PUBLIC_URL ? `set (${process.env.R2_PUBLIC_URL})` : "missing",
  };
  try {
    const supabase = await createClient();
    const { error, count } = await supabase.from("series_cards").select("id", { count: "exact", head: true });
    report.database = error ? `error: ${error.message}` : `ok (${count} approved series)`;
  } catch (e) {
    report.database = `error: ${e instanceof Error ? e.message : String(e)}`;
  }
  return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
}
