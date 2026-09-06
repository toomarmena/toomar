import Link from "next/link";
import { CreatorGrid } from "@/components/creator-card";
import { CoverGrid } from "@/components/ui/cover-card";
import { getDict } from "@/lib/lang-server";
import { searchCreators, searchSeries } from "@/lib/queries";

export async function generateMetadata() {
  const { d } = await getDict();
  return { title: d.search.title };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const term = typeof q === "string" ? q : "";
  const { lang, d } = await getDict();
  const [items, creators] = term ? await Promise.all([searchSeries(term, lang), searchCreators(term)]) : [[], []];

  return (
    <div className="wrap pt-10 md:pt-16 section-end flex flex-col gap-8">
      <form action="/search" className="max-w-[560px]">
        <input name="q" type="search" defaultValue={term} placeholder={d.search.placeholder} autoFocus={!term} className="field" aria-label={d.search.title} />
      </form>
      {term ? (
        items.length === 0 && creators.length === 0 ? (
          <p className="t-caption">{d.search.empty}</p>
        ) : (
          <>
            {creators.length > 0 && (
              <section className="flex flex-col gap-4">
                <span className="t-caption">{d.search.creators}</span>
                <CreatorGrid items={creators} empty="" />
              </section>
            )}
            {items.length > 0 && (
              <section className="flex flex-col gap-4">
                <span className="t-caption">{d.search.series}</span>
                <CoverGrid items={items} />
              </section>
            )}
          </>
        )
      ) : (
        <div className="flex flex-col gap-3">
          <p className="t-caption">{d.search.hint}</p>
          <Link href="/creators" className="t-link text-[15px] self-start md:hidden">
            {d.directory.title} {d.common.fwd}
          </Link>
        </div>
      )}
    </div>
  );
}
