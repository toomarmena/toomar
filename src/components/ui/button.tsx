import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "link";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "h-12 px-7 bg-ink text-white font-bold hover:bg-ink-2 transition-colors",
  secondary: "h-12 px-7 bg-paper text-ink font-medium border border-hair hover:border-ink transition-colors",
  link: "t-link font-medium",
};

type Common = { variant?: ButtonVariant; block?: boolean; className?: string; children: ReactNode };

/** Two buttons and a text link. Pass `href` for a link that looks like a button. */
export function Button({ href, variant = "primary", block = false, className = "", children, ...rest }: Common & { href?: string } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">) {
  const base = variant === "link" ? "inline-flex items-center gap-2" : `inline-flex items-center justify-center gap-2 text-[15px] ${block ? "w-full" : ""}`;
  const cls = `${base} ${VARIANT[variant]} ${className}`.trim();
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={`${cls} disabled:opacity-50 disabled:pointer-events-none`} {...rest}>
      {children}
    </button>
  );
}
