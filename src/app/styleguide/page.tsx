import { Avatar } from "@/components/avatar";
import { Cover } from "@/components/cover";
import { VerifiedMark } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { CoverCard } from "@/components/ui/cover-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SegmentedControl } from "@/components/ui/segmented";
import { Wordmark } from "@/components/wordmark";
import { WEEK_ORDER, weekdayLabel } from "@/lib/constants";
import type { SeriesSummary } from "@/lib/types";

export const metadata = { title: "دليل الأسلوب", robots: { index: false } };

const sample: SeriesSummary = {
  id: "s",
  slug: "sample",
  kind: "comic",
  title: "بنت النيل الأخير",
  titleEn: null,
  genre: "fantasy",
  publishDay: 4,
  coverUrl: null,
  tint: "",
  creator: { id: "c", name: "نور م.", verified: true, handle: "nour", avatarUrl: null },
  latestEpisode: { number: 12, publishedAt: new Date().toISOString() },
  createdAt: new Date().toISOString(),
  languages: ["ar"],
  runStatus: "ongoing",
  ageRating: "all",
};
const novel: SeriesSummary = { ...sample, id: "n", kind: "novel", title: "ميدان الساعة", creator: { ...sample.creator, name: "يوسف ع." }, publishDay: 6 };

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 py-10 border-t border-hair">
      <span className="t-micro" dir="ltr">
        {title}
      </span>
      {children}
    </section>
  );
}

/** Every shared component once. Internal; not linked from the site. */
export default function StyleguidePage() {
  return (
    <div className="wrap pt-10 pb-20 flex flex-col">
      <Row title="wordmark">
        <div className="flex flex-wrap items-end gap-12">
          <Wordmark size="lg" />
          <Wordmark />
          <Wordmark size="sm" micro={false} />
        </div>
      </Row>

      <Row title="type">
        <span className="t-label">منصة عربية للقصص المصوّرة والروايات</span>
        <h1 className="t-h1 max-w-[720px]">
          لدينا
          <br />
          ما نحكيه.
        </h1>
        <h2 className="t-h2">مختارات طومار</h2>
        <span className="t-series">جنّي الطابق الثالث</span>
        <p className="max-w-[60ch] text-ink-2">أعمال أصلية من كتّاب وفنانين عرب. نص عادي بخط IBM Plex Sans Arabic بوزن ٤٠٠، وارتفاع سطر مريح.</p>
        <span className="t-caption">تعليق صغير بلون هادئ.</span>
        <span className="t-micro" dir="ltr">
          web comics · novels · toomar
        </span>
      </Row>

      <Row title="button">
        <div className="flex flex-wrap items-center gap-6">
          <Button variant="primary">ابدأ القراءة</Button>
          <Button variant="secondary">تابع</Button>
          <Button variant="link" href="/studio">
            لديك قصة؟ انشرها
          </Button>
          <Button variant="primary" disabled>
            معطّل
          </Button>
        </div>
      </Row>

      <Row title="tabs">
        <div className="flex flex-wrap items-center gap-10">
          <SegmentedControl active="comics" items={[{ key: "comics", label: "قصص مصوّرة", href: "#" }, { key: "novels", label: "روايات", href: "#" }]} />
          <SegmentedControl active="ar" size="sm" items={[{ key: "ar", label: "عربي", href: "#" }, { key: "en", label: "EN", href: "#" }]} />
        </div>
      </Row>

      <Row title="chip">
        <div className="flex flex-wrap gap-2">
          {WEEK_ORDER.map((d, i) => (
            <Chip key={d} active={i === 0} href="#">
              {weekdayLabel(d)}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip href="#">دراما</Chip>
          <Chip href="#" active>
            فانتازيا
          </Chip>
          <Chip href="#">كوميديا</Chip>
        </div>
      </Row>

      <Row title="verified check · avatar · input">
        <div className="flex flex-wrap items-center gap-6">
          <span className="inline-flex items-center gap-1 text-sm">
            نور م. <VerifiedMark size={12} />
          </span>
          <Avatar src={null} size={56} />
          <input className="field max-w-[280px]" placeholder="البريد الإلكتروني" />
        </div>
      </Row>

      <Row title="cover 2:3 · cover card · compact card">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-6 items-start">
          <Cover src={null} />
          <CoverCard series={sample} compact />
          <CoverCard series={novel} compact />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <CoverCard series={sample} />
          <CoverCard series={novel} />
        </div>
      </Row>

      <Row title="section header">
        <SectionHeader title="مختارات طومار" note="يختارها المحرّر" />
        <SectionHeader title="قصص مصوّرة" note="الكل" href="#" />
      </Row>

      <Row title="closing line">
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="font-display text-[40px] leading-none">يُتبع…</span>
          <span className="text-[15px] text-ink-2">لديك قصة تُروى في حلقات؟</span>
          <Button variant="link" href="/studio">
            انشر على طومار
          </Button>
        </div>
      </Row>
    </div>
  );
}
