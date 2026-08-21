import type { FieldDef } from "./fields";
import type { OfferPack } from "./offer";
import type { ProcessStep } from "./process";
import type { Verdict } from "./verdict";

export type RemoteType = "remote" | "hybrid" | "onsite";
export type ContractType = "cdi" | "cdd" | "freelance" | "stage" | "alternance";
export type Seniority = "junior" | "mid" | "senior" | "staff" | "lead";
export type GhostRisk = "low" | "medium" | "high";
export type ApplicationStatus =
  | "sent"
  | "review"
  | "interview"
  | "offer"
  | "rejected";

export type Company = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  about: string;
  industry: string;
  sizeBand: string;
  hqCity: string;
  hqCountry: string;
  website: string | null;
  foundedYear: number | null;
  cultureScore: number;
  hiringVelocity: string;
  values: string[];
  responseSlaDays: number;
  honorScore: number;
  honorAnswered: number;
  honorDue: number;
};

export type JobListItem = {
  id: number;
  slug: string;
  title: string;
  team: string | null;
  location: string;
  city: string;
  country: string;
  remoteType: RemoteType;
  contract: ContractType;
  seniority: Seniority;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  equity: boolean;
  skills: string[];
  postedAt: string;
  applicantsCount: number;
  viewsCount: number;
  ghostRisk: GhostRisk;
  collection: string | null;
  pool: string | null;
  barriers: string[];
  tryBuy: { days: number; dailyPay: number; supervisor: string; startNote: string } | null;
  slots: { weekday: number; startHour: number; hours: number; city: string; seats: number }[];
  processHours: number;
  decisionDays: number;
  company: {
    id: number;
    slug: string;
    name: string;
    industry: string;
    hqCity: string;
    cultureScore: number;
    hiringVelocity: string;
    honorScore: number;
    responseSlaDays: number;
  };
  match: number | null;
  moduleHeld?: boolean;
};

export type JobDetail = JobListItem & {
  description: string;
  responsibilities: string[];
  requirements: string[];
  nice: string[];
  benefits: string[];
  companyFull: Company;
  marketMedian: number | null;
  saved: boolean;
  applied: boolean;
  process: ProcessStep[];
  quietCount: number;
  quietRaised: boolean;
  briefReady: boolean;
  verdict: Verdict;
  offer: OfferPack;
  gridFamily: string | null;
  customFields: FieldDef[];
};

export type Profile = {
  userId: string;
  headline: string | null;
  location: string | null;
  remotePref: string | null;
  seniority: string | null;
  skills: string[];
  languages: string[];
  bio: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  openToWork: boolean;
  roleTargets: string[];
  slasher: boolean;
  hoursWeek: number | null;
  poolPrefs: string[];
  role: "candidate" | "house" | "operator";
  houseSlug: string | null;
  barriers: string[];
};

export type ShippedItem = {
  title: string;
  impact: string;
  year: string;
};

export type Brief = {
  userId: string;
  shipped: ShippedItem[];
  refuse: string[];
  nextChapter: string | null;
  workingStyle: string | null;
  updatedAt: string | null;
};

export type ApplicationRow = {
  id: number;
  status: ApplicationStatus;
  coverLetter: string | null;
  createdAt: string;
  updatedAt: string;
  dueAt: string | null;
  answeredAt: string | null;
  pactBreached: boolean;
  briefAttached: boolean;
  trialScore: number | null;
  fitScore: number | null;
  feedback: { reasons: string[]; note: string; lessons: string[]; text: string } | null;
  job: JobListItem;
};

export type MarketPulse = {
  activeJobs: number;
  salaryPublishedPct: number;
  ghostFlagged: number;
  medianSalary: number | null;
  remotePct: number;
};

export type HonorHouse = {
  slug: string;
  name: string;
  industry: string;
  honorScore: number;
  honorAnswered: number;
  honorDue: number;
  responseSlaDays: number;
  jobCount: number;
};

export type JobFilters = {
  q?: string;
  remote?: RemoteType | "";
  contract?: ContractType | "";
  seniority?: Seniority | "";
  collection?: string;
  pacte?: "solide" | "";
  pool?: string;
  country?: string;
  sort?: "signal" | "recent" | "salary" | "honneur";
};

export const REMOTE_LABEL: Record<RemoteType, string> = {
  remote: "Remote",
  hybrid: "Hybride",
  onsite: "Sur site",
};

export const CONTRACT_LABEL: Record<ContractType, string> = {
  cdi: "CDI",
  cdd: "CDD",
  freelance: "Freelance",
  stage: "Stage",
  alternance: "Alternance",
};

export const SENIORITY_LABEL: Record<Seniority, string> = {
  junior: "Junior",
  mid: "Confirmé",
  senior: "Senior",
  staff: "Staff",
  lead: "Lead",
};

export const GHOST_LABEL: Record<GhostRisk, string> = {
  low: "Signal clair",
  medium: "À vérifier",
  high: "Ghost probable",
};

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  sent: "Envoyée",
  review: "En revue",
  interview: "Entretien",
  offer: "Offre",
  rejected: "Refus",
};

export const STATUS_ORDER: ApplicationStatus[] = [
  "sent",
  "review",
  "interview",
  "offer",
  "rejected",
];

export function briefScore(brief: Pick<Brief, "shipped" | "refuse" | "nextChapter" | "workingStyle">): number {
  let n = 0;
  if (brief.shipped.filter((s) => s.title.trim() && s.impact.trim()).length >= 2) n += 1;
  if (brief.refuse.filter((s) => s.trim()).length >= 1) n += 1;
  if ((brief.nextChapter ?? "").trim().length >= 40) n += 1;
  if ((brief.workingStyle ?? "").trim().length >= 20) n += 1;
  return Math.round((n / 4) * 100);
}
