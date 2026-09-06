import Link from "next/link";
import { Avatar } from "../avatar";
import { fill, type Dict } from "@/lib/i18n";

/** The creator's word to readers, shown after the episode and before «يُتبع…». */
export function CreatorNote({ note, name, avatarUrl, href, d, lang }: { note: string; name: string; avatarUrl: string | null; href: string; d: Dict; lang: "ar" | "en" }) {
  return (
    <aside className="bg-paper-2 border-t border-hair">
      <div className="mx-auto w-full max-w-[42rem] px-5 md:px-8 py-8 flex gap-4" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
        <Link href={href} className="shrink-0">
          <Avatar src={avatarUrl} size={40} />
        </Link>
        <div className="flex flex-col gap-1.5 min-w-0">
          <Link href={href} className="t-caption text-ink hover:text-blue transition-colors">
            {fill(d.note.title, { name })}
          </Link>
          <p className="text-[15px] leading-[1.75] text-ink-2 whitespace-pre-line">{note}</p>
        </div>
      </div>
    </aside>
  );
}
