import { cn } from "@/lib/utils";

export function MatchRing({
  value,
  size = 56,
  className,
}: {
  value: number | null;
  size?: number;
  className?: string;
}) {
  if (value == null) {
    return (
      <div className={cn("flex flex-col items-end text-right", className)}>
        <span className="font-serif text-xl leading-none text-subtle">—</span>
        <span className="mt-1 text-xs text-subtle">Connectez-vous</span>
      </div>
    );
  }
  const r = 15;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg width={size} height={size} viewBox="0 0 36 36" className="-rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--color-paper)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="3"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="leading-none">
        <div className="font-serif text-2xl tabular-nums text-ink">{value}</div>
        <div className="mt-1 text-xs text-muted">signal</div>
      </div>
    </div>
  );
}
