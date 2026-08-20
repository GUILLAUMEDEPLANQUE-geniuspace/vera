import { formatSalary } from "@/lib/format";
import { payPosition, type PayMark, type PayPosition } from "@/lib/offer";
import { cn } from "@/lib/utils";

export function SalaryBand({
  min,
  max,
  currency,
  mark,
}: {
  min: number | null;
  max: number | null;
  currency: string;
  mark: PayMark;
}) {
  const pos = payPosition(min, max, mark);
  const lo = mark.p25;
  const hi = mark.p90;
  const span = Math.max(1, hi - lo);
  const x = (n: number) => `${Math.max(0, Math.min(100, ((n - lo) / span) * 100))}%`;
  const offerLo = min ?? max ?? mark.p50;
  const offerHi = max ?? min ?? mark.p50;

  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Salaire de référence</p>
      <h2 className="mt-2 font-serif text-2xl sm:text-3xl">Où se situe l’offre</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">
        {mark.role} · {mark.region} · {mark.n} salaires publiés · {mark.source}
      </p>

      <div className="mt-6 overflow-hidden px-2">
        <div className="relative h-16">
          <div className="absolute inset-x-0 top-7 h-2 rounded-full bg-paper" />
          <div
            className="absolute top-7 h-2 rounded-full"
            style={{
              left: x(mark.p25),
              width: `calc(${x(mark.p75)} - ${x(mark.p25)})`,
              background: "var(--color-chart-3)",
              opacity: 0.45,
            }}
          />
          <Tick left={x(mark.p25)} label="P25" value={mark.p25} />
          <Tick left={x(mark.p50)} label="Médiane" value={mark.p50} strong />
          <Tick left={x(mark.p75)} label="P75" value={mark.p75} />
          <div
            className="absolute top-5 h-6 rounded-sm bg-primary"
            style={{
              left: x(offerLo),
              width: `calc(${x(offerHi)} - ${x(offerLo)} + 6px)`,
            }}
            title="Cette offre"
          />
        </div>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
          <div>
            <div className="text-xs tracking-wide text-muted uppercase">Cette offre</div>
            <div className="font-serif text-3xl tabular-nums">{formatSalary(min, max, currency)}</div>
          </div>
          {pos && <PositionChip pos={pos} />}
        </div>
      </div>
    </section>
  );
}

function Tick({
  left,
  label,
  value,
  strong,
}: {
  left: string;
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="absolute top-0 -translate-x-1/2" style={{ left }}>
      <div className={cn("mx-auto h-3 w-px", strong ? "bg-ink" : "bg-subtle")} />
      <div className={cn("mt-6 text-center text-[10px] tracking-wide uppercase", strong ? "text-ink" : "text-subtle")}>
        {label}
      </div>
      <div className="text-center text-xs tabular-nums text-muted">{Math.round(value / 1000)}&nbsp;k€</div>
    </div>
  );
}

function PositionChip({ pos }: { pos: PayPosition }) {
  const tone = pos.band === "above" ? "good" : pos.band === "below" ? "bad" : "warn";
  return (
    <p
      className={cn(
        "rounded-full px-3 py-1 text-sm font-medium",
        tone === "good" && "bg-good/10 text-good",
        tone === "bad" && "bg-bad/10 text-bad",
        tone === "warn" && "bg-warn/12 text-warn",
      )}
    >
      {pos.label}
    </p>
  );
}
