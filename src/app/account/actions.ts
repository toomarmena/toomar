"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isLang, LANG_COOKIE } from "@/lib/i18n";
import { THEME_COOKIE } from "@/lib/lang-server";

export type AuthState = { error?: "invalid" | "weak" | "exists" | "generic" | "auth" } | null;

function safeNext(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v : "/";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
}

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signInWithPassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = safeNext(form.get("next"));
  if (!email || !password) return { error: "invalid" };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message.toLowerCase().includes("invalid") ? "invalid" : "generic" };
  redirect(next);
}

export async function signUpWithPassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const next = safeNext(form.get("next"));
  if (!email || !password) return { error: "invalid" };
  if (password.length < 6) return { error: "weak" };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name || undefined }, emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("already") || m.includes("registered")) return { error: "exists" };
    if (m.includes("password")) return { error: "weak" };
    return { error: "generic" };
  }
  // With email confirmation off the session exists right away; otherwise the user checks their inbox.
  if (data.session) redirect(next);
  redirect(`/account?check=1`);
}

export async function signInWithGoogle(form: FormData) {
  const next = safeNext(form.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/account?error=auth");
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function setTheme(theme: "light" | "dark") {
  const jar = await cookies();
  jar.set(THEME_COOKIE, theme, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}

export async function setUiLang(form: FormData) {
  const lang = form.get("lang");
  if (!isLang(lang)) return;
  const jar = await cookies();
  jar.set(LANG_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await supabase.from("profiles").update({ ui_lang: lang }).eq("id", user.id);
  revalidatePath("/", "layout");
}
