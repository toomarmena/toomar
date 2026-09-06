import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CoverGrid } from "@/components/ui/cover-card";
import { SectionHeader } from "@/components/ui/section-header";
import { EPISODE_WORD, formatNumber } from "@/lib/constants";
import { getDict } from "@/lib/lang-server";
import { seriesHref } from "@/lib/links";
import { toSummary } from "@/lib/queries";
import { createClient, getUser } from "@/lib/supabase/server";
import type { SeriesCardRow } from "@/lib/types";

export async function generateMetadata() {
  const { d } = await getDict();
  return { title: d.library.title };
}

export default async function LibraryPage() {
  const { lang, d } = await getDict();
  const user = await getUser().catch(() => null);

  if (!user) {
    return (
      <div className="wrap pt-16 md:pt-24 section-end flex flex-col items-start gap-5 max-w-[720px]">
        <h1 className="t-h1">{d.library.title}</h1>
        <p className="text-ink-2">{d.library.signIn}</p>
        <Button href="/account?next=/library" variant="primary">
          {d.account.signIn}
        </Button>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: follows }, { data: progress }] = await Promise.all([
    supabase.from("follows").select("series_id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("reading_progress").select("series_id, number, lang").eq("user_id", user.id),
  ]);
  const ids = (follows ?? []).map((f) => f.series_id);
  const { data: rows } = ids.length ? await supabase.from("series_cards").select("*").in("id", ids) : { data: [] as SeriesCardRow[] };
  const byId = new Map(((rows ?? []) as SeriesCardRow[]).map((r) => [r.id, toSummary(r, lang)]));
  const items = ids.map((id) => byId.get(id)).filter((s): s is NonNullable<typeof s> => !!s);
  const progressById = new Map((progress ?? []).map((p) => [p.series_id, p]));
  const continuing = items.filter((s) => progressById.has(s.id));

  return (
    <div className="wrap pt-10 md:pt-16 section-end flex flex-col gap-12 md:gap-16">
      {continuing.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader title={d.series.continueReading} />
          <ul className="divide-y divide-hair">
            {continuing.map((s) => {
              const p = progressById.get(s.id)!;
              return (
                <li key={s.id} className="flex items-center justify-between gap-4 py-3">
                  <Link href={seriesHref(s)} className="t-series hover:text-blue transition-colors truncate">
                    {s.title}
                  </Link>
                  <Link href={`${seriesHref(s)}/${p.number}?lang=${p.lang}`} className="t-link t-caption text-ink shrink-0">
                    {EPISODE_WORD[s.kind][lang]} {formatNumber(p.number, lang)} {d.common.fwd}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <section className="flex flex-col gap-6 md:gap-8">
        <SectionHeader title={d.library.title} note={d.library.lead} />
        {items.length === 0 ? (
          <div className="flex flex-col items-start gap-4 py-6">
            <p className="text-ink-2">{d.library.empty}</p>
            <Button href="/comics" variant="secondary">
              {d.library.browse}
            </Button>
          </div>
        ) : (
          <CoverGrid items={items} priority />
        )}
      </section>
    </div>
  );
}
