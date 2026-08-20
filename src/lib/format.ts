import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function formatSalary(
  min: number | null,
  max: number | null,
  currency = "EUR",
): string {
  if (min == null && max == null) return "Salaire non publié";
  const unit = currency === "EUR" ? "k€" : `k ${currency}`;
  const k = (n: number) => `${Math.round(n / 1000)}\u00a0${unit}`;
  if (min != null && max != null && min !== max) return `${k(min)}–${k(max)}`;
  const only = min ?? max;
  if (only != null) return k(only);
  return "Salaire non publié";
}

export function formatPosted(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });
  } catch {
    return iso;
  }
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function parseJsonList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
