import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { getSql } from "./db";
import { parseJsonList, slugify } from "./format";
import type { FieldDef, FieldKind } from "./fields";
import { JOB_SELECT, mapJob, mapProfile, type JobRow, type ProfileRow } from "./mappers";
import { recalcHonor } from "./pact";
import { decisionDaysFor, hoursOf, processForJob } from "./process";
import { ensureSeeded } from "./seed";
import { briefScore, type ApplicationRow, type ApplicationStatus, type Profile, type ShippedItem } from "./types";
import { maybeInvoice } from "./ops-fn";

function parseFeedback(raw: string | null | undefined): ApplicationRow["feedback"] {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { reasons?: string[]; note?: string; lessons?: string[]; text?: string };
    if (!v || typeof v !== "object") return null;
    return {
      reasons: Array.isArray(v.reasons) ? v.reasons.map(String) : [],
      note: String(v.note ?? ""),
      lessons: Array.isArray(v.lessons) ? v.lessons.map(String) : [],
      text: String(v.text ?? ""),
    };
  } catch {
    return null;
  }
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Profile> => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<ProfileRow>`select * from profiles where user_id = ${context.userId} limit 1`;
    if (rows[0]) return mapProfile(rows[0]);
    await sql`
      insert into profiles (user_id, skills_json, languages_json, role_targets_json)
      values (${context.userId}, ${"[]"}, ${"[]"}, ${"[]"})
      on conflict (user_id) do nothing
    `;
    return {
      userId: context.userId,
      headline: null,
      location: null,
      remotePref: null,
      seniority: null,
      skills: [],
      languages: [],
      bio: null,
      salaryMin: null,
      salaryMax: null,
      openToWork: true,
      roleTargets: [],
      slasher: false,
      hoursWeek: null,
      poolPrefs: [],
      role: "candidate",
      houseSlug: null,
      barriers: [],
    };
  });

export type ProfileInput = {
  headline: string;
  location: string;
  remotePref: string;
  seniority: string;
  skills: string[];
  languages: string[];
  bio: string;
  salaryMin: number | null;
  salaryMax: number | null;
  openToWork: boolean;
  roleTargets: string[];
  slasher?: boolean;
  hoursWeek?: number | null;
  poolPrefs?: string[];
  barriers?: string[];
};

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ProfileInput) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    await sql`
      insert into profiles (
        user_id, headline, location, remote_pref, seniority, skills_json,
        languages_json, bio, salary_min, salary_max, open_to_work, role_targets_json,
        slasher, hours_week, pool_prefs_json, barriers_json, updated_at
      ) values (
        ${context.userId}, ${data.headline}, ${data.location}, ${data.remotePref},
        ${data.seniority}, ${JSON.stringify(data.skills)}, ${JSON.stringify(data.languages)},
        ${data.bio}, ${data.salaryMin}, ${data.salaryMax}, ${data.openToWork},
        ${JSON.stringify(data.roleTargets)}, ${Boolean(data.slasher)}, ${data.hoursWeek ?? null},
        ${JSON.stringify(data.poolPrefs ?? [])}, ${JSON.stringify(data.barriers ?? [])}, now()
      )
      on conflict (user_id) do update set
        headline = excluded.headline,
        location = excluded.location,
        remote_pref = excluded.remote_pref,
        seniority = excluded.seniority,
        skills_json = excluded.skills_json,
        languages_json = excluded.languages_json,
        bio = excluded.bio,
        salary_min = excluded.salary_min,
        salary_max = excluded.salary_max,
        open_to_work = excluded.open_to_work,
        role_targets_json = excluded.role_targets_json,
        slasher = excluded.slasher,
        hours_week = excluded.hours_week,
        pool_prefs_json = excluded.pool_prefs_json,
        barriers_json = excluded.barriers_json,
        updated_at = now()
    `;
    return { ok: true as const };
  });

export const toggleSaveJob = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((jobId: number) => jobId)
  .handler(async ({ context, data: jobId }) => {
    const sql = await getSql();
    const existing = await sql<{ n: number }>`
      select count(*)::int as n from saved_jobs where user_id = ${context.userId} and job_id = ${jobId}
    `;
    if ((existing[0]?.n ?? 0) > 0) {
      await sql`delete from saved_jobs where user_id = ${context.userId} and job_id = ${jobId}`;
      return { saved: false };
    }
    await sql`insert into saved_jobs (user_id, job_id) values (${context.userId}, ${jobId})`;
    return { saved: true };
  });

async function briefReady(sql: Awaited<ReturnType<typeof getSql>>, userId: string): Promise<boolean> {
  const rows = await sql<{
    shipped_json: string;
    refuse_json: string;
    next_chapter: string | null;
    working_style: string | null;
  }>`select shipped_json, refuse_json, next_chapter, working_style from briefs where user_id = ${userId} limit 1`;
  const row = rows[0];
  if (!row) return false;
  let shipped: ShippedItem[] = [];
  try {
    const v = JSON.parse(row.shipped_json) as unknown;
    if (Array.isArray(v)) {
      shipped = v.map((item) => {
        const r = (item ?? {}) as { title?: string; impact?: string; year?: string };
        return { title: r.title ?? "", impact: r.impact ?? "", year: r.year ?? "" };
      });
    }
  } catch {
    shipped = [];
  }
  return (
    briefScore({
      shipped,
      refuse: parseJsonList(row.refuse_json),
      nextChapter: row.next_chapter,
      workingStyle: row.working_style,
    }) >= 75
  );
}

export const applyToJob = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { jobId: number; coverLetter: string; trialScore?: number; fitScore?: number; grid?: Record<string, unknown>; misses?: string[] }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const companies = await sql<{ sla: number }>`
      select c.response_sla_days as sla
      from jobs j join companies c on c.id = j.company_id
      where j.id = ${data.jobId}
      limit 1
    `;
    const sla = Number(companies[0]?.sla ?? 10);
    const attached = await briefReady(sql, context.userId);
    const prior = await sql<{ n: number }>`
      select count(*)::int as n from applications
      where user_id = ${context.userId} and job_id = ${data.jobId}
    `;
    const isNew = (prior[0]?.n ?? 0) === 0;
    const dueAt = new Date(Date.now() + sla * 86_400_000).toISOString();
    const trial = data.trialScore ?? null;
    const fit = data.fitScore ?? null;
    const gridJson = JSON.stringify(data.grid ?? {});
    const missJson = JSON.stringify(data.misses ?? []);
    await sql.query(`alter table applications add column if not exists fit_score int`);
    await sql.query(`alter table applications add column if not exists grid_json text`);
    await sql.query(`alter table applications add column if not exists miss_json text not null default '[]'`);
    await sql`
      insert into applications (user_id, job_id, status, cover_letter, due_at, brief_attached, trial_score, fit_score, grid_json, miss_json)
      values (
        ${context.userId},
        ${data.jobId},
        ${"sent"},
        ${data.coverLetter},
        ${dueAt},
        ${attached},
        ${trial},
        ${fit},
        ${gridJson},
        ${missJson}
      )
      on conflict (user_id, job_id) do update set
        cover_letter = excluded.cover_letter,
        brief_attached = excluded.brief_attached,
        trial_score = excluded.trial_score,
        fit_score = excluded.fit_score,
        grid_json = excluded.grid_json,
        miss_json = excluded.miss_json,
        updated_at = now()
    `;
    if (isNew) {
      await sql`update jobs set applicants_count = applicants_count + 1 where id = ${data.jobId}`;
    }
    const appRow = await sql<{ id: number; company_id: number; title: string; city: string; seniority: string }>`
      select a.id, j.company_id, j.title, j.city, j.seniority
      from applications a join jobs j on j.id = a.job_id
      where a.user_id = ${context.userId} and a.job_id = ${data.jobId}
      limit 1
    `;
    if (appRow[0]) {
      await maybeInvoice(sql, {
        applicationId: appRow[0].id,
        jobId: data.jobId,
        companyId: appRow[0].company_id,
        trial,
        fit,
        city: appRow[0].city,
        seniority: appRow[0].seniority,
        title: appRow[0].title,
      });
    }
    if ((trial != null && trial >= 1) || (fit != null && fit >= 55)) {
      const jobs = await sql<{ title: string; collection: string | null }>`select title, collection from jobs where id = ${data.jobId} limit 1`;
      const label = jobs[0]?.title ?? "Épreuve";
      await sql`
        insert into aptitude_badges (user_id, job_id, family, label, score)
        values (${context.userId}, ${data.jobId}, ${jobs[0]?.collection ?? "metier"}, ${label}, ${fit ?? trial ?? 0})
      `;
    }
    return { ok: true as const, briefAttached: attached, slaDays: sla, trialScore: trial };
  });

export const listSavedJobs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const profileRows = await sql<ProfileRow>`select * from profiles where user_id = ${context.userId} limit 1`;
    const profile = profileRows[0] ? mapProfile(profileRows[0]) : null;
    const rows = await sql.query<JobRow>(
      `select ${JOB_SELECT}
       from saved_jobs s
       join jobs j on j.id = s.job_id
       join companies c on c.id = j.company_id
       where s.user_id = $1
       order by s.created_at desc`,
      [context.userId],
    );
    return rows.map((r) => mapJob(r, profile));
  });

async function settleOverdue(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const overdue = await sql<{ id: number; company_id: number }>`
    select a.id, c.id as company_id
    from applications a
    join jobs j on j.id = a.job_id
    join companies c on c.id = j.company_id
    where a.user_id = ${userId}
      and a.status = ${"sent"}
      and a.due_at is not null
      and a.due_at < now()
      and a.pact_breached = false
  `;
  for (const row of overdue) {
    await sql`update applications set pact_breached = true where id = ${row.id}`;
    const house = await sql<{ honor_answered: number; honor_due: number }>`
      select honor_answered, honor_due from companies where id = ${row.company_id} limit 1
    `;
    const answered = Number(house[0]?.honor_answered ?? 0);
    const due = Number(house[0]?.honor_due ?? 0) + 1;
    await sql`
      update companies
      set honor_due = ${due}, honor_score = ${recalcHonor(answered, due)}
      where id = ${row.company_id}
    `;
  }
}

export const listMyApplications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ApplicationRow[]> => {
    const sql = await getSql();
    await ensureSeeded(sql);
    await settleOverdue(sql, context.userId);
    const profileRows = await sql<ProfileRow>`select * from profiles where user_id = ${context.userId} limit 1`;
    const profile = profileRows[0] ? mapProfile(profileRows[0]) : null;
    const rows = await sql.query<
      JobRow & {
        app_id: number;
        app_status: ApplicationStatus;
        cover_letter: string | null;
        app_created: string;
        app_updated: string;
        due_at: string | null;
        answered_at: string | null;
        pact_breached: boolean;
        brief_attached: boolean;
        trial_score: number | null;
        fit_score: number | null;
        feedback_json: string | null;
      }
    >(
      `select ${JOB_SELECT},
              a.id as app_id, a.status as app_status, a.cover_letter,
              a.created_at as app_created, a.updated_at as app_updated,
              a.due_at, a.answered_at, a.pact_breached, a.brief_attached,
              a.trial_score, a.fit_score, a.feedback_json
       from applications a
       join jobs j on j.id = a.job_id
       join companies c on c.id = j.company_id
       where a.user_id = $1
       order by a.updated_at desc`,
      [context.userId],
    );
    return rows.map((r) => ({
      id: r.app_id,
      status: r.app_status,
      coverLetter: r.cover_letter,
      createdAt: String(r.app_created),
      updatedAt: String(r.app_updated),
      dueAt: r.due_at ? String(r.due_at) : null,
      answeredAt: r.answered_at ? String(r.answered_at) : null,
      pactBreached: Boolean(r.pact_breached),
      briefAttached: Boolean(r.brief_attached),
      trialScore: r.trial_score == null ? null : Number(r.trial_score),
      fitScore: r.fit_score == null ? null : Number(r.fit_score),
      feedback: parseFeedback((r as { feedback_json?: string | null }).feedback_json),
      job: mapJob(r, profile),
    }));
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; status: ApplicationStatus }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{
      status: string;
      due_at: string | null;
      answered_at: string | null;
      pact_breached: boolean;
      company_id: number;
    }>`
      select a.status, a.due_at, a.answered_at, a.pact_breached, j.company_id
      from applications a
      join jobs j on j.id = a.job_id
      where a.id = ${data.id} and a.user_id = ${context.userId}
      limit 1
    `;
    const app = rows[0];
    if (!app) return { ok: false as const };

    const becomingAnswered = data.status !== "sent" && !app.answered_at;
    if (becomingAnswered) {
      const onTime = app.due_at ? new Date(app.due_at).getTime() >= Date.now() : true;
      if (onTime && !app.pact_breached) {
        const house = await sql<{ honor_answered: number; honor_due: number }>`
          select honor_answered, honor_due from companies where id = ${app.company_id} limit 1
        `;
        const answered = Number(house[0]?.honor_answered ?? 0) + 1;
        const due = Number(house[0]?.honor_due ?? 0) + 1;
        await sql`
          update companies
          set honor_answered = ${answered}, honor_due = ${due}, honor_score = ${recalcHonor(answered, due)}
          where id = ${app.company_id}
        `;
      } else if (!app.pact_breached) {
        const house = await sql<{ honor_answered: number; honor_due: number }>`
          select honor_answered, honor_due from companies where id = ${app.company_id} limit 1
        `;
        const answered = Number(house[0]?.honor_answered ?? 0);
        const due = Number(house[0]?.honor_due ?? 0) + 1;
        await sql`
          update companies
          set honor_due = ${due}, honor_score = ${recalcHonor(answered, due)}
          where id = ${app.company_id}
        `;
        await sql`update applications set pact_breached = true where id = ${data.id}`;
      }
      await sql`
        update applications
        set status = ${data.status}, answered_at = now(), updated_at = now()
        where id = ${data.id} and user_id = ${context.userId}
      `;
    } else {
      await sql`
        update applications
        set status = ${data.status}, updated_at = now()
        where id = ${data.id} and user_id = ${context.userId}
      `;
    }
    return { ok: true as const };
  });

export type PostJobInput = {
  companyName: string;
  title: string;
  team: string;
  city: string;
  country: string;
  remoteType: string;
  contract: string;
  seniority: string;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  skills: string[];
  slaDays: number;
  family?: string;
  pool?: string | null;
  customFields?: {
    label: string;
    kind: FieldKind;
    hint: string;
    options?: string[];
    weight?: number;
  }[];
};

export const postJob = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: PostJobInput) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const sla = [7, 10, 14, 21].includes(data.slaDays) ? data.slaDays : 10;
    const companySlug = slugify(data.companyName) || "entreprise";
    const existing = await sql<{ id: number }>`select id from companies where slug = ${companySlug} limit 1`;
    let companyId = existing[0]?.id;
    if (!companyId) {
      const inserted = await sql<{ id: number }>`
        insert into companies (
          slug, name, tagline, about, industry, size_band, hq_city, hq_country,
          culture_score, hiring_velocity, values_json, response_sla_days,
          honor_score, honor_answered, honor_due
        ) values (
          ${companySlug}, ${data.companyName}, ${"Nouvelle entreprise sur Vera"},
          ${"Entreprise ajoutée par un recruteur sur Vera."}, ${"Autre"},
          ${"1–50"}, ${data.city}, ${data.country}, ${70}, ${"steady"}, ${"[]"},
          ${sla}, ${100}, ${0}, ${0}
        )
        returning id
      `;
      companyId = inserted[0]!.id;
    }
    const baseSlug = slugify(`${data.title}-${companySlug}-${data.city}`) || `offre-${Date.now()}`;
    let slug = baseSlug;
    for (let i = 2; i < 20; i += 1) {
      const clash = await sql<{ n: number }>`select count(*)::int as n from jobs where slug = ${slug}`;
      if ((clash[0]?.n ?? 0) === 0) break;
      slug = `${baseSlug}-${i}`;
    }
    const location = `${data.city}, ${data.country}`;
    const steps = processForJob({ seniority: data.seniority, contract: data.contract });
    const hours = hoursOf(steps);
    const decision = decisionDaysFor({ seniority: data.seniority, contract: data.contract });
    const extra: FieldDef[] = [];
    for (const custom of data.customFields ?? []) {
      if (!custom?.label?.trim()) continue;
      extra.push({
        id: slugify(custom.label) || `critere-${extra.length + 1}`,
        label: custom.label.trim(),
        kind: custom.kind,
        weight: custom.weight && custom.weight > 0 ? Math.min(40, Math.round(custom.weight)) : 18,
        hint: custom.hint?.trim() || "Critère entreprise, public.",
        options: custom.kind === "choice" ? (custom.options ?? []).filter(Boolean) : undefined,
        min: custom.kind === "scale" ? 1 : undefined,
        max: custom.kind === "scale" ? 5 : undefined,
      });
    }
    const gridJson = JSON.stringify({ family: data.family || undefined, extra });
    await sql.query(`alter table jobs add column if not exists grid_json text not null default '{}'`);
    await sql`
      insert into jobs (
        company_id, slug, title, team, location, city, country, remote_type,
        contract, seniority, salary_min, salary_max, currency, equity, description,
        responsibilities_json, requirements_json, nice_json, benefits_json,
        skills_json, posted_at, ghost_risk, created_by,
        process_json, process_hours, decision_days, grid_json, pool
      ) values (
        ${companyId}, ${slug}, ${data.title}, ${data.team}, ${location}, ${data.city},
        ${data.country}, ${data.remoteType}, ${data.contract}, ${data.seniority},
        ${data.salaryMin}, ${data.salaryMax}, ${"EUR"}, ${false}, ${data.description},
        ${"[]"}, ${"[]"}, ${"[]"}, ${"[]"}, ${JSON.stringify(data.skills)},
        now(), ${"low"}, ${context.userId},
        ${JSON.stringify(steps)}, ${hours}, ${decision}, ${gridJson}, ${data.pool || null}
      )
    `;
    return { ok: true as const, slug };
  });
