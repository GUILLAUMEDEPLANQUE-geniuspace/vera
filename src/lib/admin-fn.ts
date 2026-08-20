import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { getSql } from "./db";
import { JOB_SELECT, mapJob, type JobRow } from "./mappers";
import { isOperator } from "./ops-fn";
import { isQualified } from "./ppqc";
import { ensureSeeded } from "./seed";

export const adminPulse = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    if (!(await isOperator(sql, context.userId))) {
      return { gated: true as const, jobs: 0, companies: 0, applications: 0, articles: 0, qualified: 0, invoicesDue: 0, invoicesPaid: 0 };
    }
    const jobs = await sql<{ n: number }>`select count(*)::int as n from jobs`;
    const companies = await sql<{ n: number }>`select count(*)::int as n from companies`;
    const apps = await sql<{ n: number }>`select count(*)::int as n from applications`;
    const articles = await sql<{ n: number }>`select count(*)::int as n from articles`;
    const qualified = await sql<{ trial_score: number | null; fit_score: number | null }>`
      select trial_score, fit_score from applications
    `;
    const inv = await sql<{ status: string; n: number }>`
      select status, count(*)::int as n from ppqc_invoices group by status
    `;
    const qn = qualified.filter((r) => isQualified({ trialScore: r.trial_score, fitScore: r.fit_score })).length;
    return {
      gated: false as const,
      jobs: jobs[0]?.n ?? 0,
      companies: companies[0]?.n ?? 0,
      applications: apps[0]?.n ?? 0,
      articles: articles[0]?.n ?? 0,
      qualified: qn,
      invoicesDue: inv.find((r) => r.status === "due")?.n ?? 0,
      invoicesPaid: inv.find((r) => r.status === "paid")?.n ?? 0,
    };
  });

export const adminPipeline = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    if (!(await isOperator(sql, context.userId))) return [];
    const rows = await sql<{
      id: number;
      user_id: string;
      status: string;
      trial_score: number | null;
      fit_score: number | null;
      created_at: string;
      title: string;
      job_slug: string;
      company: string;
    }>`
      select a.id, a.user_id, a.status, a.trial_score, a.fit_score, a.created_at,
             j.title, j.slug as job_slug, c.name as company
      from applications a
      join jobs j on j.id = a.job_id
      join companies c on c.id = j.company_id
      order by a.created_at desc
      limit 40
    `;
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id.slice(0, 8),
      status: r.status,
      trialScore: r.trial_score,
      fitScore: r.fit_score,
      createdAt: String(r.created_at),
      title: r.title,
      jobSlug: r.job_slug,
      company: r.company,
      qualified: isQualified({ trialScore: r.trial_score, fitScore: r.fit_score }),
    }));
  });

export const myPostedJobs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const me = await sql<{ house_slug: string | null }>`select house_slug from profiles where user_id = ${context.userId} limit 1`;
    const house = me[0]?.house_slug ?? null;
    const rows = await sql.query<JobRow>(
      `select ${JOB_SELECT}
       from jobs j join companies c on c.id = j.company_id
       where j.created_by = $1 or ($2::text is not null and c.slug = $2)
       order by j.posted_at desc`,
      [context.userId, house],
    );
    return rows.map((r) => mapJob(r, null));
  });

export const myHouseApplicants = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const me = await sql<{ house_slug: string | null; role: string | null }>`
      select house_slug, role from profiles where user_id = ${context.userId} limit 1
    `;
    const house = me[0]?.house_slug ?? null;
    const operator = me[0]?.role === "operator";
    return sql<{
      id: number;
      status: string;
      trial_score: number | null;
      fit_score: number | null;
      title: string;
      job_slug: string;
      created_at: string;
      user_id: string;
    }>`
      select a.id, a.status, a.trial_score, a.fit_score, j.title, j.slug as job_slug, a.created_at, a.user_id
      from applications a
      join jobs j on j.id = a.job_id
      join companies c on c.id = j.company_id
      where ${operator} or j.created_by = ${context.userId} or (${house}::text is not null and c.slug = ${house})
      order by a.created_at desc
      limit 80
    `;
  });
