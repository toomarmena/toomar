import type { LegalDoc } from "@/lib/legal";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <article className="wrap pt-10 md:pt-16 section-end flex flex-col gap-8 max-w-[720px]">
      <header className="flex flex-col gap-2">
        <h1 className="t-h1">{doc.title}</h1>
        <span className="t-caption">{doc.updated}</span>
        <p className="text-ink-2 pt-2">{doc.intro}</p>
      </header>
      {doc.sections.map((s) => (
        <section key={s.h} className="flex flex-col gap-2">
          <h2 className="t-h2">{s.h}</h2>
          {s.p.map((p, i) => (
            <p key={i} className="text-ink-2">
              {p}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
