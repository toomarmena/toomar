import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE = "https://toomar.vercel.app";

/**
 * Hourly: flips scheduled episodes whose time has come to published, then
 * emails followers about episodes that went live in the last day (once each).
 * Sends only when RESEND_API_KEY exists; otherwise it just flips schedules.
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = createAdminClient();
  const now = new Date().toISOString();

  // 1. Scheduled → published.
  const { data: flipped } = await db.from("episodes").update({ is_published: true }).eq("is_published", false).lte("publish_at", now).select("id");

  // 2. Episodes that became live in the last 24h on approved series.
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: episodes } = await db
    .from("episodes")
    .select("id, number, lang, title, series_id, published_at, series!inner(id, slug, kind, title_ar, title_en, status)")
    .eq("is_published", true)
    .gte("published_at", since)
    .eq("series.status", "approved");

  const key = process.env.RESEND_API_KEY;
  let sent = 0;
  if (key && episodes?.length) {
    for (const ep of episodes) {
      const s = ep.series as unknown as { slug: string; kind: string; title_ar: string; title_en: string | null };
      const { data: followers } = await db.from("follows").select("user_id, profiles!inner(notify_email, ui_lang)").eq("series_id", ep.series_id).eq("profiles.notify_email", true);
      const { data: already } = await db.from("notifications_sent").select("user_id").eq("episode_id", ep.id);
      const done = new Set((already ?? []).map((r) => r.user_id));
      const targets = (followers ?? []).filter((f) => !done.has(f.user_id));
      if (targets.length === 0) continue;
      const ids = targets.map((f) => f.user_id);
      const emails: Record<string, string> = {};
      for (let page = 1; page <= 20; page++) {
        const { data } = await db.auth.admin.listUsers({ page, perPage: 200 });
        for (const u of data?.users ?? []) if (u.email && ids.includes(u.id)) emails[u.id] = u.email;
        if (!data || data.users.length < 200) break;
      }
      const url = `${SITE}/${s.kind === "comic" ? "comics" : "novels"}/${s.slug}/${ep.number}?lang=${ep.lang}`;
      const word = s.kind === "comic" ? "الحلقة" : "الفصل";
      for (const f of targets) {
        const to = emails[f.user_id];
        if (!to) continue;
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "طومار <no-reply@toomar.app>",
            to,
            subject: `${s.title_ar}: ${word} ${ep.number} صدرت`,
            html: `<div dir="rtl" style="font-family:'IBM Plex Sans Arabic','Segoe UI',Tahoma,sans-serif;color:#111;max-width:520px;margin:0 auto;padding:32px 24px"><div style="font-size:26px;margin-bottom:20px">طومار</div><p style="font-size:16px;line-height:1.8;margin:0 0 20px">صدرت ${word} ${ep.number} من <strong>${s.title_ar}</strong>${ep.title ? ` — ${ep.title}` : ""}.</p><a href="${url}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;font-size:15px">اقرأ</a><p style="font-size:12px;color:#7a7a82;margin-top:28px">تصلك هذه الرسالة لأنك تتابع السلسلة. يمكنك إيقافها من صفحة حسابك.</p></div>`,
          }),
        });
        if (res.ok) {
          await db.from("notifications_sent").insert({ episode_id: ep.id, user_id: f.user_id });
          sent++;
        }
      }
    }
  }
  return NextResponse.json({ flipped: flipped?.length ?? 0, live: episodes?.length ?? 0, sent, mail: !!key });
}
