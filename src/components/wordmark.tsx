import Link from "next/link";

/** «طومار» in El Messiri 500 with the TOOMAR micro-label under it. On every screen. */
export function Wordmark({ size = "md", micro = true, href = "/" }: { size?: "sm" | "md" | "lg"; micro?: boolean; href?: string }) {
  const cls = { sm: "text-[20px]", md: "text-[22px]", lg: "text-[32px]" }[size];
  return (
    <Link href={href} className="inline-flex flex-col items-start gap-1 text-ink hover:text-ink" aria-label="طومار، الصفحة الرئيسية">
      <span className={`font-display leading-none ${cls}`}>طومار</span>
      {micro && (
        <span className="t-micro" dir="ltr">
          toomar
        </span>
      )}
    </Link>
  );
}
