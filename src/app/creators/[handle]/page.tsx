import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { VerifiedMark } from "@/components/icons";
import { SeriesGrid } from "@/components/series-card";
import { SocialLinks } from "@/components/social-links";
import { getDict } from "@/lib/lang-server";
import { getCreator, listApproved } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/creators/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const c = await getCreator(handle).catch(() => null);
  return c ? { title: c.name, description: c.bio ?? undefined, openGraph: { title: c.name, description: c.bio ?? undefined, images: c.avatarUrl ? [c.avatarUrl] : undefined } } : {};
}

export default async function CreatorPage({ params }: PageProps<"/creators/[handle]">) {
  const { handle } = await params;
  const { lang, d } = await getDict();
  const creator = await getCreator(handle);
  if (!creator) notFound();
  const series = await listApproved({ creatorId: creator.id, lang });

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-12 pt-6 md:pt-12 flex flex-col gap-8 md:gap-12">
      <section className="flex flex-col md:flex-row md:items-start gap-5 md:gap-8">
        <Avatar src={creator.avatarUrl} name={creator.name} size={112} />
        <div className="flex flex-col gap-3 min-w-0">
          <h1 className="font-display text-[34px] md:text-[44px] leading-tight flex items-center gap-2.5">
            {creator.name}
            {creator.verified && <VerifiedMark className="w-[20px] h-[20px] mt-1" />}
          </h1>
          <span className="text-sm text-muted" dir="ltr">
            @{creator.handle}
          </span>
          {creator.bio && <p className="text-base leading-relaxed text-ink-2 whitespace-pre-line max-w-[60ch]">{creator.bio}</p>}
          <SocialLinks links={creator.socialLinks} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[28px] md:text-[34px] leading-tight">{d.creator.series}</h2>
        <SeriesGrid items={series} empty={d.creator.noSeries} />
      </section>
    </div>
  );
}
