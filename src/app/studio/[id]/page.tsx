import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ConfirmButton } from "@/components/studio/confirm-button";
import { CoverUploader } from "@/components/studio/cover-uploader";
import { SeriesForm } from "@/components/studio/series-form";
import { SubmitBox } from "@/components/studio/submit-box";
import { EPISODE_WORD, formatNumber } from "@/lib/constants";
import { getDict } from "@/lib/lang-server";
import { mediaUrl } from "@/lib/media";
import { tintFor } from "@/lib/queries";
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
    <div className="flex flex-col gap-8">
      <Link href="/studio" className="text-sm text-muted hover:text-ink">
        ← {d.studio.title}
      </Link>

      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
        <CoverUploader seriesId={series.id} coverUrl={mediaUrl(series.cover_key)} title={series.title_ar} tint={tintFor(series.id)} />
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <h1 className="font-display text-[34px] leading-tight">{series.title_ar}</h1>
          <p className="text-sm text-muted">
            {series.kind === "comic" ? d.studio.comic : d.studio.novel} · {formatNumber(Number(followers ?? 0), lang)} {d.studio.followers}
          </p>
          <SubmitBox seriesId={series.id} status={series.status} note={series.rejection_note} />
          {series.status === "approved" && (
            <Link href={publicHref} className="self-start text-sm font-semibold text-blue underline underline-offset-4">
              {publicHref}
            </Link>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-display text-[28px] leading-tight">{series.kind === "comic" ? d.studio.episodes : d.studio.chapters}</h2>
          <div className="flex gap-2">
            {series.languages.map((l) => {
              const create = createEpisode.bind(null, series.id, l);
              return (
                <form key={l} action={create}>
                  <button type="submit" className="px-4 h-10 bg-blue text-white text-sm font-bold hover:bg-blue-deep">
                    {series.kind === "comic" ? d.studio.newEpisode : d.studio.newChapter} ({l === "ar" ? "ع" : "EN"})
                  </button>
                </form>
              );
            })}
          </div>
        </div>
        {series.status !== "approved" && <p className="text-xs text-muted">{d.studio.seriesNotApproved}</p>}
        {episodes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted border border-dashed border-hair">{d.common.none}</p>
        ) : (
          <ul className="divide-y divide-hair border-y border-hair">
            {episodes.map((e) => (
              <li key={e.id}>
                <Link href={`/studio/${series.id}/episodes/${e.id}`} className="flex items-center gap-4 py-3 hover:bg-surface -mx-2 px-2">
                  <span className="font-display text-xl w-10 text-center">{formatNumber(e.number, lang)}</span>
                  <span className="text-[11px] font-semibold px-1.5 py-0.5 border border-hair text-muted">{e.lang === "ar" ? "ع" : "EN"}</span>
                  <span className="flex-1 truncate font-semibold">{e.title || `${word} ${formatNumber(e.number, lang)}`}</span>
                  <span className={`text-xs font-semibold ${e.is_published ? "text-[#0E7C4A]" : "text-muted"}`}>{e.is_published ? d.studio.published : d.studio.unpublished}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[28px] leading-tight">{d.studio.save}</h2>
        <SeriesForm action={update} series={series} />
      </section>

      {(series.status === "draft" || series.status === "rejected") && (
        <form action={remove} className="pt-4 border-t border-hair">
          <ConfirmButton message={d.studio.confirmDelete} className="text-sm font-semibold text-[#B3261E] underline underline-offset-4">
            {d.studio.delete}
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
