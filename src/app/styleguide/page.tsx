import { Avatar } from "@/components/avatar";
import { Cover } from "@/components/cover";
import { VerifiedMark } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { CoverCard, CoverTile } from "@/components/ui/cover-card";
import { PosterBlock } from "@/components/ui/poster-block";
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
  tint: "#FF7A59",
  creator: { id: "c", name: "نور م.", verified: true, handle: "nour", avatarUrl: null },
  latestEpisode: { number: 12, publishedAt: new Date().toISOString() },
  createdAt: new Date().toISOString(),
  languages: ["ar"],
  runStatus: "ongoing",
  ageRating: "all",
};
const novel: SeriesSummary = { ...sample, id: "n", kind: "novel", title: "ميدان الساعة", creator: { ...sample.creator, name: "يوسف ع." }, latestEpisode: { number: 8, publishedAt: new Date().toISOString() }, publishDay: 6 };

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 py-8 border-t-2 border-ink">
      <span className="t-note">{title}</span>
      {children}
    </section>
  );
}

/** Every shared component once. Internal; not linked from the site. */
export default function StyleguidePage() {
  return (
    <div className="mx-auto max-w-[1100px] px-[18px] md:px-16 pt-8 pb-16 flex flex-col">
      <Row title="WordMark">
        <div className="flex flex-wrap items-end gap-10">
          <Wordmark size="lg" />
          <Wordmark />
          <Wordmark size="sm" />
        </div>
      </Row>

      <Row title="Type">
        <span className="t-label">منصة عربية للقصص المصوّرة والروايات</span>
        <h1 className="t-h1 text-balance">
          لدينا
          <br />
          ما نحكيه.
        </h1>
        <h2 className="t-h2">مختارات طومار</h2>
        <span className="t-series">جنّي الطابق الثالث</span>
        <p className="max-w-[52ch] text-ink-2">أعمال أصلية من كتّاب وفنانين عرب. نص عادي بخط IBM Plex Sans Arabic، بحجم ١٦ بكسل وارتفاع سطر ١٫٧ على الشاشات الكبيرة.</p>
        <span className="text-sm text-muted">نص صغير ١٤ بكسل.</span>
        <span className="t-micro text-muted" dir="ltr">
          web comics · novels · toomar
        </span>
      </Row>

      <Row title="Button">
        <div className="flex flex-wrap items-center gap-6">
          <Button variant="primary" size="lg">
            ابدأ القراءة
          </Button>
          <Button variant="secondary">انشر عملك</Button>
          <Button variant="tertiary">تابع</Button>
          <Button variant="link" href="/studio">
            لديك قصة؟ انشرها
          </Button>
          <Button variant="primary" disabled>
            معطّل
          </Button>
        </div>
      </Row>

      <Row title="SegmentedControl">
        <div className="flex flex-wrap items-center gap-6">
          <SegmentedControl active="comics" items={[{ key: "comics", label: "قصص مصوّرة", href: "#" }, { key: "novels", label: "روايات", href: "#" }]} />
          <SegmentedControl active="ar" size="sm" shadow items={[{ key: "ar", label: "عربي", href: "#" }, { key: "en", label: "EN", href: "#" }]} />
        </div>
      </Row>

      <Row title="Chip">
        <div className="flex flex-wrap gap-2 md:gap-2.5">
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

      <Row title="Badge · VerifiedCheck · Avatar">
        <div className="flex flex-wrap items-center gap-4">
          <Badge>قصص مصوّرة</Badge>
          <Badge>روايات</Badge>
          <Badge tone="new">جديد</Badge>
          <span className="inline-flex items-center gap-1 text-sm">
            نور م. <VerifiedMark />
          </span>
          <span className="inline-flex items-center gap-1 text-sm bg-blue text-white px-2 py-1">
            نور م. <VerifiedMark onDark />
          </span>
          <Avatar src={null} name="نور" size={56} />
        </div>
      </Row>

      <Row title="Cover (2:3) · CoverCard · CoverTile">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 items-start">
          <Cover src={null} title="سكة الملح" />
          <Cover src={null} title="أوضة ٧" shadow />
          <CoverTile series={sample} />
          <CoverTile series={novel} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          <CoverCard series={sample} />
          <CoverCard series={novel} />
        </div>
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar -mx-[18px] px-[18px] md:mx-0 md:px-0">
          <CoverCard series={sample} width={170} />
          <CoverCard series={novel} width={170} />
          <CoverCard series={{ ...sample, id: "x", title: "سكة الملح" }} width={170} />
        </div>
      </Row>

      <Row title="SectionHeader">
        <SectionHeader title="مختارات طومار" note="يختارها المحرر · تتجدد كل أسبوع" />
        <SectionHeader title="جدول الأسبوع" note="الكل" href="#" />
      </Row>

      <Row title="PosterBlock">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PosterBlock kind="comic" micro="WEB COMICS" title="قصص مصوّرة" text="شريط رأسي متصل، تقرأه بالتمرير دون تقليب صفحات. حلقة جديدة كل أسبوع." href="#" />
          <PosterBlock kind="novel" micro="NOVELS" title="روايات" text="فصول قصيرة تُقرأ في جلسة واحدة، تصدر في مواعيد ثابتة." href="#" />
        </div>
      </Row>

      <Row title="Band">
        <div className="-mx-[18px] md:mx-0 bg-yellow text-ink border-y-2 md:border-2 border-ink px-6 py-8 md:px-14 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-display text-[60px] md:text-[96px] leading-none">يُتبع…</span>
            <span className="text-base md:text-lg font-semibold">لديك قصة؟ انشر حلقتها الأولى اليوم.</span>
          </div>
          <span className="self-start inline-flex items-center h-12 md:h-14 px-8 bg-ink text-white font-bold text-[17px] frame shadow-hard-white press">انشر على طومار</span>
        </div>
      </Row>
    </div>
  );
}
