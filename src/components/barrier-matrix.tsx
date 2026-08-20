import { BARRIERS } from "@/lib/barriers";

export function BarrierMatrix({ covered }: { covered?: string[] }) {
  const set = covered ? new Set(covered) : null;
  return (
    <ul className="mt-4 divide-y divide-border border-y border-border">
      {BARRIERS.map((b) => {
        const on = set ? set.has(b.id) : null;
        return (
          <li key={b.id} className="grid gap-1 py-3 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">
                {b.label}
                {on === true && <span className="ml-2 text-xs text-good">levé</span>}
                {on === false && <span className="ml-2 text-xs text-muted">non coché</span>}
              </p>
              <p className="mt-1 text-xs text-muted">{b.candidate}</p>
            </div>
            <p className="text-sm text-ink">{b.house}</p>
          </li>
        );
      })}
    </ul>
  );
}
