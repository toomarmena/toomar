import { IconSearch } from "@/components/icons";
import { SeriesGrid } from "@/components/series-card";
import { getDict } from "@/lib/lang-server";
import { searchSeries } from "@/lib/queries";

export const metadata = { title: "بحث" };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const term = typeof q === "string" ? q : "";
  const { lang, d } = await getDict();
  const items = term ? await searchSeries(term, lang) : [];

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-12 pt-6 md:pt-12 flex flex-col gap-6">
      <form action="/search" className="flex items-center gap-2 h-12 px-4 border border-hair bg-surface focus-within:border-ink">
        <IconSearch width={20} height={20} className="text-muted shrink-0" />
        <input
          name="q"
          type="search"
          defaultValue={term}
          placeholder={d.search.placeholder}
          autoFocus={!term}
          className="flex-1 bg-transparent text-ink placeholder:text-muted focus:outline-none"
        />
      </form>
      {term ? <SeriesGrid items={items} empty={d.search.empty} /> : <p className="text-sm text-muted">{d.search.hint}</p>}
    </div>
  );
}
