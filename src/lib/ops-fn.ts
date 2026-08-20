import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { barrierFit, type TryBuy } from "./barriers";
import { getSql } from "./db";
import { lessonsForMisses } from "./lessons";
import { ppqcPrice, isQualified } from "./ppqc";
import { ensureSeeded } from "./seed";

export type AppRole = "candidate" | "house" | "operator";

export async function isOperator(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
): Promise<boolean> {
  const rows = await sql<{ role: string | null }>`
    select role from profiles where user_id = ${userId} limit 1
  `;
  return rows[0]?.role === "operator";
}

export const OPERATOR_PHRASE = "lhonneur-est-public";

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<{ role: string; house_slug: string | null }>`
      select role, house_slug from profiles where user_id = ${context.userId} limit 1
    `;
    return {
      role: (rows[0]?.role ?? "candidate") as AppRole,
      houseSlug: rows[0]?.house_slug ?? null,
    };
  });

export const claimRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { role: AppRole; houseSlug?: string | null; phrase?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    if (data.role === "operator") {
      const phrase = (data.phrase ?? "").toLowerCase().replace(/[^a-z]/g, "");
      if (phrase !== OPERATOR_PHRASE) return { ok: false as const, error: "Phrase d’opérateur incorrecte." };
    }
    await sql`
      insert into profiles (user_id, skills_json, languages_json, role_targets_json, role, house_slug)
      values (${context.userId}, ${"[]"}, ${"[]"}, ${"[]"}, ${data.role}, ${data.houseSlug ?? null})
      on conflict (user_id) do update set
        role = excluded.role,
        house_slug = coalesce(excluded.house_slug, profiles.house_slug)
    `;
    return { ok: true as const };
  });

export const saveBarriers = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((ids: string[]) => ids)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    await sql`
      insert into profiles (user_id, skills_json, languages_json, role_targets_json, barriers_json)
      values (${context.userId}, ${"[]"}, ${"[]"}, ${"[]"}, ${JSON.stringify(data)})
      on conflict (user_id) do update set barriers_json = excluded.barriers_json
    `;
    return { ok: true as const };
  });

export type SlotRow = {
  id: number;
  jobId: number;
  jobSlug: string;
  title: string;
  company: string;
  weekday: number;
  startHour: number;
  hours: number;
  city: string;
  seats: number;
  taken: number;
  mine: boolean;
};

export const listOpenSlots = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  await ensureSeeded(sql);
  const rows = await sql<{
    id: number;
    job_id: number;
    job_slug: string;
    title: string;
    company: string;
    weekday: number;
    start_hour: number;
    hours: number;
    city: string;
    seats: number;
    taken: number;
  }>`
    select s.id, s.job_id, j.slug as job_slug, j.title, c.name as company,
           s.weekday, s.start_hour, s.hours, s.city, s.seats,
           (select count(*)::int from slot_claims sc where sc.slot_id = s.id and sc.status = 'held') as taken
    from slots s
    join jobs j on j.id = s.job_id
    join companies c on c.id = j.company_id
    order by s.weekday, s.start_hour, c.name
  `;
  return rows.map((r) => ({
    id: r.id,
    jobId: r.job_id,
    jobSlug: r.job_slug,
    title: r.title,
    company: r.company,
    weekday: r.weekday,
    startHour: r.start_hour,
    hours: r.hours,
    city: r.city,
    seats: r.seats,
    taken: r.taken,
    mine: false,
  }));
});

export const listMySlots = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<SlotRow[]> => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<{
      id: number;
      job_id: number;
      job_slug: string;
      title: string;
      company: string;
      weekday: number;
      start_hour: number;
      hours: number;
      city: string;
      seats: number;
      taken: number;
    }>`
    select s.id, s.job_id, j.slug as job_slug, j.title, c.name as company,
           s.weekday, s.start_hour, s.hours, s.city, s.seats,
           (select count(*)::int from slot_claims sc where sc.slot_id = s.id and sc.status = 'held') as taken
    from slots s
    join jobs j on j.id = s.job_id
    join companies c on c.id = j.company_id
    order by s.weekday, s.start_hour
  `;
    const mine = await sql<{ slot_id: number }>`
      select slot_id from slot_claims where user_id = ${context.userId} and status = 'held'
    `;
    const set = new Set(mine.map((m) => m.slot_id));
    return rows.map((r) => ({
      id: r.id,
      jobId: r.job_id,
      jobSlug: r.job_slug,
      title: r.title,
      company: r.company,
      weekday: r.weekday,
      startHour: r.start_hour,
      hours: r.hours,
      city: r.city,
      seats: r.seats,
      taken: r.taken,
      mine: set.has(r.id),
    }));
  });

export const claimSlot = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((slotId: number) => slotId)
  .handler(async ({ context, data: slotId }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const slot = await sql<{ weekday: number; seats: number; taken: number }>`
      select s.weekday, s.seats,
        (select count(*)::int from slot_claims sc where sc.slot_id = s.id and sc.status = 'held') as taken
      from slots s where s.id = ${slotId} limit 1
    `;
    if (!slot[0]) return { ok: false as const, error: "Créneau introuvable" };
    if (slot[0].taken >= slot[0].seats) return { ok: false as const, error: "Complet" };
    const clash = await sql<{ n: number }>`
      select count(*)::int as n
      from slot_claims sc
      join slots s on s.id = sc.slot_id
      where sc.user_id = ${context.userId} and sc.status = 'held' and s.weekday = ${slot[0].weekday}
    `;
    if ((clash[0]?.n ?? 0) > 0) return { ok: false as const, error: "Vous tenez déjà ce jour — deux maisons, deux jours." };
    await sql`
      insert into slot_claims (user_id, slot_id, status) values (${context.userId}, ${slotId}, ${"held"})
      on conflict (user_id, slot_id) do update set status = ${"held"}
    `;
    return { ok: true as const };
  });

export const releaseSlot = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((slotId: number) => slotId)
  .handler(async ({ context, data: slotId }) => {
    const sql = await getSql();
    await sql`delete from slot_claims where user_id = ${context.userId} and slot_id = ${slotId}`;
    return { ok: true as const };
  });

export const uploadProof = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { fileName: string; mime: string; bodyB64: string; articleId?: number | null }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const raw = data.bodyB64.replace(/^data:[^;]+;base64,/, "");
    if (raw.length > 1_600_000) return { ok: false as const, error: "Fichier trop lourd (max ~1,2 Mo)." };
    const mime = data.mime.slice(0, 80);
    if (!/^(application\/pdf|image\/(png|jpeg|webp)|text\/plain)/.test(mime)) {
      return { ok: false as const, error: "PDF, PNG, JPEG, WebP ou texte." };
    }
    const rows = await sql<{ id: number }>`
      insert into proof_files (user_id, article_id, file_name, mime, body_b64, byte_size)
      values (${context.userId}, ${data.articleId ?? null}, ${data.fileName.slice(0, 180)}, ${mime}, ${raw}, ${Math.ceil(raw.length * 0.75)})
      returning id
    `;
    return { ok: true as const, id: rows[0]!.id };
  });

export const getProofMeta = createServerFn({ method: "POST" })
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<{ id: number; file_name: string; mime: string; body_b64: string }>`
      select id, file_name, mime, body_b64 from proof_files where id = ${id} limit 1
    `;
    return rows[0] ?? null;
  });

export type InvoiceRow = {
  id: number;
  euros: number;
  status: string;
  createdAt: string;
  title: string;
  company: string;
  jobSlug: string;
};

export const listMyInvoices = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<InvoiceRow[]> => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const me = await sql<{ role: string; house_slug: string | null }>`
      select role, house_slug from profiles where user_id = ${context.userId} limit 1
    `;
    const role = me[0]?.role ?? "candidate";
    const house = me[0]?.house_slug;
    if (role === "operator") {
      const rows = await sql<{
        id: number;
        euros: number;
        status: string;
        created_at: string;
        title: string;
        company: string;
        job_slug: string;
      }>`
        select i.id, i.euros, i.status, i.created_at, j.title, c.name as company, j.slug as job_slug
        from ppqc_invoices i
        join jobs j on j.id = i.job_id
        join companies c on c.id = i.company_id
        order by i.created_at desc
        limit 80
      `;
      return rows.map(mapInv);
    }
    const rows = await sql<{
      id: number;
      euros: number;
      status: string;
      created_at: string;
      title: string;
      company: string;
      job_slug: string;
    }>`
      select i.id, i.euros, i.status, i.created_at, j.title, c.name as company, j.slug as job_slug
      from ppqc_invoices i
      join jobs j on j.id = i.job_id
      join companies c on c.id = i.company_id
      where j.created_by = ${context.userId} or (${house}::text is not null and c.slug = ${house})
      order by i.created_at desc
      limit 80
    `;
    return rows.map(mapInv);
  });

function mapInv(r: {
  id: number;
  euros: number;
  status: string;
  created_at: string;
  title: string;
  company: string;
  job_slug: string;
}): InvoiceRow {
  return {
    id: r.id,
    euros: r.euros,
    status: r.status,
    createdAt: String(r.created_at),
    title: r.title,
    company: r.company,
    jobSlug: r.job_slug,
  };
}

export const payInvoice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const me = await sql<{ role: string; house_slug: string | null }>`
      select role, house_slug from profiles where user_id = ${context.userId} limit 1
    `;
    const role = me[0]?.role ?? "candidate";
    if (role !== "house" && role !== "operator") return { ok: false as const };
    await sql`update ppqc_invoices set status = ${"paid"}, paid_at = now() where id = ${id}`;
    return { ok: true as const };
  });

export const houseSetStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; status: "review" | "interview" | "offer" | "rejected"; reasons?: string[]; note?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const me = await sql<{ role: string; house_slug: string | null }>`
      select role, house_slug from profiles where user_id = ${context.userId} limit 1
    `;
    const role = me[0]?.role ?? "candidate";
    const house = me[0]?.house_slug;
    const app = await sql<{
      id: number;
      job_id: number;
      company_id: number;
      created_by: string | null;
      company_slug: string;
      trial_score: number | null;
      fit_score: number | null;
      miss_json: string | null;
    }>`
      select a.id, a.job_id, j.company_id, j.created_by, c.slug as company_slug,
             a.trial_score, a.fit_score, a.miss_json
      from applications a
      join jobs j on j.id = a.job_id
      join companies c on c.id = j.company_id
      where a.id = ${data.id}
      limit 1
    `;
    const row = app[0];
    if (!row) return { ok: false as const };
    const allowed =
      role === "operator" ||
      row.created_by === context.userId ||
      (house != null && house === row.company_slug);
    if (!allowed) return { ok: false as const };
    let feedback: string | null = null;
    if (data.status === "rejected") {
      const misses: string[] = [];
      try {
        const v = JSON.parse(row.miss_json ?? "[]") as unknown;
        if (Array.isArray(v)) misses.push(...v.map(String));
      } catch {
        /* ignore */
      }
      const lessons = lessonsForMisses(misses, data.reasons ?? []);
      feedback = JSON.stringify({
        reasons: data.reasons ?? [],
        note: data.note ?? "",
        trialScore: row.trial_score,
        fitScore: row.fit_score,
        lessons: lessons.map((l) => l.slug),
        text:
          data.note?.trim() ||
          "Non retenu. Le geste ou la grille n’a pas tenu. Voici le diagnostic et trois modules, pas un silence.",
      });
    }
    await sql`
      update applications
      set status = ${data.status},
          answered_at = coalesce(answered_at, now()),
          feedback_json = coalesce(${feedback}, feedback_json),
          updated_at = now()
      where id = ${data.id}
    `;
    return { ok: true as const };
  });

export const markLessonDone = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((slug: string) => slug)
  .handler(async ({ context, data: slug }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    await sql`
      insert into lessons_done (user_id, lesson_slug) values (${context.userId}, ${slug})
      on conflict do nothing
    `;
    return { ok: true as const };
  });

export const listMyLessonsDone = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<{ lesson_slug: string }>`
      select lesson_slug from lessons_done where user_id = ${context.userId}
    `;
    return rows.map((r) => r.lesson_slug);
  });

export function barrierScore(need: string[], cover: string[]): number {
  return barrierFit(need, cover).score;
}

export async function maybeInvoice(
  sql: Awaited<ReturnType<typeof getSql>>,
  input: {
    applicationId: number;
    jobId: number;
    companyId: number;
    trial: number | null;
    fit: number | null;
    city: string;
    seniority: string;
    title: string;
  },
): Promise<void> {
  if (!isQualified({ trialScore: input.trial, fitScore: input.fit })) return;
  const price = ppqcPrice({ city: input.city, seniority: input.seniority, title: input.title });
  await sql`
    insert into ppqc_invoices (application_id, company_id, job_id, euros, status)
    values (${input.applicationId}, ${input.companyId}, ${input.jobId}, ${price.euros}, ${"due"})
    on conflict do nothing
  `;
}

export type { TryBuy };
