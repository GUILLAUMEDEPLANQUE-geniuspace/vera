import { formatSalary } from "./format";
import type { EvalGrid } from "./fields";
import type { CultureProfile } from "./culture";
import type { Scarcity } from "./scarcity";
import type { Company, JobDetail, JobListItem } from "./types";
import { CONTRACT_LABEL, REMOTE_LABEL, SENIORITY_LABEL } from "./types";

export function jobMarkdown(
  job: JobDetail,
  origin: string,
  culture: CultureProfile,
  grid: EvalGrid,
  scarcity: Scarcity,
): string {
  const pay = formatSalary(job.salaryMin, job.salaryMax, job.currency);
  const url = `${origin}/jobs/${job.slug}`;
  const lines = [
    `---`,
    `title: ${JSON.stringify(job.title)}`,
    `company: ${JSON.stringify(job.company.name)}`,
    `location: ${JSON.stringify(job.location)}`,
    `remote: ${job.remoteType}`,
    `contract: ${job.contract}`,
    `seniority: ${job.seniority}`,
    `salary_min: ${job.salaryMin}`,
    `salary_max: ${job.salaryMax}`,
    `currency: ${job.currency}`,
    `honor: ${job.company.honorScore}`,
    `sla_days: ${job.company.responseSlaDays}`,
    `scarcity: ${scarcity.score}`,
    `pool: ${JSON.stringify(job.pool ?? "")}`,
    `url: ${url}`,
    `date_posted: ${job.postedAt}`,
    `skills: [${job.skills.map((s) => JSON.stringify(s)).join(", ")}]`,
    `---`,
    ``,
    `# ${job.title} — ${job.company.name}`,
    ``,
    `> Machine-readable Vera job. For ATS and AI agents. Canonical: ${url}`,
    ``,
    `## Facts`,
    `- Pay: ${pay}`,
    `- Contract: ${CONTRACT_LABEL[job.contract]} · ${SENIORITY_LABEL[job.seniority]} · ${REMOTE_LABEL[job.remoteType]}`,
    `- Process: ${job.processHours} h · decision ${job.decisionDays} d`,
    `- Pact: answer in ${job.company.responseSlaDays} days · honor ${job.company.honorScore}`,
    `- Scarcity: ${scarcity.score} (${scarcity.label})`,
    `- Culture intercultural: ${culture.intercultural}/100`,
    ``,
    `## Description`,
    job.description,
    ``,
    `## You will`,
    ...job.responsibilities.map((r) => `- ${r}`),
    ``,
    `## Requirements`,
    ...job.requirements.map((r) => `- ${r}`),
    ``,
    `## Evaluation grid (public)`,
    `Family: ${grid.family}. ${grid.intro}`,
    ...grid.fields.map((f) => `- ${f.label} (weight ${f.weight}) — ${f.hint}`),
    ``,
    `## Culture`,
    culture.essay,
    ``,
    `## Honest`,
    `Hard: ${job.offer.honesty.hard}`,
    `Good: ${job.offer.honesty.good}`,
    `Exceptional: ${job.offer.honesty.exceptional}`,
    ``,
    `Apply: ${url} (brief required, pact starts on send).`,
  ];
  return lines.join("\n");
}

export function jobAgentJson(
  job: JobDetail,
  origin: string,
  culture: CultureProfile,
  grid: EvalGrid,
  scarcity: Scarcity,
) {
  return {
    spec: "vera.job.v1",
    id: job.slug,
    url: `${origin}/jobs/${job.slug}`,
    md: `${origin}/feed/${job.slug}.md`,
    title: job.title,
    company: {
      slug: job.company.slug,
      name: job.company.name,
      honor: job.company.honorScore,
      slaDays: job.company.responseSlaDays,
      industry: job.company.industry,
    },
    location: { city: job.city, country: job.country, remote: job.remoteType },
    contract: job.contract,
    seniority: job.seniority,
    salary: { min: job.salaryMin, max: job.salaryMax, currency: job.currency, published: true },
    skills: job.skills,
    processHours: job.processHours,
    decisionDays: job.decisionDays,
    scarcity,
    culture: {
      intercultural: culture.intercultural,
      languages: culture.languages,
      axes: culture.axes,
    },
    grid: {
      family: grid.family,
      fields: grid.fields.map((f) => ({ id: f.id, label: f.label, kind: f.kind, weight: f.weight })),
    },
    postedAt: job.postedAt,
    ghostRisk: job.ghostRisk,
  };
}

export function companyMarkdown(
  company: Company,
  jobs: JobListItem[],
  origin: string,
  culture: CultureProfile,
): string {
  const url = `${origin}/companies/${company.slug}`;
  const lines = [
    `---`,
    `spec: vera.company.v1`,
    `name: ${JSON.stringify(company.name)}`,
    `slug: ${company.slug}`,
    `industry: ${JSON.stringify(company.industry)}`,
    `hq: ${JSON.stringify(`${company.hqCity}, ${company.hqCountry}`)}`,
    `honor: ${company.honorScore}`,
    `sla_days: ${company.responseSlaDays}`,
    `intercultural: ${culture.intercultural}`,
    `languages: [${culture.languages.map((l) => JSON.stringify(l)).join(", ")}]`,
    `url: ${url}`,
    `md: ${origin}/feed/maisons/${company.slug}.md`,
    `jobs: ${jobs.length}`,
    `academy: ${origin}/companies/${company.slug}/academie`,
    `---`,
    ``,
    `# ${company.name}`,
    ``,
    `> Machine-readable Vera house. For ATS and AI agents. Canonical: ${url}`,
    ``,
    `## Pact`,
    `- Honor ${company.honorScore}/100 (${company.honorAnswered}/${company.honorDue} on time)`,
    `- Answer in ${company.responseSlaDays} days`,
    `- Size ${company.sizeBand}${company.foundedYear ? ` · founded ${company.foundedYear}` : ""}`,
    ``,
    `## About`,
    company.about,
    ``,
    `## Culture`,
    culture.essay,
    ``,
    `- Management: ${culture.management}`,
    `- Week: ${culture.weekStyle}`,
    `- Axes: speech ${culture.axes.directness}, hierarchy ${culture.axes.hierarchy}, tempo ${culture.axes.tempo}, writing ${culture.axes.writing}, risk ${culture.axes.risk}`,
    ``,
    `## Academy`,
    `- Employee training catalog: ${origin}/companies/${company.slug}/academie`,
    `- Same page as the house. Not a disconnected LMS.`,
    ``,
    `## Open jobs`,
    ...jobs.map(
      (j) =>
        `- [${j.title}](${origin}/jobs/${j.slug}) (${origin}/feed/${j.slug}.md) · ${j.city} · ${j.salaryMin ?? "?"}–${j.salaryMax ?? "?"} ${j.currency}`,
    ),
    jobs.length === 0 ? `- None right now.` : "",
  ];
  return lines.filter((l) => l !== "").join("\n") + "\n";
}
