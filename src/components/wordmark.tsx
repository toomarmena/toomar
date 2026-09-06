import Link from "next/link";

/** Reem Kufi «طومار» with the TOOMAR micro-label. Present on every screen. */
export function Wordmark({ size = "md", micro = true, href = "/" }: { size?: "sm" | "md" | "lg"; micro?: boolean; href?: string }) {
  const cls = { sm: "text-[26px]", md: "text-[30px] md:text-[40px]", lg: "text-[48px]" }[size];
  return (
    <Link href={href} className="inline-flex items-baseline gap-3 text-ink hover:text-ink" aria-label="طومار، الصفحة الرئيسية">
      <span className={`font-display leading-none ${cls}`}>طومار</span>
      {micro && (
        <span className="t-micro text-muted hidden sm:inline" dir="ltr">
          toomar
        </span>
      )}
    </Link>
  );
}
