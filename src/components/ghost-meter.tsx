import { Badge } from "@/components/ui/badge";
import { ghostReason } from "@/lib/match";
import { GHOST_LABEL, type GhostRisk } from "@/lib/types";

export function GhostMeter({
  risk,
  postedAt,
  velocity,
  detailed = false,
}: {
  risk: GhostRisk;
  postedAt: string;
  velocity: string;
  detailed?: boolean;
}) {
  const tone = risk === "high" ? "bad" : risk === "medium" ? "warn" : "good";
  return (
    <div className="space-y-2">
      <Badge tone={tone}>{GHOST_LABEL[risk]}</Badge>
      {detailed && (
        <p className="max-w-prose text-sm leading-relaxed text-muted">{ghostReason(risk, postedAt, velocity)}</p>
      )}
    </div>
  );
}
