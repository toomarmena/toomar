import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "link";
type Size = "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-blue text-white frame shadow-hard press",
  secondary: "bg-yellow text-ink frame shadow-hard press",
  tertiary: "bg-paper text-ink frame shadow-hard press",
  link: "text-ink border-b-2 border-ink pb-0.5 font-semibold hover:text-blue hover:border-blue",
};
const SIZE: Record<Size, string> = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-7 text-[15px] md:h-14 md:px-8 md:text-[18px]",
};

function classes(variant: ButtonVariant, size: Size, block: boolean, extra: string) {
  const base = variant === "link" ? "inline-flex items-center gap-2" : `inline-flex items-center justify-center gap-3 font-bold ${SIZE[size]} ${block ? "w-full" : ""}`;
  return `${base} ${VARIANT[variant]} ${extra}`.trim();
}

type Common = { variant?: ButtonVariant; size?: Size; block?: boolean; className?: string; children: ReactNode };

/** One button, four looks. Pass `href` for a link that looks like a button. */
export function Button({ href, variant = "primary", size = "md", block = false, className = "", children, ...rest }: Common & { href?: string } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">) {
  const cls = classes(variant, size, block, className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={`${cls} disabled:opacity-60 disabled:pointer-events-none`} {...rest}>
      {children}
    </button>
  );
}
