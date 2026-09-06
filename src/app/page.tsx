import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { CoverCard } from "@/components/ui/cover-card";
import { PosterBlock } from "@/components/ui/poster-block";
import { SectionHeader } from "@/components/ui/section-header";
import { WeekSchedule } from "@/components/week-schedule";
import type { Lang } from "@/lib/i18n";
import { getDict } from "@/lib/lang-server";
import { cairoWeekday, listApproved, listPicks } from "@/lib/queries";

/** Assembles the home sections. Runs on the server per request. */
async function homeData(lang: Lang) {
  const [all, picksRaw] = await Promise.all([listApproved({ lang }), listPicks(lang)]);
  // The editor's picks, hand-ordered; until three are chosen, the newest series fill the row.
  const picks = picksRaw.length >= 3 ? picksRaw : [...picksRaw, ...all.filter((s) => !picksRaw.some((p) => p.id === s.id))].slice(0, 3);
  const running = all.filter((s) => s.runStatus === "ongoing");
  return { picks, running, featured: picks[0] ?? null, today: cairoWeekday() };
}

export default async function HomePage() {
  const { lang, d } = await getDict();
  const { picks, running, featured, today } = await homeData(lang);
  const pad = "px-5 md:px-16";

  return (
    <div className="flex flex-col">
      <Hero featured={featured} lang={lang} d={d} />

      <section className={`pt-10 md:pt-12 flex flex-col gap-5 md:gap-[22px] ${pad}`}>
        <div className="hidden md:block">
          <SectionHeader title={d.home.picks} note={d.home.picksNote} />
        </div>
        <div className="md:hidden">
          <SectionHeader title={d.home.picks} note={d.section.all} href="/comics" />
        </div>
        {picks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted frame border-dashed">{d.home.empty}</p>
        ) : (
          <>
            <ul className="md:hidden flex gap-5 overflow-x-auto no-scrollbar -mx-5 px-5 pt-1 pb-4">
              {picks.map((s, i) => (
                <li key={s.id} className="shrink-0">
                  <CoverCard series={s} priority={i < 2} width={170} />
                </li>
              ))}
            </ul>
            <ul className="hidden md:grid grid-cols-3 gap-6">
              {picks.slice(0, 3).map((s, i) => (
                <li key={s.id}>
                  <CoverCard series={s} priority={i < 3} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className={`pt-12 md:pt-14 flex flex-col gap-5 md:gap-[18px] ${pad}`}>
        <SectionHeader title={d.home.schedule} />
        <WeekSchedule items={running} today={today} />
      </section>

      <section className={`pt-14 md:pt-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 ${pad}`}>
        <PosterBlock kind="comic" micro="WEB COMICS" title={d.nav.comics} text={d.section.comicsLead} href="/comics" />
        <PosterBlock kind="novel" micro="NOVELS" title={d.nav.novels} text={d.section.novelsLead} href="/novels" />
      </section>

      <section className="mt-16 md:mt-[72px] bg-yellow text-ink border-t-2 border-ink px-5 py-12 md:px-16 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="flex flex-col gap-2">
          <span className="font-display text-[60px] md:text-[96px] leading-none">{d.home.toBeContinued}</span>
          <span className="text-base md:text-lg font-semibold">{d.home.publishFirst}</span>
        </div>
        <Link href="/studio" className="self-start md:self-auto inline-flex items-center h-12 md:h-14 px-8 bg-ink text-white font-bold text-[17px] frame shadow-hard-white press">
          {d.home.publishOn}
        </Link>
      </section>
    </div>
  );
}
