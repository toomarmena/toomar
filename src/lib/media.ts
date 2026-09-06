/** Public URL of an object stored in R2. Safe to use from client and server. */
export function mediaUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/${key}`;
}
