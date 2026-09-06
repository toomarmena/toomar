import Link from "next/link";
import { notFound } from "next/navigation";
import { Cover } from "./cover";
import { FollowButton } from "./follow-button";
import { VerifiedMark } from "./icons";
import { EPISODE_WORD, formatNumber, genreLabel, weekdayLabel, type SeriesKind } from "@/lib/constants";
import { fill, isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/lang-server";
import { getProgress, getSeriesBySlug, isFollowing, listEpisodes } from "@/lib/queries";
import { getUser } from "@/lib/supabase/server";

function formatDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "long", timeZone: "Africa/Cairo" }).format(new Date(iso));
}

export async function SeriesPage({ kind, slug, langParam }: { kind: SeriesKind; slug: string; langParam?: string }) {
  const { lang: ui, d } = await getDict();
  const series = await getSeriesBySlug(slug, ui);
  if (!series || series.kind !== kind) notFound();

  // The content language: the URL wins, then the interface language, then whatever exists.
  const wanted = isLang(langParam) ? langParam : ui;
  const contentLang: Lang = series.languages.includes(wanted) ? wanted : series.languages[0];
  const base = `/${kind === "comic" ? "comics" : "novels"}/${series.slug}`;

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

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-12 pt-4 md:pt-12 flex flex-col gap-8 md:gap-12">
      <section className="grid grid-cols-[120px_1fr] md:grid-cols-[260px_1fr] gap-5 md:gap-10 items-start">
        <div className="md:sticky md:top-6">
          <Cover src={series.coverUrl} title={title} tint={series.tint} priority />
        </div>
        <div className="flex flex-col gap-3 md:gap-5 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <span className={`text-[11px] md:text-xs font-semibold tracking-[0.06em] ${kind === "comic" ? "text-blue" : "text-violet"}`}>
              {genreLabel(series.genre, ui)} · {kind === "comic" ? d.nav.comics : d.nav.novels}
            </span>
            {series.languages.length > 1 && (
              <div className="flex border border-hair text-xs font-semibold" role="group" aria-label={d.series.language}>
                {series.languages.map((l) => (
                  <Link key={l} href={`${base}?lang=${l}`} className={`px-3 py-1.5 ${l === contentLang ? "bg-ink text-white" : "text-ink-2 hover:text-ink"}`} aria-current={l === contentLang ? "true" : undefined}>
                    {l === "ar" ? d.series.arabic : d.series.english}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <h1 className="font-display text-[30px] md:text-[48px] leading-tight text-balance" lang={contentLang} dir={contentLang === "ar" ? "rtl" : "ltr"}>
            {title}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-ink-2">
            <span className="text-muted">{d.series.by}</span>
            <span className="font-semibold text-ink">{series.creator.name}</span>
            {series.creator.verified && <VerifiedMark />}
          </p>
          <p className="text-sm text-ink-2">
            <span className="text-muted">{d.series.publishDay}:</span> {fill(d.series.every, { day: weekdayLabel(series.publishDay, ui) })}
          </p>
          <div className="hidden md:block">
            {description && (
              <p className="text-base leading-relaxed text-ink-2 whitespace-pre-line" lang={contentLang} dir={contentLang === "ar" ? "rtl" : "ltr"}>
                {description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {latest && (
              <Link href={`${base}/${continueTo ?? firstNumber}?lang=${contentLang}`} className="inline-flex items-center h-12 px-6 bg-ink text-white font-bold text-[15px]">
                {continueTo ? `${d.series.continueReading} · ${word} ${formatNumber(continueTo, ui)}` : d.series.startReading}
              </Link>
            )}
            <FollowButton seriesId={series.id} initial={following} signedIn={!!user} next={base} size="lg" />
          </div>
        </div>
      </section>

      {description && (
        <p className="md:hidden text-[15px] leading-relaxed text-ink-2 whitespace-pre-line -mt-2" lang={contentLang} dir={contentLang === "ar" ? "rtl" : "ltr"}>
          {description}
        </p>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[28px] md:text-[34px] leading-tight">{kind === "comic" ? d.series.episodes : d.series.chapters}</h2>
        {episodes.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted border border-dashed border-hair">{kind === "comic" ? d.series.noEpisodes : d.series.noChapters}</p>
        ) : (
          <ol className="divide-y divide-hair border-y border-hair">
            {episodes.map((e) => (
              <li key={e.id}>
                <Link href={`${base}/${e.number}?lang=${contentLang}`} className="flex items-center gap-4 py-3.5 hover:bg-surface -mx-2 px-2">
                  <span className="font-display text-2xl w-12 text-center text-ink shrink-0">{formatNumber(e.number, ui)}</span>
                  <span className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="font-semibold truncate" lang={contentLang} dir={contentLang === "ar" ? "rtl" : "ltr"}>
                      {e.title || `${word} ${formatNumber(e.number, ui)}`}
                    </span>
                    {e.publishedAt && <span className="text-xs text-muted">{formatDate(e.publishedAt, ui)}</span>}
                  </span>
                  {progress?.number === e.number && <span className="text-[11px] font-semibold text-blue shrink-0">{d.library.lastRead}</span>}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
