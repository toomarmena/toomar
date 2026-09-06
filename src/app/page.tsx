import Link from "next/link";
import { Section } from "@/components/section";
import { SeriesRail } from "@/components/series-card";
import { WeekSchedule } from "@/components/week-schedule";
import { IconArrowLeft } from "@/components/icons";
import { GENRES } from "@/lib/constants";
import type { Lang } from "@/lib/i18n";
import { getDict } from "@/lib/lang-server";
import { cairoWeekday, listApproved, listPicks } from "@/lib/queries";

const WEEK = 7 * 86400000;

/** Assembles the home sections. Runs on the server per request. */
async function homeData(lang: Lang) {
  const [all, picks] = await Promise.all([listApproved({ lang }), listPicks(lang)]);
  const now = Date.now();
  const thisWeek = all
    .filter((s) => s.latestEpisode && now - Date.parse(s.latestEpisode.publishedAt) < WEEK)
    .sort((a, b) => Date.parse(b.latestEpisode!.publishedAt) - Date.parse(a.latestEpisode!.publishedAt));
  const running = all.filter((s) => s.runStatus === "ongoing");
  return { running, picks, thisWeek, fresh: all.slice(0, 6), today: cairoWeekday(now) };
}

export default async function HomePage() {
  const { lang, d } = await getDict();
  const { running, picks, thisWeek, fresh, today } = await homeData(lang);

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-12 flex flex-col gap-12 md:gap-16 pb-8">
      <section className="pt-6 md:pt-16 flex flex-col gap-4 md:gap-7 md:max-w-[720px]">
        <span className="inline-flex items-center gap-2.5 text-[13px] font-semibold text-blue tracking-[0.04em]">
          <span className="inline-block w-7 h-0.5 bg-blue" />
          {d.home.eyebrow}
        </span>
        <h1 className={`font-display leading-[1.15] text-balance ${lang === "ar" ? "text-[44px] md:text-[84px]" : "text-[40px] md:text-[72px]"}`}>
          {d.home.h1a}
          <br />
          {d.home.h1b}
        </h1>
        <p className="text-base md:text-xl leading-relaxed text-ink-2 max-w-[560px]">{d.home.lede}</p>
        <div className="flex items-center gap-5 pt-1">
          <Link href="/comics" className="inline-flex items-center gap-3 px-6 py-3.5 md:px-7 md:py-4 bg-blue text-white font-bold text-[15px] md:text-[17px] hover:bg-blue-deep">
            {d.home.start}
            <IconArrowLeft width={20} height={20} strokeWidth={2.4} className={lang === "en" ? "-scale-x-100" : undefined} />
          </Link>
          <Link href="/studio" className="text-[15px] font-medium text-ink-2 border-b border-hair pb-0.5 hover:text-ink hover:border-ink">
            {d.home.haveStory}
          </Link>
        </div>
      </section>

      {picks.length > 0 && (
        <Section title={d.home.picks} lead={d.home.picksLead}>
          <SeriesRail items={picks} priorityFirst />
        </Section>
      )}

      <Section title={d.home.thisWeek} lead={d.home.thisWeekLead} href="/comics" hrefLabel={d.home.allSeries}>
        <SeriesRail items={thisWeek} empty={d.home.empty} />
      </Section>

      <Section title={d.home.schedule} lead={d.home.scheduleLead}>
        <WeekSchedule items={running} today={today} />
      </Section>

      <Section title={d.home.fresh} lead={d.home.freshLead}>
        <SeriesRail items={fresh} empty={d.home.empty} />
      </Section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[28px] md:text-[34px] leading-tight">{d.home.byGenre}</h2>
        <ul className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <li key={g.key}>
              <Link href={`/comics?genre=${g.key}`} className="inline-block px-4 py-2 text-sm font-semibold bg-surface border border-hair hover:border-ink">
                {g[lang]}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="-mx-4 md:mx-0 bg-yellow text-ink px-6 py-10 md:px-14 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-display text-[56px] md:text-[72px] leading-none">{d.home.toBeContinued}</span>
          <span className="text-base md:text-lg font-medium">{d.home.publishFirst}</span>
        </div>
        <Link href="/studio" className="self-start md:self-auto px-8 py-4 bg-ink text-white font-bold text-[17px]">
          {d.home.publishOn}
        </Link>
      </section>
    </div>
  );
}
