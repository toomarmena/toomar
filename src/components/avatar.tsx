/** A creator's picture: a square with the 2px border, or the first letter on coral. */
export function Avatar({ src, name, size = 56 }: { src: string | null; name: string; size?: number }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.5) };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} className="frame object-cover shrink-0 bg-surface" style={style} />;
  }
  return (
    <span className="frame bg-coral text-ink flex items-center justify-center font-display leading-none shrink-0" style={style} aria-hidden>
      {name.trim().charAt(0)}
    </span>
  );
}
