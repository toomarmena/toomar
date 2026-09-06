/** A quiet placeholder while a page loads: one hairline and a faint block. */
export default function Loading() {
  return (
    <div className="wrap pt-10 md:pt-16 flex flex-col gap-6" aria-busy>
      <div className="h-7 w-40 bg-placeholder" />
      <div className="border-b border-hair" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="cover-2-3" />
        ))}
      </div>
    </div>
  );
}
