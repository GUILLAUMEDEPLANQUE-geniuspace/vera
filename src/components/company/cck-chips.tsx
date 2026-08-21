import { Badge } from "@/components/ui/badge";
import type { CckValue } from "@/lib/cck-fn";

export function CckChips({
  values,
  where = "card",
}: {
  values: CckValue[] | undefined;
  where?: "card" | "list";
}) {
  if (!values?.length) return null;
  const rows = values.filter((v) => {
    if (!v.value || v.value === "non") return false;
    return where === "card" ? v.onCard : v.onList;
  });
  if (!rows.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {rows.map((v) => (
        <Badge key={v.name} tone={v.value === "oui" ? "good" : "default"}>
          {v.kind === "bool" ? v.label : `${v.label} · ${v.value}`}
        </Badge>
      ))}
    </div>
  );
}
