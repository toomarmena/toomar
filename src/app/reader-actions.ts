"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isLang } from "@/lib/i18n";

/** Follow or unfollow. Returns the new state, or null when signed out. */
export async function toggleFollow(seriesId: string): Promise<boolean | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase.from("follows").select("series_id").eq("user_id", user.id).eq("series_id", seriesId).maybeSingle();
  if (existing) {
    await supabase.from("follows").delete().eq("user_id", user.id).eq("series_id", seriesId);
    revalidatePath("/library");
    return false;
  }
  await supabase.from("follows").insert({ user_id: user.id, series_id: seriesId });
  revalidatePath("/library");
  return true;
}

/** Remembers where the reader is in a series. */
export async function saveProgress(seriesId: string, episodeId: string, number: number, lang: string) {
  if (!isLang(lang)) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("reading_progress").upsert({ user_id: user.id, series_id: seriesId, episode_id: episodeId, number, lang, updated_at: new Date().toISOString() });
}

/** One quiet reaction per reader per episode. Returns the new state, or null when signed out. */
export async function toggleReaction(episodeId: string): Promise<boolean | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: existing } = await supabase.from("episode_reactions").select("episode_id").eq("user_id", user.id).eq("episode_id", episodeId).maybeSingle();
  if (existing) {
    await supabase.from("episode_reactions").delete().eq("user_id", user.id).eq("episode_id", episodeId);
    return false;
  }
  await supabase.from("episode_reactions").insert({ user_id: user.id, episode_id: episodeId });
  return true;
}

/** A content report for the editor. Signed-in readers only. */
export async function submitReport(seriesId: string, episodeId: string | null, reason: string): Promise<"ok" | "signin" | "short"> {
  const text = reason.trim().slice(0, 500);
  if (text.length < 3) return "short";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "signin";
  await supabase.from("reports").insert({ series_id: seriesId, episode_id: episodeId, reporter_id: user.id, reason: text });
  return "ok";
}

/** Stores an open/complete event. Return rate and completion are computed from these later. */
export async function recordEvent(type: "open" | "complete", seriesId: string, episodeId: string, anonId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("events").insert({ type, series_id: seriesId, episode_id: episodeId, user_id: user?.id ?? null, anon_id: user ? null : anonId.slice(0, 64) });
}
