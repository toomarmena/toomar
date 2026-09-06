import { Chip } from "./ui/chip";
import { CoverGrid } from "./ui/cover-card";
import { GENRES, type GenreKey, type SeriesKind } from "@/lib/constants";
import { getDict } from "@/lib/lang-server";
import { listApproved } from "@/lib/queries";

/** The comics and novels tabs: a genre chip row and the grid. */
export async function Listing({ kind, genre, status }: { kind: SeriesKind; genre?: string; status?: string }) {
  const { lang, d } = await getDict();
  const validGenre = GENRES.some((g) => g.key === genre) ? (genre as GenreKey) : undefined;
  const runStatus = status === "completed" || status === "ongoing" ? status : undefined;
  const items = await listApproved({ kind, genre: validGenre, lang, runStatus });
  const base = kind === "comic" ? "/comics" : "/novels";
  const href = (g?: string, s?: string) => {
    const p = new URLSearchParams();
    if (g) p.set("genre", g);
    if (s) p.set("status", s);
    const qs = p.toString();
    return qs ? `${base}?${qs}` : base;
  };

  return (
    <div className="wrap pt-10 md:pt-16 section-end flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-2 pb-4 md:pb-5 border-b border-hair">
        <h1 className="t-h2">{kind === "comic" ? d.nav.comics : d.nav.novels}</h1>
        <p className="t-caption">{kind === "comic" ? d.section.comicsLead : d.section.novelsLead}</p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap">
          <Chip href={href(undefined, runStatus)} active={!validGenre}>
            {d.section.allGenres}
          </Chip>
          {GENRES.map((g) => (
            <Chip key={g.key} href={href(g.key, runStatus)} active={validGenre === g.key}>
              {g[lang]}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2">
          <Chip href={href(validGenre)} active={!runStatus}>
            {d.series.allStatus}
          </Chip>
          <Chip href={href(validGenre, "ongoing")} active={runStatus === "ongoing"}>
            {d.series.ongoingFilter}
          </Chip>
          <Chip href={href(validGenre, "completed")} active={runStatus === "completed"}>
            {d.series.completedFilter}
          </Chip>
        </div>
      </div>
      <CoverGrid items={items} empty={d.section.noResults} priority />
    </div>
  );
}
