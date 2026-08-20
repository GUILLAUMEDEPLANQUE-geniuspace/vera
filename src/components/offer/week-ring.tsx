import { useState } from "react";
import type { WeekSlice } from "@/lib/offer";
import { cn } from "@/lib/utils";

const TONES = ["var(--color-primary)", "var(--color-good)", "var(--color-warn)", "var(--color-muted)"];

export function WeekRing({ slices }: { slices: WeekSlice[] }) {
  const [active, setActive] = useState(slices[0]?.id);
  const current = slices.find((s) => s.id === active) ?? slices[0];
  const r = 42;
  const c = 2 * Math.PI * r;
  let acc = 0;
  const arcs = slices.map((s, i) => {
    const len = (s.pct / 100) * c;
    const dash = `${len} ${c - len}`;
    const offset = -(acc / 100) * c;
    acc += s.pct;
    return { s, i, dash, offset };
  });

  if (!current) return null;

  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Une semaine type</p>
      <h2 className="mt-2 font-serif text-2xl sm:text-3xl">Le quotidien, pas la liste</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Cliquez une part. C’est une répartition réelle, tenue par l’équipe — pas un camembert RH.
      </p>

      <div className="mt-6 grid items-center gap-6 sm:grid-cols-[11rem_1fr]">
        <div className="relative mx-auto size-44">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90" role="img" aria-label="Répartition d’une semaine">
            {arcs.map(({ s, i, dash, offset }) => (
              <circle
                key={s.id}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={TONES[i % TONES.length]}
                strokeWidth={s.id === current.id ? 12 : 8}
                strokeDasharray={dash}
                strokeDashoffset={offset}
                className="cursor-pointer transition-[stroke-width] duration-200"
                onClick={() => setActive(s.id)}
              />
            ))}
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="font-serif text-3xl tabular-nums leading-none">{current.pct}%</div>
              <div className="mt-1 max-w-24 text-[10px] tracking-wide text-muted uppercase">{current.label}</div>
            </div>
          </div>
        </div>
        <ul className="space-y-2">
          {slices.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setActive(s.id)}
                className={cn(
                  "flex w-full min-h-11 items-start gap-3 rounded-lg px-2 py-2 text-left",
                  s.id === current.id ? "bg-paper" : "hover:bg-paper/60",
                )}
              >
                <span
                  className="mt-1 size-2.5 shrink-0 rounded-full"
                  style={{ background: TONES[i % TONES.length] }}
                />
                <span>
                  <span className="block text-sm font-medium text-ink">
                    {s.pct}% · {s.label}
                  </span>
                  <span className="block text-sm text-muted">{s.note}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
