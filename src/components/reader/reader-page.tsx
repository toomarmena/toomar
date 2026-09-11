import { notFound } from "next/navigation";
import { ReaderChrome } from "./chrome";
import { ComicView } from "./comic-view";
import { EndCard } from "./end-card";
import { NovelText } from "./novel-text";
import { CreatorNote } from "./creator-note";
import { LikeButton } from "./like-button";
import { ReaderLayoutProvider } from "./layout-provider";
import { ReportLink } from "../report-link";
import { EPISODE_WORD, formatNumber, type ComicLayout, type SeriesKind } from "@/lib/constants";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict, getReaderLayout } from "@/lib/lang-server";
import { getEpisode, getNeighbours, getSeriesById, getSeriesBySlug, hasReacted, isFollowing, listEpisodeImages } from "@/lib/queries";
import { creatorHref } from "@/lib/links";
import { createClient, getUser } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";
import type { EpisodeImages } from "@/lib/types";

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
  const [neighbours, following, liked] = await Promise.all([getNeighbours(series.id, number, contentLang, isPreview), isFollowing(user?.id ?? null, series.id), hasReacted(user?.id ?? null, episode.id)]);
  const here = `${base}/${number}?lang=${contentLang}`;
  const href = (n: number | null) => (n ? `${base}/${n}?lang=${contentLang}` : null);

  const word = EPISODE_WORD[kind][ui];
  const title = contentLang === "en" && series.titleEn ? series.titleEn : series.title;
  const subtitle = `${word} ${formatNumber(number, ui)} · ${series.creator.name}`;

  let novel: React.ReactNode = null;
  let images: EpisodeImages = { vertical: [], horizontal: [] };
  let nextPreview: string[] = [];
  // Only the layouts this episode actually has can be offered.
  let available: ComicLayout[] = ["vertical"];
  let layout: ComicLayout = "vertical";

  if (kind === "comic") {
    images = await listEpisodeImages(episode.id);
    const has = (["vertical", "horizontal"] as const).filter((l) => images[l].length > 0);
    available = has.length ? has : ["vertical"];
    const chosen = await getReaderLayout();
    layout = available.includes(chosen) ? chosen : available[0];

    if (neighbours.next) {
      const supabase = await createClient();
      const { data: nextEp } = await supabase.from("episodes").select("id").eq("series_id", series.id).eq("number", neighbours.next).eq("lang", contentLang).maybeSingle();
      if (nextEp) {
        const { data: firstImages } = await supabase.from("episode_images").select("key").eq("episode_id", nextEp.id).eq("layout", layout).order("position").limit(2);
        nextPreview = (firstImages ?? []).map((i) => mediaUrl(i.key)!).filter(Boolean);
      }
    }
  } else {
    const paragraphs = (episode.body ?? "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    novel = <NovelText title={episode.title || `${word} ${formatNumber(number, ui)}`} paragraphs={paragraphs} lang={contentLang} />;
  }

  const note = episode.note ? <CreatorNote note={episode.note} name={series.creator.name} avatarUrl={series.creator.avatarUrl} href={creatorHref(series.creator)} d={d} lang={contentLang} /> : null;

  const endCard = (
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
      extras={
        isPreview ? null : (
          <>
            <LikeButton episodeId={episode.id} initial={liked} signedIn={!!user} next={here} />
            <ReportLink seriesId={series.id} episodeId={episode.id} />
          </>
        )
      }
    />
  );

  return (
    <ReaderLayoutProvider initial={layout} available={available}>
      <ReaderChrome title={title} subtitle={subtitle} backHref={backHref} track={!isPreview} seriesId={series.id} episodeId={episode.id} number={number} contentLang={contentLang}>
        {kind === "comic" ? (
          <ComicView vertical={images.vertical} horizontal={images.horizontal} dir={contentLang === "ar" ? "rtl" : "ltr"} note={note} endCard={endCard} />
        ) : (
          <>
            {novel}
            {note}
            {endCard}
          </>
        )}
        <span className="sr-only">{d.reader.endOfSeries}</span>
      </ReaderChrome>
    </ReaderLayoutProvider>
  );
}
