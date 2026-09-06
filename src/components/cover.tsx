/**
 * Every cover is portrait 2:3, edge to edge, no border, no shadow.
 * Until a cover is uploaded: a plain #E4E4E8 block.
 */
export function Cover({ src, priority = false, className = "" }: { src: string | null; title?: string; tint?: string; priority?: boolean; shadow?: boolean; className?: string }) {
  return (
    <div className={`cover-2-3 relative w-full ${className}`}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading={priority ? "eager" : "lazy"} decoding="async" />
      )}
    </div>
  );
}
