import { Button } from "@/components/ui/button";
import type { Dict } from "@/lib/i18n";

/** Text only. The headline is the picture; the covers below do the rest. */
export function Hero({ d }: { d: Dict }) {
  return (
    <section className="wrap pt-14 pb-10 md:pt-[120px] md:pb-20">
      <div className="flex flex-col gap-5 md:gap-7 max-w-[720px]">
        <span className="t-label">{d.home.eyebrow}</span>
        <h1 className="t-h1 text-balance">
          {d.home.h1a}
          <br />
          {d.home.h1b}
        </h1>
        <p className="m-0 text-[16px] md:text-[18px] leading-[1.7] text-ink-2">{d.home.lede}</p>
        <div className="flex flex-wrap items-center gap-6 pt-1">
          <Button href="/comics" variant="primary">
            {d.home.start}
          </Button>
          <Button href="/studio" variant="link">
            {d.home.haveStory}
          </Button>
        </div>
      </div>
    </section>
  );
}
