import { Chip } from "./ui/chip";
import { CoverGrid } from "./ui/cover-card";
import { GENRES, type GenreKey, type SeriesKind } from "@/lib/constants";
import { getDict } from "@/lib/lang-server";
import { listApproved } from "@/lib/queries";

/** The comics and novels tabs: a genre chip row and the grid. */
export async function Listing({ kind, genre }: { kind: SeriesKind; genre?: string }) {
  const { lang, d } = await getDict();
  const validGenre = GENRES.some((g) => g.key === genre) ? (genre as GenreKey) : undefined;
  const items = await listApproved({ kind, genre: validGenre, lang });
  const base = kind === "comic" ? "/comics" : "/novels";

  return (
    <div className="wrap pt-10 md:pt-16 section-end flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-2 pb-4 md:pb-5 border-b border-hair">
        <h1 className="t-h2">{kind === "comic" ? d.nav.comics : d.nav.novels}</h1>
        <p className="t-caption">{kind === "comic" ? d.section.comicsLead : d.section.novelsLead}</p>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap">
        <Chip href={base} active={!validGenre}>
          {d.section.allGenres}
        </Chip>
        {GENRES.map((g) => (
          <Chip key={g.key} href={`${base}?genre=${g.key}`} active={validGenre === g.key}>
            {g[lang]}
          </Chip>
        ))}
      </div>
      <CoverGrid items={items} empty={d.section.noResults} priority />
    </div>
  );
}
