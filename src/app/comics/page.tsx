import { SeriesRail } from "@/components/series-card";
import { Section } from "@/components/section";
import { SAMPLE_SERIES } from "@/lib/sample-data";

export const metadata = { title: "قصص مصوّرة" };

export default function ComicsPage() {
  const items = SAMPLE_SERIES.filter((s) => s.kind === "comic");
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-12 pt-6 md:pt-12">
      <Section title="قصص مصوّرة" lead="شريط رأسي متصل، تقرأه بالتمرير دون تقليب صفحات.">
        <SeriesRail items={items} priorityFirst />
      </Section>
    </div>
  );
}
