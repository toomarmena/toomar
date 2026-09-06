import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ConfirmButton } from "@/components/studio/confirm-button";
import { ImageEditor } from "@/components/studio/image-editor";
import { Button } from "@/components/ui/button";
import { EPISODE_WORD, formatNumber, isScheduledAhead, weekdayLabel } from "@/lib/constants";
import { fill } from "@/lib/i18n";
import { getDict } from "@/lib/lang-server";
import { mediaUrl } from "@/lib/media";
import { createClient, getUser } from "@/lib/supabase/server";
import type { EpisodeImageRow, EpisodeRow, SeriesRow } from "@/lib/types";
import { deleteEpisode, scheduleEpisode, setEpisodePublished, unscheduleEpisode, updateEpisode } from "../../../actions";

export default async function EpisodeEditorPage({ params }: PageProps<"/studio/[id]/episodes/[epId]">) {
  const { id, epId } = await params;
  const user = await getUser().catch(() => null);
  if (!user) redirect(`/account?next=/studio/${id}`);
  const { lang, d } = await getDict();

  const supabase = await createClient();
  const [{ data: sData }, { data: eData }, { data: iData }] = await Promise.all([
    supabase.from("series").select("*").eq("id", id).maybeSingle(),
    supabase.from("episodes").select("*").eq("id", epId).maybeSingle(),
    supabase.from("episode_images").select("*").eq("episode_id", epId).order("position"),
  ]);
  const series = sData as SeriesRow | null;
  const episode = eData as EpisodeRow | null;
  if (!series || !episode || episode.series_id !== series.id) notFound();
  const images = ((iData ?? []) as EpisodeImageRow[]).map((i) => ({ id: i.id, url: mediaUrl(i.key)!, width: i.width, height: i.height }));
  const publicBase = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

  const word = EPISODE_WORD[series.kind][lang];
  const save = updateEpisode.bind(null, episode.id);
  const publish = setEpisodePublished.bind(null, episode.id, !episode.is_published);
  const schedule = scheduleEpisode.bind(null, episode.id);
  const unschedule = unscheduleEpisode.bind(null, episode.id);
  const scheduled = isScheduledAhead(episode.publish_at, episode.is_published);
  const day = weekdayLabel(series.publish_day, lang);
  const remove = deleteEpisode.bind(null, episode.id);
  const previewHref = `/preview/${series.id}/${episode.number}?lang=${episode.lang}`;

  return (
    <div className="flex flex-col gap-8">
      <Link href={`/studio/${series.id}`} className="t-link t-caption text-ink self-start">
        {d.common.back} {series.title_ar}
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="t-h2">
            {word} {formatNumber(episode.number, lang)}
            <span className="t-caption ms-3">{episode.lang === "ar" ? "العربية" : "English"}</span>
          </h1>
          <span className="t-caption">{episode.is_published ? d.studio.published : scheduled ? fill(d.studio.scheduled, { day }) : d.studio.unpublished}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href={previewHref} className="t-link t-caption text-ink">
            {d.admin.preview}
          </Link>
          {episode.is_published ? (
            <form action={publish}>
              <Button type="submit" variant="secondary" className="h-10 px-5 text-[14px]">
                {d.studio.unpublish}
              </Button>
            </form>
          ) : scheduled ? (
            <form action={unschedule}>
              <Button type="submit" variant="secondary" className="h-10 px-5 text-[14px]">
                {d.studio.cancelSchedule}
              </Button>
            </form>
          ) : (
            <>
              <form action={schedule}>
                <Button type="submit" variant="primary" className="h-10 px-5 text-[14px]">
                  {fill(d.studio.publishOn, { day })}
                </Button>
              </form>
              <form action={publish}>
                <Button type="submit" variant="secondary" className="h-10 px-5 text-[14px]">
                  {d.studio.publishNow}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      <form action={save} className="flex flex-col gap-4 max-w-[720px]">
        <label className="flex flex-col gap-1.5 t-caption text-ink">
          {series.kind === "comic" ? d.studio.episodeTitle : d.studio.chapterTitle}
          <input name="title" defaultValue={episode.title ?? ""} maxLength={160} className="field text-[15px]" dir={episode.lang === "ar" ? "rtl" : "ltr"} />
        </label>
        {series.kind === "novel" && (
          <label className="flex flex-col gap-1.5 t-caption text-ink">
            {d.studio.chapterBody}
            <textarea name="body" defaultValue={episode.body ?? ""} rows={24} className="field text-[17px] leading-[1.9]" dir={episode.lang === "ar" ? "rtl" : "ltr"} />
            <span className="t-caption">{d.studio.bodyHint}</span>
          </label>
        )}
        <label className="flex flex-col gap-1.5 t-caption text-ink">
          {d.studio.note}
          <textarea name="note" defaultValue={episode.note ?? ""} rows={3} maxLength={600} className="field text-[15px]" dir={episode.lang === "ar" ? "rtl" : "ltr"} />
          <span className="t-caption">{d.studio.noteHint}</span>
        </label>
        <Button type="submit" variant="primary" className="self-start h-10 px-5 text-[14px]">
          {d.studio.save}
        </Button>
      </form>

      {series.kind === "comic" && (
        <section className="flex flex-col gap-4">
          <h2 className="t-h2 pb-4 border-b border-hair">{d.studio.images}</h2>
          <ImageEditor episodeId={episode.id} initial={images} publicBase={publicBase} />
        </section>
      )}

      <form action={remove} className="pt-4 border-t border-hair">
        <ConfirmButton message={d.studio.confirmDelete} className="t-link t-caption text-ink">
          {d.studio.delete}
        </ConfirmButton>
      </form>
    </div>
  );
}
