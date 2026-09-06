import Link from "next/link";
import { Cover } from "@/components/cover";
import { getDict } from "@/lib/lang-server";
import { mediaUrl } from "@/lib/media";
import { tintFor } from "@/lib/queries";
import { createClient, getUser } from "@/lib/supabase/server";
import type { SeriesRow } from "@/lib/types";

export const metadata = { title: "لوحة المبدع" };

export default async function StudioPage() {
  const { d } = await getDict();
  const user = await getUser().catch(() => null);

  if (!user) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 md:px-12 pt-8 md:pt-16 flex flex-col items-center gap-4 text-center">
        <h1 className="font-display text-[34px] leading-tight">{d.studio.title}</h1>
        <p className="text-ink-2">{d.studio.signIn}</p>
        <Link href="/account?next=/studio" className="px-6 h-12 inline-flex items-center bg-blue text-white font-bold">
          {d.account.signIn}
        </Link>
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
          <h1 className="font-display text-[34px] leading-tight">{d.studio.title}</h1>
          <p className="text-sm text-ink-2">{d.studio.lead}</p>
        </div>
        <Link href="/studio/new" className="px-5 h-11 inline-flex items-center bg-blue text-white text-sm font-bold hover:bg-blue-deep shrink-0">
          {d.studio.newSeries}
        </Link>
      </div>
      {list.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted border border-dashed border-hair">{d.studio.noSeries}</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((s) => (
            <li key={s.id}>
              <Link href={`/studio/${s.id}`} className="flex items-center gap-4 p-3 bg-surface border border-hair hover:border-ink">
                <div className="w-[64px] shrink-0">
                  <Cover src={mediaUrl(s.cover_key)} title={s.title_ar} tint={tintFor(s.id)} />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-semibold truncate">{s.title_ar}</span>
                  <span className="text-xs text-muted">{s.kind === "comic" ? d.studio.comic : d.studio.novel}</span>
                  <span className="text-xs font-semibold">{d.studio.status[s.status]}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
