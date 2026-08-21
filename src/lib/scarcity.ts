import type { JobListItem } from "./types";

export type Scarcity = {
  score: number;
  band: "abondant" | "tendu" | "rare" | "penurie";
  label: string;
  why: string;
};

const RARE_SKILLS = new Set(
  [
    "gnc",
    "ada",
    "rtos",
    "fhir",
    "hl7",
    "guanxi",
    "mandarin",
    "clickhouse",
    "ebpf",
    "postgis",
    "habilitation",
    "caces",
    "hydraulique",
    "aml",
    "recherche opérationnelle",
    "embarqué",
  ].map((s) => s.toLowerCase()),
);

export function scarcityOf(
  job: Pick<
    JobListItem,
    "skills" | "seniority" | "applicantsCount" | "viewsCount" | "city" | "remoteType" | "title"
  >,
): Scarcity {
  let score = 42;
  const rareHits = job.skills.filter((s) => RARE_SKILLS.has(s.toLowerCase())).length;
  score += rareHits * 12;
  if (job.seniority === "staff" || job.seniority === "lead") score += 18;
  else if (job.seniority === "senior") score += 8;
  else if (job.seniority === "junior") score -= 10;

  const conv = job.viewsCount > 0 ? job.applicantsCount / job.viewsCount : 0.1;
  if (conv < 0.04) score += 14;
  else if (conv > 0.12) score -= 10;

  const t = job.title.toLowerCase();
  if (t.includes("asie") || t.includes("mandarin") || t.includes("guidage") || t.includes("maintenance")) score += 10;
  if (job.remoteType === "onsite" && ["Fos-sur-Mer", "Toulouse", "Marseille"].includes(job.city)) score += 6;

  score = Math.max(8, Math.min(98, Math.round(score)));
  const band: Scarcity["band"] =
    score >= 78 ? "penurie" : score >= 62 ? "rare" : score >= 45 ? "tendu" : "abondant";
  const label =
    band === "penurie"
      ? "Pénurie"
      : band === "rare"
        ? "Profil rare"
        : band === "tendu"
          ? "Marché tendu"
          : "Profil fréquent";
  const why =
    band === "penurie"
      ? "Peu de candidats tenables, compétences rares, conversion faible. Les entreprises sérieuses paient au-dessus du P75 et répondent vite — ou perdent."
      : band === "rare"
        ? "Le vivier est étroit. Un process long ou un salaire sous médiane tue l’offre."
        : band === "tendu"
          ? "On trouve, mais pas en trois jours. Le pacte de réponse pèse plus que le sourcing."
          : "Beaucoup de CV. Le filtre Vera (épreuve, grille, brief) sert surtout à éviter le bruit.";
  return { score, band, label, why };
}
