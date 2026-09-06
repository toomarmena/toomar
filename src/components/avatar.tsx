/** A creator's picture: a square on the placeholder grey. No border, no shadow. */
export function Avatar({ src, size = 56 }: { src: string | null; name?: string; size?: number }) {
  const style = { width: size, height: size };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} className="object-cover shrink-0 bg-placeholder" style={style} />;
  }
  return <span className="bg-placeholder shrink-0 block" style={style} aria-hidden />;
}
