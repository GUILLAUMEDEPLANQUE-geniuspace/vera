import type { ConcreteBenefit, Honesty } from "@/lib/offer";

export function HonestyBlock({ honesty, benefits }: { honesty: Honesty; benefits: ConcreteBenefit[] }) {
  return (
    <section>
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Radicalement honnête</p>
      <h2 className="mt-2 font-serif text-2xl sm:text-3xl">Le difficile, le bon, l’exceptionnel</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Col kicker="Le difficile" tone="bad" body={honesty.hard} />
        <Col kicker="Le bon" tone="warn" body={honesty.good} />
        <Col kicker="L’exceptionnel" tone="good" body={honesty.exceptional} />
      </div>
      {benefits.length > 0 && (
        <div className="mt-8">
          <h3 className="font-serif text-xl">Contreparties, sans jargon</h3>
          <dl className="mt-4 divide-y divide-border border-y border-border">
            {benefits.map((b) => (
              <div key={b.label} className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <dt className="text-sm font-medium text-ink">{b.label}</dt>
                <dd className="text-sm leading-relaxed text-muted">{b.why}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}

function Col({ kicker, body, tone }: { kicker: string; body: string; tone: "bad" | "warn" | "good" }) {
  const border = tone === "bad" ? "border-bad" : tone === "good" ? "border-good" : "border-warn";
  const kickerColor = tone === "bad" ? "text-bad" : tone === "good" ? "text-good" : "text-warn";
  return (
    <div className={`rounded-xl border-l-2 bg-surface px-4 py-4 ${border}`}>
      <p className={`text-xs tracking-wide uppercase ${kickerColor}`}>{kicker}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink">{body}</p>
    </div>
  );
}
