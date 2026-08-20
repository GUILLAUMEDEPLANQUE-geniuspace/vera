import type { ToolItem } from "@/lib/offer";

export function ToolsRack({ tools }: { tools: ToolItem[] }) {
  if (!tools.length) return null;
  return (
    <section>
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Les outils du métier</p>
      <h2 className="mt-2 font-serif text-2xl sm:text-3xl">Ce que vous toucherez</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {tools.map((t) => (
          <article key={t.name} className="overflow-hidden rounded-xl border border-border bg-surface">
            {t.image && <img src={t.image} alt="" className="aspect-[4/3] w-full object-cover" />}
            <div className="p-4">
              <h3 className="font-serif text-xl">{t.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t.why}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
