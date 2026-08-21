import { createServerFn } from "@tanstack/react-start";
import { getSql } from "./db";
import { parseJsonList } from "./format";
import { parseStoredGrid } from "./fields";
import { JOB_SELECT, mapCompany, mapJob, mapProfile, type CompanyRow, type JobRow, type ProfileRow } from "./mappers";
import { parseOffer } from "./offer";
import { packForJob } from "./offer-data";
import { parseProcess } from "./process";
import { ensureSeeded } from "./seed";
import { MARKETS } from "./markets";
import type { HonorHouse, JobDetail, JobFilters, JobListItem, MarketPulse, Profile } from "./types";
import { briefScore, type Brief, type ShippedItem } from "./types";
import { computeVerdict } from "./verdict";
import { simFromCck } from "./cck-sim";

async function loadProfile(userId: string | null): Promise<Profile | null> {
  if (!userId) return null;
  const sql = await getSql();
  const rows = await sql<ProfileRow>`select * from profiles where user_id = ${userId} limit 1`;
  return rows[0] ? mapProfile(rows[0]) : null;
}

async function loadHeld(userId: string | null): Promise<Set<number>> {
  const held = new Set<number>();
  if (!userId) return held;
  const sql = await getSql();
  const rows = await sql<{ company_id: number }>`
    select distinct a.company_id
    from academy_enrollments e
    join academy_courses a on a.id = e.course_id
    where e.user_id = ${userId} and e.status = ${"completed"}
  `;
  for (const r of rows) held.add(r.company_id);
  return held;
}

async function optionalUserId(): Promise<string | null> {
  try {
    const { getSessionUser } = await import("./auth/verify.server");
    const u = await getSessionUser();
    return u?.id ?? null;
  } catch {
    return null;
  }
}

function median(values: number[]): number | null {
  const xs = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!xs.length) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid]! : Math.round((xs[mid - 1]! + xs[mid]!) / 2);
}

function parseShipped(raw: string | null | undefined): ShippedItem[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as { title?: unknown; impact?: unknown; year?: unknown };
      return [
        {
          title: String(row.title ?? ""),
          impact: String(row.impact ?? ""),
          year: String(row.year ?? ""),
        },
      ];
    });
  } catch {
    return [];
  }
}

async function loadBrief(userId: string | null): Promise<Brief | null> {
  if (!userId) return null;
  const sql = await getSql();
  const rows = await sql<{
    user_id: string;
    shipped_json: string;
    refuse_json: string;
    next_chapter: string | null;
    working_style: string | null;
    updated_at: string;
  }>`select * from briefs where user_id = ${userId} limit 1`;
  const row = rows[0];
  if (!row) return null;
  return {
    userId: row.user_id,
    shipped: parseShipped(row.shipped_json),
    refuse: parseJsonList(row.refuse_json),
    nextChapter: row.next_chapter,
    workingStyle: row.working_style,
    updatedAt: String(row.updated_at),
  };
}

export const listJobs = createServerFn({ method: "POST" })
  .validator((input: JobFilters) => input ?? {})
  .handler(async ({ data }): Promise<JobListItem[]> => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const uid = await optionalUserId();
    const profile = await loadProfile(uid);
    const held = await loadHeld(uid);

    const q = data.q?.trim().toLowerCase() ?? "";
    const remote = data.remote || "";
    const contract = data.contract || "";
    const seniority = data.seniority || "";
    const collection = data.collection || "";
    const pacte = data.pacte || "";
    const pool = data.pool || "";
    const country = data.country || "";

    const all = await sql.query<JobRow>(
      `select ${JOB_SELECT}
       from jobs j
       join companies c on c.id = j.company_id
       order by j.posted_at desc`,
    );

    let jobs = all.map((row) => mapJob(row, profile, held));

    if (q) {
      jobs = jobs.filter((j) => {
        const hay = [j.title, j.company.name, j.city, j.team ?? "", j.company.industry, ...j.skills]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    if (remote) jobs = jobs.filter((j) => j.remoteType === remote);
    if (contract) jobs = jobs.filter((j) => j.contract === contract);
    if (seniority) jobs = jobs.filter((j) => j.seniority === seniority);
    if (collection) jobs = jobs.filter((j) => j.collection === collection);
    if (pool) jobs = jobs.filter((j) => j.pool === pool);
    if (country) {
      const needle = country.toLowerCase();
      const market = MARKETS.find(
        (m) => m.nameEn.toLowerCase() === needle || m.name.toLowerCase() === needle || m.code.toLowerCase() === needle,
      );
      const aliases = market
        ? [market.name, market.nameEn, market.code, ...market.cities]
        : [country];
      jobs = jobs.filter((j) => {
        const hay = `${j.country} ${j.city} ${j.location}`.toLowerCase();
        return aliases.some((a) => hay.includes(a.toLowerCase())) || (needle === "remote" && j.remoteType === "remote");
      });
    }
    if (pacte === "solide") jobs = jobs.filter((j) => j.company.honorScore >= 85 && j.ghostRisk !== "high");

    const sort = data.sort ?? "signal";
    if (sort === "salary") {
      jobs.sort((a, b) => (b.salaryMax ?? 0) - (a.salaryMax ?? 0));
    } else if (sort === "recent") {
      jobs.sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
    } else if (sort === "honneur") {
      jobs.sort((a, b) => {
        if (b.company.honorScore !== a.company.honorScore) return b.company.honorScore - a.company.honorScore;
        return (b.match ?? 55) - (a.match ?? 55);
      });
    } else {
      jobs.sort((a, b) => {
        const ghostPenalty = (g: string) => (g === "high" ? 40 : g === "medium" ? 12 : 0);
        const honorBoost = (h: number) => (h >= 94 ? 6 : h < 65 ? -18 : 0);
        const aScore = (a.match ?? 55) - ghostPenalty(a.ghostRisk) + honorBoost(a.company.honorScore);
        const bScore = (b.match ?? 55) - ghostPenalty(b.ghostRisk) + honorBoost(b.company.honorScore);
        if (bScore !== aScore) return bScore - aScore;
        return +new Date(b.postedAt) - +new Date(a.postedAt);
      });
    }

    return jobs;
  });

export const getJob = createServerFn({ method: "POST" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<JobDetail | null> => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const userId = await optionalUserId();
    const profile = await loadProfile(userId);
    const brief = await loadBrief(userId);

    const rows = await sql.query<
      JobRow & {
        description: string;
        responsibilities_json: string;
        requirements_json: string;
        nice_json: string;
        benefits_json: string;
        process_json: string;
        offer_json: string;
        grid_json: string | null;
      }
    >(
      `select ${JOB_SELECT},
              j.description, j.responsibilities_json, j.requirements_json,
              j.nice_json, j.benefits_json, j.process_json, j.offer_json, j.grid_json
       from jobs j
       join companies c on c.id = j.company_id
       where j.slug = $1
       limit 1`,
      [slug],
    );
    const row = rows[0];
    if (!row) return null;

    const companyRows = await sql<CompanyRow>`select * from companies where id = ${row.company_id} limit 1`;
    const company = companyRows[0] ? mapCompany(companyRows[0]) : null;
    if (!company) return null;

    const industryPay = await sql<{ salary_max: number | null }>`
      select j.salary_max
      from jobs j
      join companies c on c.id = j.company_id
      where c.industry = ${company.industry} and j.salary_max is not null
    `;

    let saved = false;
    let applied = false;
    let quietRaised = false;
    if (userId) {
      const s = await sql<{ n: number }>`select count(*)::int as n from saved_jobs where user_id = ${userId} and job_id = ${row.id}`;
      const a = await sql<{ n: number }>`select count(*)::int as n from applications where user_id = ${userId} and job_id = ${row.id}`;
      const q = await sql<{ n: number }>`select count(*)::int as n from quiet_signals where user_id = ${userId} and job_id = ${row.id}`;
      saved = (s[0]?.n ?? 0) > 0;
      applied = (a[0]?.n ?? 0) > 0;
      quietRaised = (q[0]?.n ?? 0) > 0;
    }

    const quietRows = await sql<{ n: number }>`select count(*)::int as n from quiet_signals where job_id = ${row.id}`;
    const held = await loadHeld(userId);
    const process = parseProcess(row.process_json);
    const base = mapJob(row, profile, held);
    const marketMedian = median(industryPay.map((r) => r.salary_max ?? 0));
    const offer =
      parseOffer(row.offer_json) ??
      packForJob({
        slug: base.slug,
        title: base.title,
        city: base.city,
        country: base.country,
        seniority: base.seniority,
        salaryMin: base.salaryMin ?? 0,
        salaryMax: base.salaryMax ?? 0,
        remoteType: base.remoteType,
        collection: base.collection ?? "",
        companySlug: company.slug,
        skills: base.skills,
        benefits: parseJsonList(row.benefits_json),
        industry: company.industry,
      });
    const storedGrid = parseStoredGrid(row.grid_json);
    const cckRows = await sql<{ name: string; value_json: string }>`
      select f.name, v.value_json
      from cck_values v
      join cck_fields f on f.id = v.field_id
      where v.entity_kind = ${"job"} and v.entity_id = ${row.id}
    `;
    const cckVals: Record<string, string> = {};
    for (const r of cckRows) {
      try {
        const v = JSON.parse(r.value_json) as unknown;
        if (v == null) cckVals[r.name] = "";
        else if (Array.isArray(v)) cckVals[r.name] = v.map(String).join(", ");
        else if (typeof v === "boolean") cckVals[r.name] = v ? "oui" : "non";
        else cckVals[r.name] = String(v);
      } catch {
        cckVals[r.name] = r.value_json;
      }
    }
    const cckSim = simFromCck(cckVals, offer.sim, {
      title: base.title,
      collection: base.collection,
      city: base.city,
      slug: base.slug,
    });
    if (cckSim) offer.sim = cckSim;
    const verdict = computeVerdict({
      ghostRisk: base.ghostRisk,
      hiringVelocity: company.hiringVelocity,
      honorScore: company.honorScore,
      honorDue: company.honorDue,
      slaDays: company.responseSlaDays,
      hours: base.processHours,
      match: base.match,
      salaryMin: base.salaryMin,
      salaryMax: base.salaryMax,
      marketMedian,
      profile,
    });

    return {
      ...base,
      description: row.description,
      responsibilities: parseJsonList(row.responsibilities_json),
      requirements: parseJsonList(row.requirements_json),
      nice: parseJsonList(row.nice_json),
      benefits: parseJsonList(row.benefits_json),
      companyFull: company,
      marketMedian,
      saved,
      applied,
      process,
      quietCount: quietRows[0]?.n ?? 0,
      quietRaised,
      briefReady: brief ? briefScore(brief) >= 75 : false,
      verdict,
      offer,
      gridFamily: storedGrid.family ?? null,
      customFields: storedGrid.extra,
    };
  });

export const listCompanies = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  await ensureSeeded(sql);
  const rows = await sql<CompanyRow>`select * from companies order by honor_score desc, name`;
  const counts = await sql<{ company_id: number; n: number }>`
    select company_id, count(*)::int as n from jobs group by company_id
  `;
  const nById = new Map(counts.map((c) => [c.company_id, c.n]));
  const academy = await sql<{ company_id: number; n: number }>`
    select company_id, count(*)::int as n from academy_courses where published group by company_id
  `;
  const aById = new Map(academy.map((c) => [c.company_id, c.n]));
  return rows.map((r) => ({
    ...mapCompany(r),
    jobCount: nById.get(r.id) ?? 0,
    courseCount: aById.get(r.id) ?? 0,
  }));
});

export const getCompany = createServerFn({ method: "POST" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const uid = await optionalUserId();
    const profile = await loadProfile(uid);
    const held = await loadHeld(uid);
    const rows = await sql<CompanyRow>`select * from companies where slug = ${slug} limit 1`;
    if (!rows[0]) return null;
    const company = mapCompany(rows[0]);
    const jobs = await sql.query<JobRow>(
      `select ${JOB_SELECT}
       from jobs j
       join companies c on c.id = j.company_id
       where c.slug = $1
       order by j.posted_at desc`,
      [slug],
    );
    return { company, jobs: jobs.map((j) => mapJob(j, profile, held)) };
  });

export const getMarketPulse = createServerFn({ method: "GET" }).handler(
  async (): Promise<MarketPulse> => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<{
      salary_min: number | null;
      salary_max: number | null;
      ghost_risk: string;
      remote_type: string;
    }>`select salary_min, salary_max, ghost_risk, remote_type from jobs`;
    const active = rows.length;
    const withSalary = rows.filter((r) => r.salary_min != null).length;
    const ghost = rows.filter((r) => r.ghost_risk === "high").length;
    const remoteN = rows.filter((r) => r.remote_type === "remote").length;
    return {
      activeJobs: active,
      salaryPublishedPct: active ? Math.round((withSalary / active) * 100) : 0,
      ghostFlagged: ghost,
      medianSalary: median(rows.map((r) => r.salary_max).filter((n): n is number => n != null)),
      remotePct: active ? Math.round((remoteN / active) * 100) : 0,
    };
  },
);

export const getFeatured = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  await ensureSeeded(sql);
  const profile = await loadProfile(await optionalUserId());
  const rows = await sql.query<JobRow>(
    `select ${JOB_SELECT}
     from jobs j
     join companies c on c.id = j.company_id
     where j.ghost_risk = 'low' and c.honor_score >= 82
     order by c.honor_score desc, j.posted_at desc
     limit 6`,
  );
  return rows.map((r) => mapJob(r, profile));
});

export const getHonorLeague = createServerFn({ method: "GET" }).handler(
  async (): Promise<HonorHouse[]> => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<
      CompanyRow & { job_count: number }
    >`
      select c.*, coalesce(j.n, 0)::int as job_count
      from companies c
      left join (select company_id, count(*)::int as n from jobs group by company_id) j
        on j.company_id = c.id
      order by c.honor_score desc, c.name
    `;
    return rows.map((r) => {
      const c = mapCompany(r);
      return {
        slug: c.slug,
        name: c.name,
        industry: c.industry,
        honorScore: c.honorScore,
        honorAnswered: c.honorAnswered,
        honorDue: c.honorDue,
        responseSlaDays: c.responseSlaDays,
        jobCount: Number(r.job_count ?? 0),
      };
    });
  },
);
