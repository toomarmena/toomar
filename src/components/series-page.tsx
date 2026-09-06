import Link from "next/link";
import { notFound } from "next/navigation";
import { Cover } from "./cover";
import { FollowButton } from "./follow-button";
import { VerifiedMark } from "./icons";
import { ShareLink } from "./share-link";
import { ReportLink } from "./report-link";
import { Button } from "./ui/button";
import { SegmentedControl } from "./ui/segmented";
import { AGE_RATING, EPISODE_WORD, RUN_STATUS, formatNumber, genreLabel, weekdayLabel, type SeriesKind } from "@/lib/constants";
import { fill, isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/lang-server";
import { creatorHref } from "@/lib/links";
import { getProgress, getSeriesBySlug, isFollowing, listEpisodes } from "@/lib/queries";
import { getUser } from "@/lib/supabase/server";

function formatDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "long", timeZone: "Africa/Cairo" }).format(new Date(iso));
}

/** Gallery series page: the cover centered on a quiet ground, everything under it. */
export async function SeriesPage({ kind, slug, langParam }: { kind: SeriesKind; slug: string; langParam?: string }) {
  const { lang: ui, d } = await getDict();
  const series = await getSeriesBySlug(slug, ui);
  if (!series || series.kind !== kind) notFound();

  // The content language: the URL wins, then the interface language, then whatever exists.
  const wanted = isLang(langParam) ? langParam : ui;
  const contentLang: Lang = series.languages.includes(wanted) ? wanted : series.languages[0];
  const base = `/${kind === "comic" ? "comics" : "novels"}/${series.slug}`;
  const dir = contentLang === "ar" ? "rtl" : "ltr";

  const user = await getUser().catch(() => null);
  const [episodes, following, progress] = await Promise.all([
    listEpisodes(series.id, contentLang),
    isFollowing(user?.id ?? null, series.id),
    getProgress(user?.id ?? null, series.id),
  ]);

  const title = contentLang === "en" && series.titleEn ? series.titleEn : series.title;
  const description = contentLang === "en" ? series.descriptionEn || series.descriptionAr : series.descriptionAr || series.descriptionEn;
  const word = EPISODE_WORD[kind][ui];
  const latest = episodes[0];
  const continueTo = progress && episodes.some((e) => e.number === progress.number) ? progress.number : null;
  const firstNumber = episodes.length ? episodes[episodes.length - 1].number : null;
  const schedule = series.runStatus === "ongoing" ? fill(d.series.every, { day: weekdayLabel(series.publishDay, ui) }) : RUN_STATUS.find((r) => r.key === series.runStatus)?.[ui];
  const age = series.ageRating !== "all" ? AGE_RATING.find((r) => r.key === series.ageRating)?.short[ui] : null;

  return (
    <div className="flex flex-col">
      <header className="bg-paper-2 border-b border-hair">
        <div className="wrap flex flex-col items-center text-center py-10 md:py-14 gap-6 md:gap-7">
          <div className="w-[60vw] max-w-[280px] md:w-[320px] md:max-w-[320px]">
            <Cover src={series.coverUrl} priority />
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className={`t-micro ${kind === "novel" ? "text-violet" : ""}`} dir="ltr">
              {kind === "novel" ? "novels" : "web comics"}
            </span>
            <h1 className="font-display text-[28px] md:text-[40px] leading-[1.2] text-balance max-w-[720px]" lang={contentLang} dir={dir}>
              {title}
            </h1>
            <p className="t-caption flex flex-wrap items-center justify-center gap-1">
              <Link href={creatorHref(series.creator)} className="inline-flex items-center gap-1 hover:text-blue transition-colors">
                {series.creator.name}
                {series.creator.verified && <VerifiedMark size={12} />}
              </Link>
              <span aria-hidden>·</span>
              <span>{genreLabel(series.genre, ui)}</span>
              <span aria-hidden>·</span>
              <span>{schedule}</span>
              {age && (
                <>
                  <span aria-hidden>·</span>
                  <span>{age}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {latest && (
              <Button href={`${base}/${continueTo ?? firstNumber}?lang=${contentLang}`} variant="primary">
                {continueTo ? `${d.series.continueReading} · ${word} ${formatNumber(continueTo, ui)}` : d.series.startReading}
              </Button>
            )}
            <FollowButton seriesId={series.id} initial={following} signedIn={!!user} next={base} />
            {series.languages.length > 1 && (
              <SegmentedControl
                size="sm"
                label={d.series.language}
                active={contentLang}
                items={series.languages.map((l) => ({ key: l, label: l === "ar" ? "عربي" : "EN", href: `${base}?lang=${l}` }))}
              />
            )}
          </div>
          <ShareLink path={base} title={title} creator={series.creator.name} />
        </div>
      </header>

      <div className="wrap max-w-[760px] flex flex-col gap-12 md:gap-16 pt-10 md:pt-16 section-end">
        {description && (
          <p className="text-[15px] md:text-[16px] leading-[1.75] text-ink-2 max-w-[60ch] whitespace-pre-line" lang={contentLang} dir={dir}>
            {description}
          </p>
        )}

        <section className="flex flex-col">
          <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-hair">
            <h2 className="t-h2">{kind === "comic" ? d.series.episodes : d.series.chapters}</h2>
            <span className="t-caption">{d.series.newestFirst}</span>
          </div>
          {episodes.length === 0 ? (
            <p className="t-caption py-10 text-center">{kind === "comic" ? d.series.noEpisodes : d.series.noChapters}</p>
          ) : (
            <ol className="divide-y divide-hair">
              {episodes.map((e, i) => (
                <li key={e.id}>
                  <Link href={`${base}/${e.number}?lang=${contentLang}`} className="group flex items-center gap-4 py-3.5">
                    <div className="w-10 shrink-0 cover-hover">
                      {e.thumbUrl ? (
                        <Cover src={e.thumbUrl} />
                      ) : (
                        <span className="cover-2-3 flex items-center justify-center font-display text-[15px] text-ink-2">{formatNumber(e.number, ui)}</span>
                      )}
                    </div>
                    <span className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-[15px] leading-snug group-hover:text-blue transition-colors" lang={contentLang} dir={dir}>
                        {e.title ? `${word} ${formatNumber(e.number, ui)} · ${e.title}` : `${word} ${formatNumber(e.number, ui)}`}
                        {i === 0 && <span className="t-caption ms-2">{d.series.newLabel}</span>}
                      </span>
                      <span className="t-caption">
                        {e.publishedAt && formatDate(e.publishedAt, ui)}
                        {progress?.number === e.number && ` · ${d.library.lastRead}`}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
        <div className="flex justify-end">
          <ReportLink seriesId={series.id} />
        </div>
      </div>
    </div>
  );
}
