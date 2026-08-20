import { cultureOf } from "./culture";
import type { GhostRisk, JobListItem, Profile, Seniority } from "./types";

const SENIORITY_RANK: Record<Seniority, number> = {
  junior: 1,
  mid: 2,
  senior: 3,
  staff: 4,
  lead: 5,
};

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function computeMatch(
  job: Pick<JobListItem, "skills" | "seniority" | "remoteType" | "city" | "salaryMin" | "salaryMax" | "company">,
  profile: Pick<
    Profile,
    "skills" | "seniority" | "remotePref" | "location" | "salaryMin" | "salaryMax" | "languages"
  > | null,
): number | null {
  if (!profile || profile.skills.length === 0) return null;

  const jobSkills = job.skills.map(norm);
  const mine = new Set(profile.skills.map(norm));
  const hits = jobSkills.filter((s) => mine.has(s)).length;
  const skillScore = jobSkills.length === 0 ? 50 : (hits / jobSkills.length) * 62;

  let seniorityScore = 12;
  if (profile.seniority && job.seniority) {
    const delta = Math.abs(
      SENIORITY_RANK[job.seniority] - (SENIORITY_RANK[profile.seniority as Seniority] ?? 3),
    );
    seniorityScore = delta === 0 ? 12 : delta === 1 ? 8 : 3;
  }

  let locScore = 6;
  if (profile.remotePref === "remote" && job.remoteType === "remote") locScore = 12;
  else if (profile.remotePref === job.remoteType) locScore = 11;
  else if (profile.location && norm(profile.location).includes(norm(job.city))) locScore = 12;
  else if (job.remoteType === "remote") locScore = 8;

  let salScore = 0;
  if (profile.salaryMin && job.salaryMax) {
    salScore = job.salaryMax >= profile.salaryMin ? 0 : -8;
  }

  const house = cultureOf(job.company.slug);
  let cultScore = 6;
  if (profile.languages.length) {
    const langs = profile.languages.map(norm);
    const overlap = house.languages.filter((l) =>
      langs.some((m) => norm(l).includes(m) || m.includes(norm(l))),
    ).length;
    cultScore = overlap === 0 ? 2 : Math.min(14, 6 + overlap * 3);
  }
  if (profile.remotePref === "remote" && house.axes.writing >= 80) cultScore += 3;
  if (profile.remotePref === "onsite" && house.axes.writing < 45) cultScore += 2;

  return Math.max(8, Math.min(99, Math.round(skillScore + seniorityScore + locScore + salScore + cultScore)));
}

export function inferGhost(input: {
  postedAt: string;
  applicantsCount: number;
  viewsCount: number;
  hiringVelocity: string;
  stored?: GhostRisk;
}): GhostRisk {
  if (input.stored) return input.stored;
  const days = (Date.now() - new Date(input.postedAt).getTime()) / 86_400_000;
  if (input.hiringVelocity === "frozen") return "high";
  if (days > 55 && input.applicantsCount < 8) return "high";
  if (days > 35 && input.viewsCount > 400 && input.applicantsCount < 6) return "medium";
  if (days > 40) return "medium";
  return "low";
}

export function ghostReason(risk: GhostRisk, postedAt: string, velocity: string): string {
  const days = Math.max(1, Math.round((Date.now() - new Date(postedAt).getTime()) / 86_400_000));
  if (risk === "high") {
    return velocity === "frozen"
      ? "Cette entreprise a gelé ses embauches. L’annonce est probablement un filet à CV."
      : `En ligne depuis ${days} jours, presque sans mouvement. Signal classique de ghost job.`;
  }
  if (risk === "medium") {
    return `Publiée il y a ${days} jours. Le recrutement semble lent — posez la question du délai avant d’investir du temps.`;
  }
  return `Annonce récente, pipeline actif. Le signal est cohérent.`;
}
