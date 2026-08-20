import { formatHours, type ProcessStep } from "@/lib/process";

export function ProcessTimeline({ steps, decisionDays }: { steps: ProcessStep[]; decisionDays: number }) {
  if (!steps.length) return null;
  const total = steps.reduce((s, x) => s + x.hours, 0);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-xl">Process publié</h3>
        <p className="text-xs text-muted">
          {formatHours(total)} · décision {decisionDays} j
        </p>
      </div>
      <ol className="mt-3 space-y-2">
        {steps.map((step, i) => (
          <li key={`${step.name}-${i}`} className="flex items-start justify-between gap-3 text-sm">
            <span>
              <span className="text-subtle">{i + 1}.</span> {step.name}
              <span className="text-muted"> · {step.who}</span>
            </span>
            <span className="shrink-0 tabular-nums text-muted">{formatHours(step.hours)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
