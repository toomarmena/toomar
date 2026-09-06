import Link from "next/link";
import { Section } from "./section";
import { SeriesGrid } from "./series-card";
import { GENRES, type GenreKey, type SeriesKind } from "@/lib/constants";
import { getDict } from "@/lib/lang-server";
import { listApproved } from "@/lib/queries";

/** The comics and novels tabs: a genre chip row and a grid. */
export async function Listing({ kind, genre }: { kind: SeriesKind; genre?: string }) {
  const { lang, d } = await getDict();
  const validGenre = GENRES.some((g) => g.key === genre) ? (genre as GenreKey) : undefined;
  const items = await listApproved({ kind, genre: validGenre, lang });
  const base = kind === "comic" ? "/comics" : "/novels";

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-12 pt-6 md:pt-12 flex flex-col gap-6">
      <Section title={kind === "comic" ? d.nav.comics : d.nav.novels} lead={kind === "comic" ? d.section.comicsLead : d.section.novelsLead}>
        <ul className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          <li>
            <Link href={base} className={`inline-block shrink-0 px-4 py-2 text-sm font-semibold border ${!validGenre ? "bg-ink text-white border-ink" : "bg-white border-hair hover:border-ink"}`}>
              {d.section.allGenres}
            </Link>
          </li>
          {GENRES.map((g) => (
            <li key={g.key}>
              <Link
                href={`${base}?genre=${g.key}`}
                className={`inline-block shrink-0 px-4 py-2 text-sm font-semibold border ${validGenre === g.key ? "bg-ink text-white border-ink" : "bg-white border-hair hover:border-ink"}`}
              >
                {g[lang]}
              </Link>
            </li>
          ))}
        </ul>
        <SeriesGrid items={items} empty={d.section.noResults} />
      </Section>
    </div>
  );
}
