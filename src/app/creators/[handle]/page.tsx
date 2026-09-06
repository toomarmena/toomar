import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { VerifiedMark } from "@/components/icons";
import { SocialLinks } from "@/components/social-links";
import { CoverGrid } from "@/components/ui/cover-card";
import { SectionHeader } from "@/components/ui/section-header";
import { getDict } from "@/lib/lang-server";
import { getCreator, listApproved } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/creators/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const c = await getCreator(handle).catch(() => null);
  return c ? { title: c.name, description: c.bio ?? undefined, openGraph: { title: c.name, description: c.bio ?? undefined, images: c.avatarUrl ? [c.avatarUrl] : undefined } } : {};
}

/** A creator's page in the read.cv spirit: picture, name, a few lines, links, then the work. */
export default async function CreatorPage({ params }: PageProps<"/creators/[handle]">) {
  const { handle } = await params;
  const { lang, d } = await getDict();
  const creator = await getCreator(handle);
  if (!creator) notFound();
  const series = await listApproved({ creatorId: creator.id, lang });

  return (
    <div className="wrap pt-10 md:pt-16 section-end flex flex-col gap-12 md:gap-16">
      <section className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10 max-w-[720px]">
        <Avatar src={creator.avatarUrl} size={96} />
        <div className="flex flex-col gap-3 min-w-0">
          <h1 className="t-h1 flex items-center gap-2">
            {creator.name}
            {creator.verified && <VerifiedMark size={18} className="mt-1" />}
          </h1>
          <span className="t-micro" dir="ltr">
            @{creator.handle}
          </span>
          {creator.bio && <p className="text-ink-2 whitespace-pre-line max-w-[60ch]">{creator.bio}</p>}
          <SocialLinks links={creator.socialLinks} />
        </div>
      </section>

      <section className="flex flex-col gap-6 md:gap-8">
        <SectionHeader title={d.creator.series} />
        <CoverGrid items={series} empty={d.creator.noSeries} priority />
      </section>
    </div>
  );
}
