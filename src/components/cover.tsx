/**
 * Portrait cover, 2:3. Shows a tinted placeholder with the first letter of
 * the title until a real cover is uploaded. Plain <img>: covers are already
 * resized on upload and served from R2 with long cache headers.
 */
export function Cover({
  src,
  title,
  tint,
  priority = false,
}: {
  src: string | null;
  title: string;
  tint: string;
  priority?: boolean;
}) {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface" style={{ backgroundColor: src ? undefined : tint }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading={priority ? "eager" : "lazy"} decoding="async" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center font-display text-[64px] text-ink/90" aria-hidden>
          {title.trim().charAt(0)}
        </span>
      )}
    </div>
  );
}
