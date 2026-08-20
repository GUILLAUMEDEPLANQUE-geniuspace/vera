import { Term } from "@/components/term";
import { honorCaption, honorTone } from "@/lib/pact";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PactBadge({
  honor,
  slaDays,
  due = 1,
  compact = false,
}: {
  honor: number;
  slaDays: number;
  due?: number;
  compact?: boolean;
}) {
  const tone = honorTone(honor);
  const caption = honorCaption(honor, due);
  if (compact) {
    return (
      <Badge tone={tone}>
        {caption} · {slaDays} j
      </Badge>
    );
  }
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs tracking-wide text-muted uppercase">
          <Term k="pacte">Pacte</Term>
        </p>
        <Badge tone={tone}>{caption}</Badge>
      </div>
      <p className={cn("mt-2 font-serif text-3xl tabular-nums", tone === "bad" ? "text-bad" : "text-ink")}>
        {honor}
      </p>
      <p className="mt-1 text-xs text-muted">Honneur · réponse sous {slaDays} jours</p>
    </div>
  );
}
