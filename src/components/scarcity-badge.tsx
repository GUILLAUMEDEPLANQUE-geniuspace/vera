import { Term } from "@/components/term";
import type { Scarcity } from "@/lib/scarcity";
import { cn } from "@/lib/utils";

export function ScarcityBadge({ scarcity, detailed }: { scarcity: Scarcity; detailed?: boolean }) {
  const tone =
    scarcity.band === "penurie" || scarcity.band === "rare"
      ? "text-good"
      : scarcity.band === "tendu"
        ? "text-warn"
        : "text-muted";
  return (
    <div>
      <p className="text-xs tracking-wide text-muted uppercase">
        <Term k="scarcity">Rareté du profil</Term>
      </p>
      <p className={cn("font-serif text-3xl tabular-nums", tone)}>{scarcity.score}</p>
      <p className={cn("text-sm font-medium", tone)}>{scarcity.label}</p>
      {detailed && <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted">{scarcity.why}</p>}
    </div>
  );
}
