/**
 * Every cover is portrait 2:3 with a 2px ink border. Until a real cover is
 * uploaded: coral ground with the first letter of the title in Reem Kufi.
 */
export function Cover({
  src,
  title,
  priority = false,
  shadow = false,
  className = "",
}: {
  src: string | null;
  title: string;
  /** Kept for callers that pass a tint; the placeholder is always coral now. */
  tint?: string;
  priority?: boolean;
  shadow?: boolean;
  className?: string;
}) {
  return (
    <div className={`cover-2-3 relative w-full frame bg-coral ${shadow ? "shadow-hard" : ""} ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading={priority ? "eager" : "lazy"} decoding="async" />
      ) : (
        <span className="cover-letter absolute inset-0 flex items-center justify-center font-display text-ink leading-none" aria-hidden>
          {title.trim().charAt(0)}
        </span>
      )}
    </div>
  );
}
