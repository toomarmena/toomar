import Link from "next/link";
import { Cover } from "@/components/cover";
import { VerifiedMark } from "@/components/icons";
import { seriesHref } from "@/lib/links";
import { EPISODE_WORD, formatNumber, weekdayLabel } from "@/lib/constants";
import { fill } from "@/lib/i18n";
import { getDict } from "@/lib/lang-server";
import { toSummary } from "@/lib/queries";
import { createClient, getUser } from "@/lib/supabase/server";
import type { SeriesCardRow } from "@/lib/types";

export const metadata = { title: "مكتبتي" };

export default async function LibraryPage() {
  const { lang, d } = await getDict();
  const user = await getUser().catch(() => null);

  if (!user) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 md:px-12 pt-8 md:pt-16 flex flex-col items-center gap-4 text-center">
        <h1 className="font-display text-[34px] leading-tight">{d.library.title}</h1>
        <p className="text-ink-2">{d.library.signIn}</p>
        <Link href="/account?next=/library" className="px-6 h-12 inline-flex items-center bg-blue text-white font-bold">
          {d.account.signIn}
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: follows }, { data: progress }] = await Promise.all([
    supabase.from("follows").select("series_id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("reading_progress").select("series_id, number, lang").eq("user_id", user.id),
  ]);
  const ids = (follows ?? []).map((f) => f.series_id);
  const { data: rows } = ids.length ? await supabase.from("series_cards").select("*").in("id", ids) : { data: [] as SeriesCardRow[] };
  const byId = new Map(((rows ?? []) as SeriesCardRow[]).map((r) => [r.id, toSummary(r, lang)]));
  const items = ids.map((id) => byId.get(id)).filter((s): s is NonNullable<typeof s> => !!s);
  const progressById = new Map((progress ?? []).map((p) => [p.series_id, p]));

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-12 pt-6 md:pt-12 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[34px] leading-tight">{d.library.title}</h1>
        <p className="text-sm text-ink-2">{d.library.lead}</p>
      </div>
      {items.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-4 border border-dashed border-hair text-center">
          <p className="text-sm text-muted">{d.library.empty}</p>
          <Link href="/comics" className="px-5 h-11 inline-flex items-center bg-ink text-white font-semibold text-sm">
            {d.library.browse}
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((s) => {
            const p = progressById.get(s.id);
            const word = EPISODE_WORD[s.kind][lang];
            const base = seriesHref(s);
            const readHref = p ? `${base}/${p.number}?lang=${p.lang}` : s.latestEpisode ? `${base}/1` : base;
            return (
              <li key={s.id} className="flex items-center gap-4 p-3 bg-surface border border-hair">
                <Link href={base} className="w-[72px] shrink-0">
                  <Cover src={s.coverUrl} title={s.title} tint={s.tint} />
                </Link>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <Link href={base} className="font-semibold leading-snug truncate hover:text-blue">
                    {s.title}
                  </Link>
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    {s.creator.name}
                    {s.creator.verified && <VerifiedMark />}
                  </span>
                  <span className="text-xs text-ink-2">
                    {s.latestEpisode ? `${word} ${formatNumber(s.latestEpisode.number, lang)} · ` : ""}
                    {fill(d.series.every, { day: weekdayLabel(s.publishDay, lang) })}
                  </span>
                  <Link href={readHref} className="self-start mt-1 px-3.5 h-9 inline-flex items-center bg-ink text-white text-xs font-semibold">
                    {p ? `${d.series.continueReading} · ${word} ${formatNumber(p.number, lang)}` : d.series.startReading}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
