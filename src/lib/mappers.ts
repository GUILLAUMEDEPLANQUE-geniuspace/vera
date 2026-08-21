import { parseJsonList } from "./format";
import { computeMatch, inferGhost } from "./match";
import type { Company, ContractType, GhostRisk, JobListItem, Profile, RemoteType, Seniority } from "./types";

function parseTryBuy(raw: string | null | undefined): JobListItem["tryBuy"] {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { days?: number; dailyPay?: number; supervisor?: string; startNote?: string };
    if (!v || typeof v.days !== "number") return null;
    return {
      days: v.days,
      dailyPay: Number(v.dailyPay ?? 0),
      supervisor: String(v.supervisor ?? ""),
      startNote: String(v.startNote ?? ""),
    };
  } catch {
    return null;
  }
}

function parseSlots(raw: string | null | undefined): JobListItem["slots"] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const r = item as { weekday?: number; startHour?: number; hours?: number; city?: string; seats?: number };
      return [
        {
          weekday: Number(r.weekday ?? 1),
          startHour: Number(r.startHour ?? 8),
          hours: Number(r.hours ?? 8),
          city: String(r.city ?? ""),
          seats: Number(r.seats ?? 1),
        },
      ];
    });
  } catch {
    return [];
  }
}

export type CompanyRow = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  about: string;
  industry: string;
  size_band: string;
  hq_city: string;
  hq_country: string;
  website: string | null;
  founded_year: number | null;
  culture_score: number;
  hiring_velocity: string;
  values_json: string;
  response_sla_days?: number | null;
  honor_score?: number | null;
  honor_answered?: number | null;
  honor_due?: number | null;
};

export type JobRow = {
  id: number;
  company_id: number;
  slug: string;
  title: string;
  team: string | null;
  location: string;
  city: string;
  country: string;
  remote_type: string;
  contract: string;
  seniority: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  equity: boolean;
  description?: string;
  responsibilities_json?: string;
  requirements_json?: string;
  nice_json?: string;
  benefits_json?: string;
  skills_json: string;
  posted_at: string;
  applicants_count: number;
  views_count: number;
  ghost_risk: string;
  collection: string | null;
  pool?: string | null;
  barriers_json?: string | null;
  trybuy_json?: string | null;
  slots_json?: string | null;
  process_hours?: number | string | null;
  decision_days?: number | null;
  company_slug: string;
  company_name: string;
  company_industry: string;
  company_hq_city: string;
  company_culture: number;
  company_velocity: string;
  company_honor?: number | null;
  company_sla?: number | null;
};

export function mapCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    about: row.about,
    industry: row.industry,
    sizeBand: row.size_band,
    hqCity: row.hq_city,
    hqCountry: row.hq_country,
    website: row.website,
    foundedYear: row.founded_year,
    cultureScore: row.culture_score,
    hiringVelocity: row.hiring_velocity,
    values: parseJsonList(row.values_json),
    responseSlaDays: Number(row.response_sla_days ?? 10),
    honorScore: Number(row.honor_score ?? 86),
    honorAnswered: Number(row.honor_answered ?? 0),
    honorDue: Number(row.honor_due ?? 0),
  };
}

export function mapJob(row: JobRow, profile: Profile | null, heldCompanies?: Set<number>): JobListItem {
  const job: JobListItem = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    team: row.team,
    location: row.location,
    city: row.city,
    country: row.country,
    remoteType: row.remote_type as RemoteType,
    contract: row.contract as ContractType,
    seniority: row.seniority as Seniority,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    currency: row.currency,
    equity: Boolean(row.equity),
    skills: parseJsonList(row.skills_json),
    postedAt: typeof row.posted_at === "string" ? row.posted_at : String(row.posted_at),
    applicantsCount: row.applicants_count,
    viewsCount: row.views_count,
    ghostRisk: row.ghost_risk as GhostRisk,
    collection: row.collection,
    pool: row.pool ?? null,
    barriers: parseJsonList(row.barriers_json),
    tryBuy: parseTryBuy(row.trybuy_json),
    slots: parseSlots(row.slots_json),
    processHours: Number(row.process_hours ?? 6),
    decisionDays: Number(row.decision_days ?? 14),
    company: {
      id: row.company_id,
      slug: row.company_slug,
      name: row.company_name,
      industry: row.company_industry,
      hqCity: row.company_hq_city,
      cultureScore: row.company_culture,
      hiringVelocity: row.company_velocity,
      honorScore: Number(row.company_honor ?? 86),
      responseSlaDays: Number(row.company_sla ?? 10),
    },
    match: null,
    moduleHeld: heldCompanies?.has(row.company_id) ?? false,
  };
  job.ghostRisk = inferGhost({
    postedAt: job.postedAt,
    applicantsCount: job.applicantsCount,
    viewsCount: job.viewsCount,
    hiringVelocity: job.company.hiringVelocity,
    stored: job.ghostRisk,
  });
  job.match = computeMatch(job, profile);
  if (job.moduleHeld && job.match != null) job.match = Math.min(99, job.match + 10);
  return job;
}

export type ProfileRow = {
  user_id: string;
  headline: string | null;
  location: string | null;
  remote_pref: string | null;
  seniority: string | null;
  skills_json: string;
  languages_json: string;
  bio: string | null;
  salary_min: number | null;
  salary_max: number | null;
  open_to_work: boolean;
  role_targets_json: string;
  slasher?: boolean | null;
  hours_week?: number | null;
  pool_prefs_json?: string | null;
  public_slug?: string | null;
  role?: string | null;
  house_slug?: string | null;
  barriers_json?: string | null;
};

export function mapProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    headline: row.headline,
    location: row.location,
    remotePref: row.remote_pref,
    seniority: row.seniority,
    skills: parseJsonList(row.skills_json),
    languages: parseJsonList(row.languages_json),
    bio: row.bio,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    openToWork: Boolean(row.open_to_work),
    roleTargets: parseJsonList(row.role_targets_json),
    slasher: Boolean(row.slasher),
    hoursWeek: row.hours_week ?? null,
    poolPrefs: parseJsonList(row.pool_prefs_json),
    role: (row.role === "house" || row.role === "operator" ? row.role : "candidate") as Profile["role"],
    houseSlug: row.house_slug ?? null,
    barriers: parseJsonList(row.barriers_json),
  };
}

export const JOB_SELECT = `
  j.id, j.company_id, j.slug, j.title, j.team, j.location, j.city, j.country,
  j.remote_type, j.contract, j.seniority, j.salary_min, j.salary_max, j.currency,
  j.equity, j.skills_json, j.posted_at, j.applicants_count, j.views_count,
  j.ghost_risk, j.collection, j.pool, j.barriers_json, j.trybuy_json, j.slots_json,
  j.process_hours, j.decision_days,
  c.slug as company_slug, c.name as company_name, c.industry as company_industry,
  c.hq_city as company_hq_city, c.culture_score as company_culture,
  c.hiring_velocity as company_velocity,
  c.honor_score as company_honor, c.response_sla_days as company_sla
`;
