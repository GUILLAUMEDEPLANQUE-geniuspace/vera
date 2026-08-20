import { CULTURE_AXES, type CultureProfile } from "@/lib/culture";

export function CultureRadar({ culture, fit }: { culture: CultureProfile; fit?: number | null }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Fit interculturel</p>
      <h2 className="mt-2 font-serif text-2xl">Comment on travaille ici</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{culture.essay}</p>
      <ul className="mt-5 space-y-3">
        {CULTURE_AXES.map((ax) => {
          const v = culture.axes[ax.id];
          return (
            <li key={ax.id}>
              <div className="flex justify-between text-xs text-muted">
                <span>{ax.low}</span>
                <span className="font-medium text-ink">{ax.label}</span>
                <span>{ax.high}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-paper">
                <div className="relative h-1.5">
                  <span
                    className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
                    style={{ left: `${v}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs tracking-wide text-muted uppercase">Langues</dt>
          <dd>{culture.languages.join(" · ")}</dd>
        </div>
        <div>
          <dt className="text-xs tracking-wide text-muted uppercase">Score interculturel</dt>
          <dd className="font-serif text-2xl tabular-nums">{culture.intercultural}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs tracking-wide text-muted uppercase">Management</dt>
          <dd className="text-muted">{culture.management}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs tracking-wide text-muted uppercase">Semaine</dt>
          <dd className="text-muted">{culture.weekStyle}</dd>
        </div>
      </dl>
      {fit != null && (
        <p className="mt-4 text-sm">
          Votre fit culturel estimé : <span className="font-serif text-xl tabular-nums">{fit}</span>
        </p>
      )}
    </section>
  );
}
