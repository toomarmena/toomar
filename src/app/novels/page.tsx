import { SeriesRail } from "@/components/series-card";
import { Section } from "@/components/section";
import { SAMPLE_SERIES } from "@/lib/sample-data";

export const metadata = { title: "روايات" };

export default function NovelsPage() {
  const items = SAMPLE_SERIES.filter((s) => s.kind === "novel");
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-12 pt-6 md:pt-12">
      <Section title="روايات" lead="فصول قصيرة تُقرأ في جلسة واحدة، تصدر في مواعيد ثابتة.">
        <SeriesRail items={items} priorityFirst />
      </Section>
    </div>
  );
}
