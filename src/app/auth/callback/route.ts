import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Where Google (and email links) land after sign-in. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = searchParams.get("next") ?? "/";
  const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }
  return NextResponse.redirect(`${origin}/account?error=auth`);
}
