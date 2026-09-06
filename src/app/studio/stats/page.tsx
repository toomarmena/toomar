import Link from "next/link";
import { redirect } from "next/navigation";
import { Cover } from "@/components/cover";
import { EPISODE_WORD, formatNumber } from "@/lib/constants";
import { getDict } from "@/lib/lang-server";
import { mediaUrl } from "@/lib/media";
import { getSeriesStats } from "@/lib/queries";
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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="t-h2">{d.studio.stats.title}</h1>
        <p className="t-caption max-w-[60ch]">{d.studio.stats.lead}</p>
      </div>
      {cards.length === 0 ? (
        <p className="t-caption py-10">{d.studio.stats.noSeries}</p>
      ) : (
        cards.map(({ s, followers, stats }) => {
          const word = EPISODE_WORD[s.kind][lang];
          return (
            <section key={s.id} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 shrink-0">
                  <Cover src={mediaUrl(s.cover_key)} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <Link href={`/studio/${s.id}`} className="t-series truncate hover:text-blue transition-colors">
                    {s.title_ar}
                  </Link>
                  <span className="t-caption">
                    {formatNumber(followers, lang)} {d.studio.stats.followers}
                  </span>
                </div>
              </div>
              {stats.length === 0 ? (
                <p className="t-caption">{d.studio.stats.empty}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead>
                      <tr className="t-caption">
                        <th className="text-start font-normal py-2">{word}</th>
                        <th className="text-start font-normal py-2">{d.studio.stats.openers}</th>
                        <th className="text-start font-normal py-2" title={d.studio.stats.completionHint}>
                          {d.studio.stats.completion}
                        </th>
                        <th className="text-start font-normal py-2" title={d.studio.stats.returnedHint}>
                          {d.studio.stats.returned}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hair border-y border-hair">
                      {stats.map((row) => (
                        <tr key={row.episode_id}>
                          <td className="py-2.5">
                            {formatNumber(row.number, lang)} <span className="t-caption">{row.lang === "ar" ? "ع" : "EN"}</span>
                          </td>
                          <td className="py-2.5">{formatNumber(row.openers, lang)}</td>
                          <td className="py-2.5">{pct(row.completers, row.openers, lang)}</td>
                          <td className="py-2.5">{pct(row.returned, row.openers, lang)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="t-caption mt-3">
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
