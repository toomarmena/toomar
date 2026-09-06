import { notFound } from "next/navigation";
import { ReaderChrome } from "./chrome";
import { ComicStrip } from "./strip";
import { EndCard } from "./end-card";
import { NovelText } from "./novel-text";
import { EPISODE_WORD, formatNumber, type SeriesKind } from "@/lib/constants";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/lang-server";
import { getEpisode, getNeighbours, getSeriesById, getSeriesBySlug, isFollowing, listEpisodeImages } from "@/lib/queries";
import { creatorHref } from "@/lib/links";
import { createClient, getUser } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";

/** Shared by the comic and novel reader routes. */
export async function ReaderPage({
  kind: kindParam,
  slug,
  numberParam,
  langParam,
  preview,
}: {
  kind: SeriesKind;
  slug: string;
  numberParam: string;
  langParam?: string;
  /** A series id: renders unpublished episodes for the owner or the editor, and records nothing. */
  preview?: string;
}) {
  const number = Number(numberParam);
  if (!Number.isInteger(number) || number < 1) notFound();
  const { lang: ui, d } = await getDict();
  const series = preview ? await getSeriesById(preview, ui) : await getSeriesBySlug(slug, ui);
  if (!series || (!preview && series.kind !== kindParam)) notFound();
  const kind = series.kind;
  const isPreview = !!preview;

  const wanted = isLang(langParam) ? langParam : ui;
  const contentLang: Lang = series.languages.includes(wanted) ? wanted : series.languages[0];
  const episode = await getEpisode(series.id, number, contentLang, isPreview);
  if (!episode) notFound();

  const base = isPreview ? `/preview/${series.id}` : `/${kind === "comic" ? "comics" : "novels"}/${series.slug}`;
  const backHref = isPreview ? `/studio/${series.id}` : `${base}?lang=${contentLang}`;
  const user = await getUser().catch(() => null);
  const [neighbours, following] = await Promise.all([getNeighbours(series.id, number, contentLang, isPreview), isFollowing(user?.id ?? null, series.id)]);
  const href = (n: number | null) => (n ? `${base}/${n}?lang=${contentLang}` : null);

  const word = EPISODE_WORD[kind][ui];
  const title = contentLang === "en" && series.titleEn ? series.titleEn : series.title;
  const subtitle = `${word} ${formatNumber(number, ui)} · ${series.creator.name}`;

  let content: React.ReactNode;
  let nextPreview: string[] = [];

  if (kind === "comic") {
    const images = await listEpisodeImages(episode.id);
    if (neighbours.next) {
      const supabase = await createClient();
      const { data: nextEp } = await supabase.from("episodes").select("id").eq("series_id", series.id).eq("number", neighbours.next).eq("lang", contentLang).maybeSingle();
      if (nextEp) {
        const { data: firstImages } = await supabase.from("episode_images").select("key").eq("episode_id", nextEp.id).order("position").limit(2);
        nextPreview = (firstImages ?? []).map((i) => mediaUrl(i.key)!).filter(Boolean);
      }
    }
    content = <ComicStrip images={images} />;
  } else {
    const paragraphs = (episode.body ?? "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    content = <NovelText title={episode.title || `${word} ${formatNumber(number, ui)}`} paragraphs={paragraphs} lang={contentLang} />;
  }

  return (
    <ReaderChrome
      title={title}
      subtitle={subtitle}
      backHref={backHref}
      track={!isPreview}
      seriesId={series.id}
      episodeId={episode.id}
      number={number}
      contentLang={contentLang}
    >
      {content}
      <EndCard
        kind={kind}
        seriesId={series.id}
        episodeId={episode.id}
        number={number}
        publishDay={series.publishDay}
        runStatus={series.runStatus}
        creatorName={series.creator.name}
        creatorHref={creatorHref(series.creator)}
        prevHref={href(neighbours.prev)}
        nextHref={href(neighbours.next)}
        nextPreview={nextPreview}
        seriesHref={backHref}
        track={!isPreview}
        following={following}
        signedIn={!!user}
      />
      <span className="sr-only">{d.reader.endOfSeries}</span>
    </ReaderChrome>
  );
}
