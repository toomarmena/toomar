import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ConfirmButton } from "@/components/studio/confirm-button";
import { ImageEditor } from "@/components/studio/image-editor";
import { EPISODE_WORD, formatNumber } from "@/lib/constants";
import { getDict } from "@/lib/lang-server";
import { mediaUrl } from "@/lib/media";
import { createClient, getUser } from "@/lib/supabase/server";
import type { EpisodeImageRow, EpisodeRow, SeriesRow } from "@/lib/types";
import { deleteEpisode, setEpisodePublished, updateEpisode } from "../../../actions";

const input = "w-full h-12 px-4 border border-hair bg-white text-ink focus:outline-none focus:border-ink font-normal";

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
  const remove = deleteEpisode.bind(null, episode.id);
  const previewHref = `/preview/${series.id}/${episode.number}?lang=${episode.lang}`;

  return (
    <div className="mx-auto max-w-[900px] px-4 md:px-12 pt-6 md:pt-12 flex flex-col gap-8">
      <Link href={`/studio/${series.id}`} className="text-sm text-muted hover:text-ink">
        ← {series.title_ar}
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[34px] leading-tight">
            {word} {formatNumber(episode.number, lang)}
            <span className="text-base font-sans text-muted ms-3">{episode.lang === "ar" ? "العربية" : "English"}</span>
          </h1>
          <span className={`text-sm font-semibold ${episode.is_published ? "text-[#0E7C4A]" : "text-muted"}`}>{episode.is_published ? d.studio.published : d.studio.unpublished}</span>
        </div>
        <div className="flex gap-2">
          <Link href={previewHref} className="px-4 h-11 inline-flex items-center border border-hair text-sm font-semibold hover:border-ink">
            {d.admin.preview}
          </Link>
          <form action={publish}>
            <button type="submit" className={`px-5 h-11 text-sm font-bold ${episode.is_published ? "border-[1.5px] border-ink text-ink" : "bg-ink text-white"}`}>
              {episode.is_published ? d.studio.unpublish : d.studio.publish}
            </button>
          </form>
        </div>
      </div>

      <form action={save} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {series.kind === "comic" ? d.studio.episodeTitle : d.studio.chapterTitle}
          <input name="title" defaultValue={episode.title ?? ""} maxLength={160} className={input} dir={episode.lang === "ar" ? "rtl" : "ltr"} />
        </label>
        {series.kind === "novel" && (
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {d.studio.chapterBody}
            <textarea
              name="body"
              defaultValue={episode.body ?? ""}
              rows={24}
              className="w-full p-4 border border-hair bg-white text-ink focus:outline-none focus:border-ink font-normal text-[17px] leading-[1.9]"
              dir={episode.lang === "ar" ? "rtl" : "ltr"}
            />
            <span className="text-xs text-muted font-normal">{d.studio.bodyHint}</span>
          </label>
        )}
        <button type="submit" className="self-start px-6 h-11 bg-blue text-white text-sm font-bold hover:bg-blue-deep">
          {d.studio.save}
        </button>
      </form>

      {series.kind === "comic" && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[26px] leading-tight">{d.studio.images}</h2>
          <ImageEditor episodeId={episode.id} initial={images} publicBase={publicBase} />
        </section>
      )}

      <form action={remove} className="pt-4 border-t border-hair">
        <ConfirmButton message={d.studio.confirmDelete} className="text-sm font-semibold text-[#B3261E] underline underline-offset-4">
          {d.studio.delete}
        </ConfirmButton>
      </form>
    </div>
  );
}
