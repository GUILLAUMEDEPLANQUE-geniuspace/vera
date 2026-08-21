import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CckKind } from "@/lib/cck-kinds";

export function CckFieldInput({
  kind,
  value,
  options,
  hint,
  onChange,
}: {
  kind: CckKind;
  value: string;
  options?: string[];
  hint?: string;
  onChange: (v: string) => void;
}) {
  const opts = (options ?? []).filter(Boolean);
  if (kind === "bool") {
    return (
      <label className="flex h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={value === "oui" || value === "true"} onChange={(e) => onChange(e.target.checked ? "true" : "false")} />
        Oui
      </label>
    );
  }
  if (kind === "choice" || kind === "radio" || kind === "status") {
    return (
      <select className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {opts.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  if (kind === "checkbox" || kind === "multi") {
    const picked = new Set(value.split(",").map((s) => s.trim()).filter(Boolean));
    return (
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <label key={o} className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm">
            <input
              type="checkbox"
              checked={picked.has(o)}
              onChange={(e) => {
                const next = new Set(picked);
                if (e.target.checked) next.add(o);
                else next.delete(o);
                onChange([...next].join(", "));
              }}
            />
            {o}
          </label>
        ))}
      </div>
    );
  }
  if (kind === "textarea" || kind === "html" || kind === "gallery") {
    return <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={hint} rows={4} />;
  }
  if (kind === "number" || kind === "scale") {
    return <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={hint} />;
  }
  if (kind === "datetime") {
    return <Input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  if (kind === "email") {
    return <Input type="email" value={value} onChange={(e) => onChange(e.target.value)} placeholder={hint ?? "contact@maison.fr"} />;
  }
  if (kind === "tel") {
    return <Input type="tel" value={value} onChange={(e) => onChange(e.target.value)} placeholder={hint} />;
  }
  if (kind === "url" || kind === "image" || kind === "video" || kind === "audio" || kind === "file" || kind === "media") {
    return <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={hint ?? "/drive/media/…"} />;
  }
  return <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={hint} />;
}
