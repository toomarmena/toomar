/** A creator's picture, or the first letter of the name on a blue disc. */
export function Avatar({ src, name, size = 56 }: { src: string | null; name: string; size?: number }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.45) };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} className="rounded-full object-cover shrink-0 bg-surface" style={style} />;
  }
  return (
    <span className="rounded-full bg-blue text-white flex items-center justify-center font-display shrink-0" style={style} aria-hidden>
      {name.trim().charAt(0)}
    </span>
  );
}
