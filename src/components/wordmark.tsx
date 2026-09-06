import Link from "next/link";

export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls = { sm: "text-[28px]", md: "text-[34px]", lg: "text-[44px]" }[size];
  return (
    <Link href="/" className="inline-flex items-baseline gap-2.5 text-ink hover:text-ink" aria-label="طومار، الصفحة الرئيسية">
      <span className={`font-display leading-none ${cls}`}>طومار</span>
      <span className="text-[11px] tracking-[0.22em] text-muted uppercase hidden sm:inline">toomar</span>
    </Link>
  );
}
