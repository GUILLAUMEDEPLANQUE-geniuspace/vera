import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { seedCck } from "./cck-seed";
import { isCckKind, type CckKind } from "./cck-kinds";
import { getSql } from "./db";
import { parseJsonList } from "./format";
import { ensureSeeded } from "./seed";

export type { CckKind };

export type CckField = {
  id: number;
  typeSlug: string;
  name: string;
  label: string;
  kind: CckKind;
  options: string[];
  required: boolean;
  weight: number;
  onList: boolean;
  onCard: boolean;
  filterable: boolean;
  hint: string;
  house: boolean;
};

export type CckValue = {
  name: string;
  label: string;
  kind: CckKind;
  value: string;
  onCard: boolean;
  onList: boolean;
  filterable: boolean;
};

async function ready() {
  const sql = await getSql();
  await ensureSeeded(sql);
  await seedCck(sql);
  return sql;
}

function parseVal(raw: string): string {
  try {
    const v = JSON.parse(raw) as unknown;
    if (v == null) return "";
    if (Array.isArray(v)) return v.map(String).join(", ");
    if (typeof v === "boolean") return v ? "oui" : "non";
    return String(v);
  } catch {
    return raw;
  }
}

function mapKind(k: string): CckKind {
  return isCckKind(k) ? k : "text";
}

export const listCckFields = createServerFn({ method: "POST" })
  .validator((input: { type: string; companyId?: number | null }) => input)
  .handler(async ({ data }): Promise<CckField[]> => {
    const sql = await ready();
    const rows = await sql<{
      id: number;
      type_slug: string;
      name: string;
      label: string;
      kind: string;
      options_json: string;
      required: boolean;
      weight: number;
      on_list: boolean;
      on_card: boolean;
      filterable: boolean;
      hint: string;
      company_id: number | null;
    }>`
      select f.id, t.slug as type_slug, f.name, f.label, f.kind, f.options_json, f.required,
        f.weight, f.on_list, f.on_card, f.filterable, f.hint, f.company_id
      from cck_fields f
      join cck_types t on t.id = f.type_id
      where t.slug = ${data.type}
        and (f.company_id is null or f.company_id = ${data.companyId ?? 0})
      order by f.weight, f.id
    `;
    return rows.map((r) => ({
      id: r.id,
      typeSlug: r.type_slug,
      name: r.name,
      label: r.label,
      kind: mapKind(r.kind),
      options: parseJsonList(r.options_json),
      required: r.required,
      weight: r.weight,
      onList: r.on_list,
      onCard: r.on_card,
      filterable: r.filterable,
      hint: r.hint,
      house: r.company_id != null,
    }));
  });

export const listCckValues = createServerFn({ method: "POST" })
  .validator((input: { kind: string; id: number }) => input)
  .handler(async ({ data }): Promise<CckValue[]> => {
    const sql = await ready();
    const rows = await sql<{
      name: string;
      label: string;
      kind: string;
      value_json: string;
      on_card: boolean;
      on_list: boolean;
      filterable: boolean;
    }>`
      select f.name, f.label, f.kind, v.value_json, f.on_card, f.on_list, f.filterable
      from cck_values v
      join cck_fields f on f.id = v.field_id
      where v.entity_kind = ${data.kind} and v.entity_id = ${data.id}
      order by f.weight
    `;
    return rows.map((r) => ({
      name: r.name,
      label: r.label,
      kind: mapKind(r.kind),
      value: parseVal(r.value_json),
      onCard: r.on_card,
      onList: r.on_list,
      filterable: r.filterable,
    }));
  });

export const listCckValuesForCompany = createServerFn({ method: "POST" })
  .validator((input: { kind: string; companyId: number }) => input)
  .handler(async ({ data }): Promise<Record<number, CckValue[]>> => {
    const sql = await ready();
    let ids: number[] = [];
    if (data.kind === "job") {
      const rows = await sql<{ id: number }>`select id from jobs where company_id = ${data.companyId}`;
      ids = rows.map((r) => r.id);
    } else if (data.kind === "course") {
      const rows = await sql<{ id: number }>`select id from academy_courses where company_id = ${data.companyId}`;
      ids = rows.map((r) => r.id);
    } else if (data.kind === "article") {
      const rows = await sql<{ id: number }>`select id from articles where company_id = ${data.companyId}`;
      ids = rows.map((r) => r.id);
    }
    if (!ids.length) return {};
    const rows = await sql<{
      entity_id: number;
      name: string;
      label: string;
      kind: string;
      value_json: string;
      on_card: boolean;
      on_list: boolean;
      filterable: boolean;
    }>`
      select v.entity_id, f.name, f.label, f.kind, v.value_json, f.on_card, f.on_list, f.filterable
      from cck_values v
      join cck_fields f on f.id = v.field_id
      where v.entity_kind = ${data.kind} and v.entity_id = any(${ids})
      order by f.weight
    `;
    const out: Record<number, CckValue[]> = {};
    for (const r of rows) {
      (out[r.entity_id] ??= []).push({
        name: r.name,
        label: r.label,
        kind: mapKind(r.kind),
        value: parseVal(r.value_json),
        onCard: r.on_card,
        onList: r.on_list,
        filterable: r.filterable,
      });
    }
    return out;
  });

export const houseCck = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready();
    const profile = await sql<{ role: string; house_slug: string | null }>`
      select role, house_slug from profiles where user_id = ${context.userId} limit 1
    `;
    const slug = profile[0]?.house_slug;
    if (!slug || profile[0]?.role !== "house") return { ok: false as const, error: "Espace recruteur requis." };
    const houses = await sql<{ id: number; slug: string; name: string }>`
      select id, slug, name from companies where slug = ${slug} limit 1
    `;
    if (!houses[0]) return { ok: false as const, error: "Entreprise introuvable." };
    const types = await sql<{ slug: string; label: string; description: string }>`
      select slug, label, description from cck_types order by id
    `;
    const fields = await sql<{
      id: number;
      type_slug: string;
      name: string;
      label: string;
      kind: string;
      options_json: string;
      required: boolean;
      weight: number;
      on_list: boolean;
      on_card: boolean;
      filterable: boolean;
      hint: string;
      company_id: number | null;
    }>`
      select f.id, t.slug as type_slug, f.name, f.label, f.kind, f.options_json, f.required,
        f.weight, f.on_list, f.on_card, f.filterable, f.hint, f.company_id
      from cck_fields f
      join cck_types t on t.id = f.type_id
      where f.company_id is null or f.company_id = ${houses[0].id}
      order by t.id, f.weight
    `;
    const courses = await sql<{ id: number; slug: string; title: string }>`
      select id, slug, title from academy_courses
      where company_id = ${houses[0].id} and published
      order by sort_order, id
    `;
    const jobs = await sql<{ id: number; slug: string; title: string }>`
      select id, slug, title from jobs where company_id = ${houses[0].id} order by posted_at desc
    `;
    return {
      ok: true as const,
      house: houses[0],
      types,
      jobs,
      courses,
      fields: fields.map((r) => ({
        id: r.id,
        typeSlug: r.type_slug,
        name: r.name,
        label: r.label,
        kind: mapKind(r.kind),
        options: parseJsonList(r.options_json),
        required: r.required,
        weight: r.weight,
        onList: r.on_list,
        onCard: r.on_card,
        filterable: r.filterable,
        hint: r.hint,
        house: r.company_id != null,
      })),
    };
  });

export const houseAddCckField = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      type: string;
      name: string;
      label: string;
      kind: CckKind;
      options: string;
      hint: string;
      filterable: boolean;
      onCard: boolean;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await ready();
    if (!isCckKind(data.kind)) return { ok: false as const, error: "Kind inconnu." };
    const profile = await sql<{ role: string; house_slug: string | null }>`
      select role, house_slug from profiles where user_id = ${context.userId} limit 1
    `;
    const slug = profile[0]?.house_slug;
    if (!slug || profile[0]?.role !== "house") return { ok: false as const, error: "Espace recruteur requis." };
    const houses = await sql<{ id: number }>`select id from companies where slug = ${slug} limit 1`;
    if (!houses[0]) return { ok: false as const, error: "Entreprise introuvable." };
    const types = await sql<{ id: number }>`select id from cck_types where slug = ${data.type} limit 1`;
    if (!types[0]) return { ok: false as const, error: "Type inconnu." };
    const name = data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 40);
    if (name.length < 2) return { ok: false as const, error: "Nom technique trop court." };
    const label = data.label.trim();
    if (label.length < 2) return { ok: false as const, error: "Libellé trop court." };
    const options = data.options
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await sql`
        insert into cck_fields (
          type_id, company_id, name, label, kind, options_json, required, weight,
          on_list, on_card, filterable, hint
        ) values (
          ${types[0].id}, ${houses[0].id}, ${name}, ${label}, ${data.kind},
          ${JSON.stringify(options)}, ${false}, ${80}, ${data.filterable}, ${data.onCard},
          ${data.filterable}, ${data.hint.trim()}
        )
      `;
    } catch {
      return { ok: false as const, error: "Champ déjà existant." };
    }
    return { ok: true as const };
  });

export const saveCckValues = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind: string; id: number; values: Record<string, string> }) => input)
  .handler(async ({ context, data }) => {
    const sql = await ready();
    const profile = await sql<{ role: string; house_slug: string | null }>`
      select role, house_slug from profiles where user_id = ${context.userId} limit 1
    `;
    if (!profile[0]?.house_slug) return { ok: false as const, error: "Espace recruteur requis." };
    for (const [name, raw] of Object.entries(data.values)) {
      const fields = await sql<{ id: number }>`
        select f.id from cck_fields f
        join cck_types t on t.id = f.type_id
        where f.name = ${name} and t.entity = ${data.kind}
        order by case when f.company_id is null then 1 else 0 end
        limit 1
      `;
      const f = fields[0];
      if (!f) continue;
      await sql`
        insert into cck_values (field_id, entity_kind, entity_id, value_json)
        values (${f.id}, ${data.kind}, ${data.id}, ${JSON.stringify(raw)})
        on conflict (field_id, entity_kind, entity_id) do update set value_json = excluded.value_json
      `;
    }
    void context.userId;
    return { ok: true as const };
  });
