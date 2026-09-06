import Link from "next/link";
import { redirect } from "next/navigation";
import { Cover } from "@/components/cover";
import { EPISODE_WORD, formatNumber } from "@/lib/constants";
import { getDict } from "@/lib/lang-server";
import { mediaUrl } from "@/lib/media";
import { getSeriesStats, tintFor } from "@/lib/queries";
import { createClient, getUser } from "@/lib/supabase/server";
import type { SeriesRow } from "@/lib/types";

export const metadata = { title: "أرقامي" };

function pct(part: number, whole: number, lang: "ar" | "en") {
  if (!whole) return "—";
  const n = Math.round((part / whole) * 100);
  return lang === "ar" ? `٪${formatNumber(n, "ar")}` : `${n}%`;
}

export default async function StudioStatsPage() {
  const user = await getUser().catch(() => null);
  if (!user) redirect("/account?next=/studio/stats");
  const { lang, d } = await getDict();
  const supabase = await createClient();
  const { data } = await supabase.from("series").select("*").eq("creator_id", user.id).eq("status", "approved").order("approved_at", { ascending: false });
  const list = (data ?? []) as SeriesRow[];
  const cards = await Promise.all(
    list.map(async (s) => {
      const [{ data: followers }, stats] = await Promise.all([supabase.rpc("follower_count", { sid: s.id }), getSeriesStats(s.id)]);
      return { s, followers: Number(followers ?? 0), stats };
    }),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[34px] leading-tight">{d.studio.stats.title}</h1>
        <p className="text-sm text-ink-2 max-w-[60ch]">{d.studio.stats.lead}</p>
      </div>
      {cards.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted border border-dashed border-hair">{d.studio.stats.noSeries}</p>
      ) : (
        cards.map(({ s, followers, stats }) => {
          const word = EPISODE_WORD[s.kind][lang];
          return (
            <section key={s.id} className="flex flex-col gap-4 p-4 md:p-6 bg-surface border border-hair">
              <div className="flex items-center gap-4">
                <div className="w-[56px] shrink-0">
                  <Cover src={mediaUrl(s.cover_key)} title={s.title_ar} tint={tintFor(s.id)} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <Link href={`/studio/${s.id}`} className="font-semibold text-lg truncate hover:text-blue">
                    {s.title_ar}
                  </Link>
                  <span className="text-sm text-ink-2">
                    <span className="font-display text-2xl text-ink me-1.5">{formatNumber(followers, lang)}</span>
                    {d.studio.stats.followers}
                  </span>
                </div>
              </div>
              {stats.length === 0 ? (
                <p className="text-sm text-muted">{d.studio.stats.empty}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-muted">
                        <th className="text-start font-semibold py-2">{word}</th>
                        <th className="text-start font-semibold py-2">{d.studio.stats.openers}</th>
                        <th className="text-start font-semibold py-2" title={d.studio.stats.completionHint}>
                          {d.studio.stats.completion}
                        </th>
                        <th className="text-start font-semibold py-2" title={d.studio.stats.returnedHint}>
                          {d.studio.stats.returned}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hair border-t border-hair">
                      {stats.map((row) => (
                        <tr key={row.episode_id}>
                          <td className="py-2.5 font-semibold">
                            {formatNumber(row.number, lang)} <span className="text-[11px] text-muted font-normal">{row.lang === "ar" ? "ع" : "EN"}</span>
                          </td>
                          <td className="py-2.5">{formatNumber(row.openers, lang)}</td>
                          <td className="py-2.5">{pct(row.completers, row.openers, lang)}</td>
                          <td className="py-2.5">{pct(row.returned, row.openers, lang)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[11px] text-muted mt-3">
                    {d.studio.stats.completion}: {d.studio.stats.completionHint} · {d.studio.stats.returned}: {d.studio.stats.returnedHint}
                  </p>
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
