import Image from "next/image";

/**
 * Portrait cover, 2:3. Shows a tinted placeholder with the first letter of
 * the title until a real cover is uploaded.
 */
export function Cover({
  src,
  title,
  tint,
  sizes = "(min-width: 768px) 220px, 45vw",
  priority = false,
}: {
  src: string | null;
  title: string;
  tint: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface" style={{ backgroundColor: src ? undefined : tint }}>
      {src ? (
        <Image src={src} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center font-display text-[64px] text-ink/90" aria-hidden>
          {title.trim().charAt(0)}
        </span>
      )}
    </div>
  );
}
