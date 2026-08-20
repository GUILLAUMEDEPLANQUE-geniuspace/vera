import { useMemo, useState } from "react";
import { scoreGrid, type EvalGrid, type GridAnswers } from "@/lib/fields";
import { Term } from "@/components/term";
import { cn } from "@/lib/utils";

export function EvalGridPanel({
  grid,
  onScore,
}: {
  grid: EvalGrid;
  onScore?: (score: number, answers: GridAnswers) => void;
}) {
  const [answers, setAnswers] = useState<GridAnswers>({});
  const result = useMemo(() => scoreGrid(grid, answers), [grid, answers]);

  function set(id: string, v: string | number | boolean) {
    const next = { ...answers, [id]: v };
    setAnswers(next);
    onScore?.(scoreGrid(grid, next).score, next);
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
        <Term k="grille">Grille publique</Term>
      </p>
      <h2 className="mt-2 font-serif text-2xl">{grid.title}</h2>
      <p className="mt-2 text-sm text-muted">{grid.intro}</p>
      <p className="mt-3 font-serif text-3xl tabular-nums text-primary">{result.score}/100</p>
      <p className="text-xs text-muted">Score live. Les maisons le voient avec le brief.</p>
      <div className="mt-5 space-y-5">
        {grid.fields.map((f) => (
          <fieldset key={f.id}>
            <legend className="text-sm font-medium text-ink">
              {f.label}
              <span className="ml-2 text-xs font-normal text-subtle">poids {f.weight}</span>
            </legend>
            <p className="mt-1 text-xs text-muted">{f.hint}</p>
            {f.kind === "text" && (
              <textarea
                className="mt-2 min-h-20 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                value={String(answers[f.id] ?? "")}
                onChange={(e) => set(f.id, e.target.value)}
              />
            )}
            {f.kind === "scale" && (
              <input
                type="range"
                min={f.min ?? 1}
                max={f.max ?? 5}
                className="mt-3 w-full accent-primary"
                value={Number(answers[f.id] ?? f.min ?? 1)}
                onChange={(e) => set(f.id, Number(e.target.value))}
              />
            )}
            {f.kind === "bool" && (
              <label className="mt-2 flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={Boolean(answers[f.id])}
                  onChange={(e) => set(f.id, e.target.checked)}
                />
                Oui
              </label>
            )}
            {f.kind === "choice" && (
              <div className="mt-2 space-y-1">
                {f.options?.map((o) => (
                  <label key={o} className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={f.id}
                      className="size-4 accent-primary"
                      checked={answers[f.id] === o}
                      onChange={() => set(f.id, o)}
                      suppressHydrationWarning
                    />
                    {o}
                  </label>
                ))}
              </div>
            )}
          </fieldset>
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        {result.breakdown.map((b) => (
          <li key={b.id} className={cn("rounded-full bg-paper px-2 py-0.5", b.pts === 0 && "opacity-50")}>
            {b.pts}/{b.max}
          </li>
        ))}
      </ul>
    </section>
  );
}
