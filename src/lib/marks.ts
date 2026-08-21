/** Distinct editorial marks per entreprise — hashed, not random hex in JSX. */

export type MarkTone = {
  bg: string;
  fg: string;
  accent: string;
};

const TONES: MarkTone[] = [
  { bg: "var(--color-primary)", fg: "var(--color-primary-fg)", accent: "var(--color-good)" },
  { bg: "var(--color-chart-2)", fg: "var(--color-surface)", accent: "var(--color-chart-4)" },
  { bg: "var(--color-chart-3)", fg: "var(--color-surface)", accent: "var(--color-chart-1)" },
  { bg: "var(--color-ink)", fg: "var(--color-bg)", accent: "var(--color-chart-5)" },
  { bg: "var(--color-chart-4)", fg: "var(--color-surface)", accent: "var(--color-chart-2)" },
  { bg: "var(--color-good)", fg: "var(--color-primary-fg)", accent: "var(--color-chart-6)" },
  { bg: "var(--color-chart-6)", fg: "var(--color-surface)", accent: "var(--color-primary)" },
  { bg: "var(--color-chart-5)", fg: "var(--color-primary-fg)", accent: "var(--color-chart-3)" },
  { bg: "var(--color-chart-1)", fg: "var(--color-primary-fg)", accent: "var(--color-warn)" },
  { bg: "var(--color-warn)", fg: "var(--color-bg)", accent: "var(--color-ink)" },
];

const CAT_TONES: Record<string, number> = {
  marche: 2,
  metiers: 0,
  robotique: 5,
  droit: 3,
  compta: 4,
  creation: 6,
  formation: 7,
  sante: 9,
  industrie: 5,
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function markOf(slugOrName: string): { tone: MarkTone; glyph: number; initials: string } {
  const key = slugOrName.trim() || "vera";
  const h = hash(key.toLowerCase());
  const parts = key
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const initials =
    parts.length >= 2
      ? (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase()
      : key.slice(0, 2).toUpperCase();
  return {
    tone: TONES[h % TONES.length]!,
    glyph: h % 6,
    initials,
  };
}

export function catTone(slug: string): MarkTone {
  const idx = CAT_TONES[slug] ?? hash(slug) % TONES.length;
  return TONES[idx]!;
}

export const CHART = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
] as const;
