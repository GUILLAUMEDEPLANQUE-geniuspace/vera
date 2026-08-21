import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { seedCck } from "./cck-seed";
import { machineFromSteps, type EpreuveKind } from "./cck-sim";
import { getSql } from "./db";
import { parseOffer } from "./offer";
import { packForJob } from "./offer-data";
import { ensureSeeded } from "./seed";
import { simForJob } from "./sims";
import type { Seniority } from "./types";

export type EpreuveDraft = {
  jobId: number;
  epreuve: boolean;
  kind: EpreuveKind;
  brief: string;
  symptom: string;
  steps: string;
  trap: string;
  mediaUrl: string;
};

async function ready() {
  const sql = await getSql();
  await ensureSeeded(sql);
  await seedCck(sql);
  return sql;
}

async function writeCck(
  sql: Awaited<ReturnType<typeof getSql>>,
  entity: string,
  entityId: number,
  values: Record<string, string | boolean | number>,
) {
  for (const [name, raw] of Object.entries(values)) {
    const fields = await sql<{ id: number }>`
      select f.id from cck_fields f
      join cck_types t on t.id = f.type_id
      where f.name = ${name} and t.entity = ${entity}
      order by case when f.company_id is null then 1 else 0 end
      limit 1
    `;
    const f = fields[0];
    if (!f) continue;
    await sql`
      insert into cck_values (field_id, entity_kind, entity_id, value_json)
      values (${f.id}, ${entity}, ${entityId}, ${JSON.stringify(raw)})
      on conflict (field_id, entity_kind, entity_id) do update set value_json = excluded.value_json
    `;
  }
}

export const saveJobEpreuve = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: EpreuveDraft) => input)
  .handler(async ({ context, data }) => {
    const sql = await ready();
    const profile = await sql<{ role: string; house_slug: string | null }>`
      select role, house_slug from profiles where user_id = ${context.userId} limit 1
    `;
    const slug = profile[0]?.house_slug;
    if (!slug || profile[0]?.role !== "house") return { ok: false as const, error: "Espace recruteur requis." };
    const jobs = await sql<{
      id: number;
      slug: string;
      title: string;
      city: string;
      collection: string | null;
      offer_json: string;
      company_slug: string;
      seniority: string;
      salary_min: number | null;
      salary_max: number | null;
      remote_type: string;
      benefits_json: string;
      skills_json: string;
      country: string;
    }>`
      select j.id, j.slug, j.title, j.city, j.collection, j.offer_json,
        c.slug as company_slug, j.seniority, j.salary_min, j.salary_max, j.remote_type,
        j.benefits_json, j.skills_json, j.country
      from jobs j
      join companies c on c.id = j.company_id
      where j.id = ${data.jobId} and c.slug = ${slug}
      limit 1
    `;
    const job = jobs[0];
    if (!job) return { ok: false as const, error: "Offre introuvable pour cette maison." };

    await writeCck(sql, "job", job.id, {
      epreuve: data.epreuve,
      epreuve_kind: data.kind,
      epreuve_brief: data.brief,
      epreuve_symptom: data.symptom,
      epreuve_steps: data.steps,
      epreuve_trap: data.trap,
      visite_video: data.mediaUrl,
      video: data.mediaUrl,
    });

    if (data.epreuve) {
      const base =
        parseOffer(job.offer_json) ??
        packForJob({
          slug: job.slug,
          title: job.title,
          city: job.city,
          country: job.country,
          seniority: job.seniority as Seniority,
          salaryMin: job.salary_min ?? 0,
          salaryMax: job.salary_max ?? 0,
          remoteType: job.remote_type as "remote" | "hybrid" | "onsite",
          collection: job.collection ?? "",
          companySlug: job.company_slug,
          skills: [],
          benefits: [],
          industry: "",
        });
      const template = simForJob({
        title: job.title,
        collection: job.collection,
        city: job.city,
        slug: job.slug,
      });
      const sim =
        data.kind === "machine"
          ? machineFromSteps(data.brief, data.symptom, data.steps, data.trap)
          : { ...template, brief: data.brief || template.brief };
      const next = { ...base, sim };
      if (data.mediaUrl && next.workplace) {
        next.workplace = { ...next.workplace, image: data.mediaUrl };
      }
      await sql`update jobs set offer_json = ${JSON.stringify(next)} where id = ${job.id}`;
    }

    void context.userId;
    return { ok: true as const, slug: job.slug };
  });
