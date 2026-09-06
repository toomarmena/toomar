"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { configureCors } from "@/lib/r2";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("signed out");
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data?.role !== "admin") throw new Error("forbidden");
  return createAdminClient();
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/comics");
  revalidatePath("/novels");
}

export async function approveSeries(id: string) {
  const db = await requireAdmin();
  await db.from("series").update({ status: "approved", approved_at: new Date().toISOString(), rejection_note: null }).eq("id", id);
  refresh();
}

export async function rejectSeries(id: string, form: FormData) {
  const db = await requireAdmin();
  const note = String(form.get("note") ?? "").trim().slice(0, 1000) || null;
  await db.from("series").update({ status: "rejected", rejection_note: note, featured_rank: null }).eq("id", id);
  refresh();
}

/** Takes an approved series off the site; the creator can fix it and resubmit. */
export async function hideSeries(id: string, form: FormData) {
  const db = await requireAdmin();
  const note = String(form.get("note") ?? "").trim().slice(0, 1000) || null;
  await db.from("series").update({ status: "rejected", rejection_note: note, featured_rank: null }).eq("id", id);
  refresh();
}

export async function setVerified(userId: string, verified: boolean) {
  const db = await requireAdmin();
  await db.from("profiles").update({ is_verified: verified }).eq("id", userId);
  refresh();
}

/** Replaces the editor's picks with this exact order. */
export async function setPicks(orderedIds: string[]) {
  const db = await requireAdmin();
  await db.from("series").update({ featured_rank: null }).not("featured_rank", "is", null);
  await Promise.all(orderedIds.map((id, i) => db.from("series").update({ featured_rank: i + 1 }).eq("id", id).eq("status", "approved")));
  refresh();
}

export async function setupStorage(): Promise<string> {
  await requireAdmin();
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const origins = new Set<string>(["https://toomar.vercel.app", "http://localhost:3000", "http://localhost:3210"]);
  if (host) origins.add(`https://${host}`);
  await configureCors([...origins]);
  return [...origins].join(", ");
}
