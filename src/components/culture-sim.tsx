import { useState } from "react";
import { cultureSim } from "@/lib/sim-culture";
import type { CultureProfile } from "@/lib/culture";
import { cn } from "@/lib/utils";

export function CultureSim({ slug, culture }: { slug: string; culture: CultureProfile }) {
  const pack = cultureSim(slug, culture);
  const [beat, setBeat] = useState(0);
  const [picked, setPicked] = useState<(string | null)[]>(() => pack.beats.map(() => null));
  const current = pack.beats[beat];
  if (!current) return null;

  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Simulateur interculturel</p>
      <h2 className="mt-2 font-serif text-2xl">Avant l’appel, le geste</h2>
      <p className="mt-2 text-sm italic text-ink">{pack.brief}</p>
      <p className="mt-4 text-sm font-medium">
        {beat + 1}/{pack.beats.length} · {current.prompt}
      </p>
      <ul className="mt-3 space-y-2">
        {current.choices.map((c) => {
          const shown = picked[beat] != null;
          const mine = picked[beat] === c.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                disabled={shown}
                onClick={() => {
                  const next = picked.slice();
                  next[beat] = c.id;
                  setPicked(next);
                  if (c.ok && beat < pack.beats.length - 1) {
                    window.setTimeout(() => setBeat((b) => b + 1), 700);
                  }
                }}
                className={cn(
                  "w-full rounded-lg border px-3 py-3 text-left text-sm leading-relaxed",
                  !shown && "border-border hover:border-primary",
                  shown && c.ok && "border-good bg-good/10",
                  shown && mine && !c.ok && "border-bad bg-bad/10",
                  shown && !mine && !c.ok && "border-border text-muted",
                )}
              >
                {c.text}
              </button>
              {shown && (c.ok || mine) && <p className="mt-1 text-xs text-muted">{c.why}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
