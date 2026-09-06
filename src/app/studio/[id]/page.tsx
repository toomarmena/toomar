import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ConfirmButton } from "@/components/studio/confirm-button";
import { CoverUploader } from "@/components/studio/cover-uploader";
import { SeriesForm } from "@/components/studio/series-form";
import { SubmitBox } from "@/components/studio/submit-box";
import { Button } from "@/components/ui/button";
import { EPISODE_WORD, formatNumber } from "@/lib/constants";
import { getDict } from "@/lib/lang-server";
import { mediaUrl } from "@/lib/media";
import { createClient, getUser } from "@/lib/supabase/server";
import type { EpisodeRow, SeriesRow } from "@/lib/types";
import { createEpisode, deleteSeries, updateSeries } from "../actions";

export default async function StudioSeriesPage({ params }: PageProps<"/studio/[id]">) {
  const { id } = await params;
  const user = await getUser().catch(() => null);
  if (!user) redirect(`/account?next=/studio/${id}`);
  const { lang, d } = await getDict();

  const supabase = await createClient();
  const [{ data: sData }, { data: eData }, { data: followers }] = await Promise.all([
    supabase.from("series").select("*").eq("id", id).maybeSingle(),
    supabase.from("episodes").select("*").eq("series_id", id).order("lang").order("number", { ascending: false }),
    supabase.rpc("follower_count", { sid: id }),
  ]);
  const series = sData as SeriesRow | null;
  if (!series) notFound();
  const episodes = (eData ?? []) as EpisodeRow[];
  const word = EPISODE_WORD[series.kind][lang];
  const publicHref = `/${series.kind === "comic" ? "comics" : "novels"}/${series.slug}`;
  const update = updateSeries.bind(null, series.id);
  const remove = deleteSeries.bind(null, series.id);

  return (
    <div className="flex flex-col gap-10">
      <Link href="/studio" className="t-link t-caption text-ink self-start">
        {d.common.back} {d.studio.nav.series}
      </Link>

      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
        <CoverUploader seriesId={series.id} coverUrl={mediaUrl(series.cover_key)} />
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <h1 className="t-h2">{series.title_ar}</h1>
          <p className="t-caption">
            {series.kind === "comic" ? d.studio.comic : d.studio.novel} · {formatNumber(Number(followers ?? 0), lang)} {d.studio.followers}
          </p>
          <SubmitBox seriesId={series.id} status={series.status} note={series.rejection_note} />
          {series.status === "approved" && (
            <Link href={publicHref} className="t-link t-caption text-ink self-start" dir="ltr">
              {publicHref}
            </Link>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4 flex-wrap pb-4 border-b border-hair">
          <h2 className="t-h2">{series.kind === "comic" ? d.studio.episodes : d.studio.chapters}</h2>
          <div className="flex gap-3">
            {series.languages.map((l) => {
              const create = createEpisode.bind(null, series.id, l);
              return (
                <form key={l} action={create}>
                  <Button type="submit" variant="secondary" className="h-10 px-4 text-[14px]">
                    {series.kind === "comic" ? d.studio.newEpisode : d.studio.newChapter} ({l === "ar" ? "ع" : "EN"})
                  </Button>
                </form>
              );
            })}
          </div>
        </div>
        {series.status !== "approved" && <p className="t-caption">{d.studio.seriesNotApproved}</p>}
        {episodes.length === 0 ? (
          <p className="t-caption py-6">{d.common.none}</p>
        ) : (
          <ul className="divide-y divide-hair">
            {episodes.map((e) => (
              <li key={e.id}>
                <Link href={`/studio/${series.id}/episodes/${e.id}`} className="flex items-center gap-4 py-3 group">
                  <span className="w-8 t-caption text-ink">{formatNumber(e.number, lang)}</span>
                  <span className="t-caption">{e.lang === "ar" ? "ع" : "EN"}</span>
                  <span className="flex-1 truncate text-[15px] group-hover:text-blue transition-colors">{e.title || `${word} ${formatNumber(e.number, lang)}`}</span>
                  <span className="t-caption">{e.is_published ? d.studio.published : d.studio.unpublished}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="t-h2 pb-4 border-b border-hair">{d.studio.save}</h2>
        <SeriesForm action={update} series={series} />
      </section>

      {(series.status === "draft" || series.status === "rejected") && (
        <form action={remove} className="pt-4 border-t border-hair">
          <ConfirmButton message={d.studio.confirmDelete} className="t-link t-caption text-ink">
            {d.studio.delete}
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
