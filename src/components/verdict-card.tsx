import { Term } from "@/components/term";
import { formatHours } from "@/lib/process";
import type { Verdict } from "@/lib/verdict";
import { cn } from "@/lib/utils";

const TONE = {
  go: "border-good text-good",
  ask: "border-warn text-warn",
  pass: "border-bad text-bad",
} as const;

export function VerdictCard({ verdict }: { verdict: Verdict }) {
  return (
    <aside className={cn("rounded-xl border-2 bg-surface p-5 sm:p-6", TONE[verdict.decision])}>
      <p className="text-xs font-medium tracking-[0.18em] uppercase">
        Le <Term k="verdict">Verdict</Term>
      </p>
      <h2 className="mt-2 font-serif text-4xl leading-none sm:text-5xl">{verdict.label}</h2>
      <p className="mt-3 text-sm text-muted">
        {formatHours(verdict.hours)} de process · honneur {verdict.honor} · réponse sous {verdict.slaDays}{" "}
        j · score {verdict.score}
      </p>
      <ul className="mt-5 space-y-2">
        {verdict.reasons.map((r) => (
          <li
            key={r.text}
            className={cn(
              "border-l-2 pl-3 text-sm leading-relaxed",
              r.tone === "good" && "border-good text-ink",
              r.tone === "warn" && "border-warn text-ink",
              r.tone === "bad" && "border-bad text-ink",
            )}
          >
            {r.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
