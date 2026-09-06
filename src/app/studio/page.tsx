import Link from "next/link";
import { Cover } from "@/components/cover";
import { Button } from "@/components/ui/button";
import { getDict } from "@/lib/lang-server";
import { mediaUrl } from "@/lib/media";
import { createClient, getUser } from "@/lib/supabase/server";
import type { SeriesRow } from "@/lib/types";

export async function generateMetadata() {
  const { d } = await getDict();
  return { title: d.studio.title };
}

export default async function StudioPage() {
  const { d } = await getDict();
  const user = await getUser().catch(() => null);

  if (!user) {
    return (
      <div className="wrap pt-16 md:pt-24 section-end flex flex-col items-start gap-5 max-w-[720px]">
        <h1 className="t-h1">{d.studio.title}</h1>
        <p className="text-ink-2">{d.studio.signIn}</p>
        <Button href="/account?next=/studio" variant="primary">
          {d.account.signIn}
        </Button>
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.from("series").select("*").eq("creator_id", user.id).order("updated_at", { ascending: false });
  const list = (data ?? []) as SeriesRow[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="t-h2">{d.studio.title}</h1>
          <p className="t-caption">{d.studio.lead}</p>
        </div>
        <Button href="/studio/new" variant="secondary" className="h-10 px-5 text-[14px] shrink-0">
          {d.studio.newSeries}
        </Button>
      </div>
      {list.length === 0 ? (
        <p className="t-caption py-10">{d.studio.noSeries}</p>
      ) : (
        <ul className="divide-y divide-hair border-y border-hair">
          {list.map((s) => (
            <li key={s.id}>
              <Link href={`/studio/${s.id}`} className="flex items-center gap-4 py-3 group">
                <div className="w-10 shrink-0">
                  <Cover src={mediaUrl(s.cover_key)} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="t-series truncate group-hover:text-blue transition-colors">{s.title_ar}</span>
                  <span className="t-caption">
                    {s.kind === "comic" ? d.studio.comic : d.studio.novel} · {d.studio.status[s.status]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
