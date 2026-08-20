export type PayMark = {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  region: string;
  role: string;
  n: number;
  year: number;
  source: string;
};

export type CareerNode = {
  id: string;
  title: string;
  years: string;
  pay: string;
  skills: string[];
  certs: string[];
  current?: boolean;
};

export type WeekSlice = {
  id: string;
  label: string;
  pct: number;
  note: string;
};

export type Hotspot = {
  id: string;
  x: number;
  y: number;
  title: string;
  body: string;
};

export type Workplace = {
  title: string;
  caption: string;
  image: string;
  hotspots: Hotspot[];
};

export type Voice = {
  name: string;
  role: string;
  years: string;
  question: string;
  answer: string;
  portrait: string;
  video?: string;
};

export type ToolItem = {
  name: string;
  why: string;
  image?: string;
};

export type Honesty = {
  hard: string;
  good: string;
  exceptional: string;
};

export type ConcreteBenefit = {
  label: string;
  why: string;
};

export type SimChoice = {
  id: string;
  text: string;
  ok: boolean;
  why: string;
};

export type CircuitSim = {
  kind: "circuit";
  brief: string;
  symptom: string;
  probes: { id: string; label: string; x: number; y: number; reading: string }[];
  choices: SimChoice[];
  isolate?: SimChoice[];
};

export type CareSim = {
  kind: "care";
  brief: string;
  setting: string;
  beats: { prompt: string; choices: SimChoice[] }[];
};

export type CodeSim = {
  kind: "code";
  brief: string;
  snippet: string;
  prompt: string;
  choices: SimChoice[];
};

export type MachineSim = {
  kind: "machine";
  brief: string;
  symptom: string;
  steps: { id: string; text: string; reading?: string }[];
  order: string[];
  explain: string;
};

export type SimOutcome = {
  ok: boolean;
  score: number;
  misses: string[];
  lesson: string | null;
};

export type LockoutPoint = {
  id: string;
  label: string;
  kind: "source" | "lock" | "test" | "ppe" | "trap";
  hint: string;
};

export type LockoutEnergy = {
  id: string;
  label: string;
  live: string;
  dead: string;
  clearedBy: string;
};

export type LockoutSim = {
  kind: "lockout";
  brief: string;
  symptom: string;
  points: LockoutPoint[];
  order: string[];
  energies?: LockoutEnergy[];
  danger: string;
};

export type TaskSim = CircuitSim | CareSim | CodeSim | MachineSim | LockoutSim;

export type QuizGate = {
  q: string;
  choices: { id: string; text: string; ok: boolean }[];
};

export type OfferPack = {
  depth: "full" | "core";
  pay: PayMark;
  career: CareerNode[];
  week: WeekSlice[];
  honesty: Honesty;
  benefits: ConcreteBenefit[];
  workplace?: Workplace;
  voices: Voice[];
  tools: ToolItem[];
  sim?: TaskSim;
  gates: QuizGate[];
};

export type PayPosition = {
  band: "above" | "market" | "below";
  label: string;
  deltaPct: number;
  mid: number;
};

export function payPosition(
  min: number | null,
  max: number | null,
  mark: PayMark,
): PayPosition | null {
  if (min == null && max == null) return null;
  const mid = min != null && max != null ? Math.round((min + max) / 2) : (min ?? max)!;
  const deltaPct = Math.round(((mid - mark.p50) / mark.p50) * 100);
  const band: PayPosition["band"] = mid >= mark.p75 ? "above" : mid <= mark.p25 ? "below" : "market";
  const label =
    band === "above"
      ? `${Math.abs(deltaPct)}\u00a0% au-dessus de la médiane`
      : band === "below"
        ? `${Math.abs(deltaPct)}\u00a0% sous la médiane`
        : "Dans le marché";
  return { band, label, deltaPct, mid };
}

export function parseOffer(raw: string | null | undefined): OfferPack | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as OfferPack;
    if (!v || typeof v !== "object" || !v.pay || !Array.isArray(v.career)) return null;
    return v;
  } catch {
    return null;
  }
}

export const FULL_OFFER_SLUGS = new Set([
  "technicien-maintenance-releve",
  "electricien-ombrieres-kora",
  "aide-domicile-lise",
  "infirmier-produit-mireille",
  "frontend-sable-remote",
  "staff-backend-sable",
  "chef-projet-solaire-kora",
]);
