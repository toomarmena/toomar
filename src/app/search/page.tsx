import { CoverGrid } from "@/components/ui/cover-card";
import { getDict } from "@/lib/lang-server";
import { searchSeries } from "@/lib/queries";

export async function generateMetadata() {
  const { d } = await getDict();
  return { title: d.search.title };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const term = typeof q === "string" ? q : "";
  const { lang, d } = await getDict();
  const items = term ? await searchSeries(term, lang) : [];

  return (
    <div className="wrap pt-10 md:pt-16 section-end flex flex-col gap-8">
      <form action="/search" className="max-w-[560px]">
        <input name="q" type="search" defaultValue={term} placeholder={d.search.placeholder} autoFocus={!term} className="field" aria-label={d.search.title} />
      </form>
      {term ? <CoverGrid items={items} empty={d.search.empty} /> : <p className="t-caption">{d.search.hint}</p>}
    </div>
  );
}
