import { Hero } from "@/components/home/hero";
import { Button } from "@/components/ui/button";
import { CoverCard } from "@/components/ui/cover-card";
import { SectionHeader } from "@/components/ui/section-header";
import { WeekSchedule } from "@/components/week-schedule";
import type { Lang } from "@/lib/i18n";
import { getDict } from "@/lib/lang-server";
import { cairoWeekday, listApproved, listPicks } from "@/lib/queries";
import type { SeriesSummary } from "@/lib/types";

/** Assembles the home sections. Runs on the server per request. */
async function homeData(lang: Lang) {
  const [all, picks] = await Promise.all([listApproved({ lang }), listPicks(lang)]);
  return {
    picks, // hand-ordered by the editor; never padded
    running: all.filter((s) => s.runStatus === "ongoing"),
    comics: all.filter((s) => s.kind === "comic").slice(0, 8),
    novels: all.filter((s) => s.kind === "novel").slice(0, 8),
    today: cairoWeekday(),
  };
}

function Grid({ items, priority = false }: { items: SeriesSummary[]; priority?: boolean }) {
  return (
    <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {items.map((s, i) => (
        <li key={s.id}>
          <CoverCard series={s} priority={priority && i < 4} />
        </li>
      ))}
    </ul>
  );
}

export default async function HomePage() {
  const { lang, d } = await getDict();
  const { picks, running, comics, novels, today } = await homeData(lang);

  return (
    <div className="flex flex-col">
      <Hero d={d} />

      {picks.length > 0 && (
        <section className="wrap section flex flex-col gap-6 md:gap-8">
          <SectionHeader title={d.home.picks} note={d.home.picksNote} />
          <Grid items={picks} priority />
        </section>
      )}

      <section className="wrap section flex flex-col gap-6 md:gap-8">
        <SectionHeader title={d.home.schedule} />
        <WeekSchedule items={running} today={today} />
      </section>

      <section className="wrap section section-end flex flex-col gap-6 md:gap-8">
        <SectionHeader title={d.nav.comics} note={d.section.all} href="/comics" />
        {comics.length ? <Grid items={comics} /> : <p className="t-caption py-10 text-center">{d.home.empty}</p>}
      </section>

      <section className="bg-paper-2">
        <div className="wrap section section-end flex flex-col gap-6 md:gap-8">
          <SectionHeader title={d.nav.novels} note={d.section.all} href="/novels" />
          {novels.length ? <Grid items={novels} /> : <p className="t-caption py-10 text-center">{d.home.empty}</p>}
        </div>
      </section>

      <section className="wrap section section-end flex flex-col items-center gap-3 text-center">
        <span className="font-display text-[40px] leading-none">{d.home.toBeContinued}</span>
        <span className="text-[15px] text-ink-2">{d.home.closingLine}</span>
        <Button variant="link" href="/studio">
          {d.home.publishOn}
        </Button>
      </section>
    </div>
  );
}
