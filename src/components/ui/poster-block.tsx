import Link from "next/link";

/** The two big section posters: comics on blue, novels on white with a violet shadow. */
export function PosterBlock({ kind, title, text, href, micro }: { kind: "comic" | "novel"; title: string; text: string; href: string; micro: string }) {
  const comic = kind === "comic";
  return (
    <Link
      href={href}
      className={`relative flex flex-col justify-end gap-2 md:gap-2.5 p-6 md:p-9 min-h-[230px] md:min-h-[300px] frame press overflow-hidden ${
        comic ? "bg-blue text-white shadow-hard-lg" : "bg-paper text-ink shadow-hard-violet"
      }`}
    >
      <span className={`absolute left-4 top-3.5 md:left-6 md:top-5 t-micro ${comic ? "text-white/80" : "text-violet"}`} dir="ltr">
        {micro}
      </span>
      <span className="font-display text-[44px] md:text-[72px] leading-none">{title}</span>
      <p className={`m-0 text-[14px] md:text-[16px] leading-[1.7] max-w-[46ch] ${comic ? "text-white/95" : "text-ink-2"}`}>{text}</p>
    </Link>
  );
}
