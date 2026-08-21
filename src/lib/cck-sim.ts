import type { MachineSim, TaskSim } from "./offer";
import { simForJob } from "./sims";

export type EpreuveKind = "machine" | "lockout" | "circuit" | "care" | "code";

export function valsMap(rows: { name: string; value: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of rows) out[r.name] = r.value;
  return out;
}

function truthy(v: string | undefined): boolean {
  return v === "oui" || v === "true" || v === "1";
}

function lines(raw: string): string[] {
  return raw
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function machineFromSteps(brief: string, symptom: string, stepsRaw: string, trap: string): MachineSim {
  const items = lines(stepsRaw);
  const steps = (items.length ? items : ["Observer", "Isoler", "Vérifier"]).map((text, i) => ({
    id: `s${i + 1}`,
    text,
  }));
  return {
    kind: "machine",
    brief: brief || "Tenez le geste, dans l’ordre.",
    symptom: symptom || "La situation réelle, pas un QCM RH.",
    steps,
    order: steps.map((s) => s.id),
    explain: trap || "Un ordre faux, c’est un échec.",
  };
}

export function simFromCck(
  vals: Record<string, string>,
  fallback: TaskSim | undefined,
  job: { title: string; collection: string | null; city: string; slug?: string },
): TaskSim | undefined {
  if (!vals.epreuve_brief && !vals.epreuve_steps) return fallback;
  if (!truthy(vals.epreuve) && !vals.epreuve_brief) return fallback;
  const kind = (vals.epreuve_kind || fallback?.kind || "machine") as EpreuveKind;
  const brief = vals.epreuve_brief || fallback?.brief || "Tenez le geste.";
  if (kind === "machine") {
    return machineFromSteps(brief, vals.epreuve_symptom ?? "", vals.epreuve_steps ?? "", vals.epreuve_trap ?? "");
  }
  const base = fallback && fallback.kind === kind ? fallback : simForJob(job);
  if (base.kind === kind) return { ...base, brief };
  return { ...base, brief };
}
