import { placeOfCity } from "./geo";

/** Pay-Per-Qualified-Candidate. Publication is free. Payment is on a passed sim + grid. */
export function ppqcPrice(job: { city: string; seniority: string; title: string }): {
  euros: number;
  tension: number;
  why: string;
} {
  const place = placeOfCity(job.city);
  const tension = place?.dept.tension ?? place?.region.tension ?? 50;
  let euros = 160 + Math.round(tension * 4.2);
  if (job.seniority === "staff" || job.seniority === "lead") euros += 220;
  else if (job.seniority === "senior") euros += 90;
  else if (job.seniority === "junior") euros -= 40;
  const t = job.title.toLowerCase();
  if (/asie|mandarin|guidage|nucl/.test(t)) euros += 140;
  euros = Math.max(120, Math.min(980, euros));
  return {
    euros,
    tension,
    why:
      tension >= 75
        ? `Geo-Tension ${tension}/100 — métier tendu à ${job.city}. Le profil qualifié coûte plus, le sourcing moins.`
        : tension >= 55
          ? `Geo-Tension ${tension}/100. Prix de bassin, pas un CPM Indeed.`
          : `Geo-Tension ${tension}/100. Vivier plus large : le PPQC reste bas, le filtre (épreuve) fait le travail.`,
  };
}

export function trialPoints(trialScore: number | null): number {
  if (trialScore == null) return 0;
  if (trialScore <= 2) return trialScore * 50;
  return trialScore;
}

export function isQualified(row: { trialScore: number | null; fitScore: number | null }): boolean {
  const trial = trialPoints(row.trialScore);
  const fit = row.fitScore ?? 0;
  return trial >= 55 && fit >= 55;
}

