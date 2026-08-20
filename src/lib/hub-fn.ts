import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { getSql } from "./db";
import { isOperator } from "./ops-fn";
import { ensureSeeded } from "./seed";

export type HubCategory = {
  id: number;
  slug: string;
  title: string;
  kicker: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
  articleCount: number;
  fields: HubField[];
};

export type HubField = {
  id: number;
  key: string;
  label: string;
  type: string;
  options: string[];
  required: boolean;
};

export type HubArticleList = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  catSlug: string;
  catTitle: string;
  authorName: string;
  authorRole: string;
  proofScore: number;
  minutes: number;
  skillTags: string[];
  replyCount: number;
};

export type HubArticle = HubArticleList & {
  body: string;
  fields: Record<string, string>;
  jobSlugs: string[];
  published: boolean;
  updatedAt: string;
  replies: { id: number; authorName: string; authorRole: string; body: string; createdAt: string }[];
};

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  try {
    return JSON.parse(raw ?? "") as T;
  } catch {
    return fallback;
  }
}

export const listHubCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  await ensureSeeded(sql);
  const rows = await sql<{
    id: number;
    slug: string;
    title: string;
    kicker: string;
    description: string;
    seo_title: string | null;
    seo_description: string | null;
    n: number;
  }>`
    select c.id, c.slug, c.title, c.kicker, c.description, c.seo_title, c.seo_description,
           count(a.id)::int as n
    from knowledge_categories c
    left join knowledge_articles a on a.category_id = c.id and a.published = true
    group by c.id
    order by c.sort_order, c.title
  `;
  const fields = await sql<{
    id: number;
    category_id: number;
    field_key: string;
    label: string;
    field_type: string;
    options_json: string;
    required: boolean;
  }>`
    select id, category_id, field_key, label, field_type, options_json, required
    from knowledge_fields
    order by sort_order, id
  `;
  const byCat = new Map<number, HubField[]>();
  for (const f of fields) {
    const list = byCat.get(f.category_id) ?? [];
    list.push({
      id: f.id,
      key: f.field_key,
      label: f.label,
      type: f.field_type,
      options: parseJson<string[]>(f.options_json, []),
      required: f.required,
    });
    byCat.set(f.category_id, list);
  }
  return rows.map(
    (r): HubCategory => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      kicker: r.kicker,
      description: r.description,
      seoTitle: r.seo_title,
      seoDescription: r.seo_description,
      articleCount: r.n,
      fields: byCat.get(r.id) ?? [],
    }),
  );
});

export const listHubArticles = createServerFn({ method: "GET" })
  .validator((input: { cat?: string; skill?: string } = {}) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<{
      id: number;
      slug: string;
      title: string;
      excerpt: string;
      cat_slug: string;
      cat_title: string;
      author_name: string;
      author_role: string;
      proof_score: number;
      minutes: number;
      skill_tags_json: string;
      replies: number;
    }>`
      select a.id, a.slug, a.title, a.excerpt, c.slug as cat_slug, c.title as cat_title,
             a.author_name, a.author_role, a.proof_score, a.minutes, a.skill_tags_json,
             (select count(*)::int from knowledge_replies r where r.article_id = a.id) as replies
      from knowledge_articles a
      join knowledge_categories c on c.id = a.category_id
      where a.published = true
      order by a.proof_score desc, a.updated_at desc
    `;
    return rows
      .map(
        (r): HubArticleList => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          excerpt: r.excerpt,
          catSlug: r.cat_slug,
          catTitle: r.cat_title,
          authorName: r.author_name,
          authorRole: r.author_role,
          proofScore: r.proof_score,
          minutes: r.minutes,
          skillTags: parseJson<string[]>(r.skill_tags_json, []),
          replyCount: r.replies,
        }),
      )
      .filter((a) => {
        if (data.cat && a.catSlug !== data.cat) return false;
        if (data.skill) {
          const s = data.skill.toLowerCase();
          if (!a.skillTags.some((t) => t.toLowerCase().includes(s) || s.includes(t.toLowerCase()))) return false;
        }
        return true;
      });
  });

export const getHubArticle = createServerFn({ method: "GET" })
  .validator((input: { cat: string; slug: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<{
      id: number;
      slug: string;
      title: string;
      excerpt: string;
      body: string;
      cat_slug: string;
      cat_title: string;
      author_name: string;
      author_role: string;
      proof_score: number;
      minutes: number;
      skill_tags_json: string;
      job_slugs_json: string;
      fields_json: string;
      published: boolean;
      updated_at: string;
    }>`
      select a.id, a.slug, a.title, a.excerpt, a.body, c.slug as cat_slug, c.title as cat_title,
             a.author_name, a.author_role, a.proof_score, a.minutes, a.skill_tags_json,
             a.job_slugs_json, a.fields_json, a.published, a.updated_at
      from knowledge_articles a
      join knowledge_categories c on c.id = a.category_id
      where a.slug = ${data.slug} and c.slug = ${data.cat}
      limit 1
    `;
    const r = rows[0];
    if (!r || !r.published) return null;
    const replies = await sql<{
      id: number;
      author_name: string;
      author_role: string;
      body: string;
      created_at: string;
    }>`
      select id, author_name, author_role, body, created_at
      from knowledge_replies
      where article_id = ${r.id}
      order by created_at asc
    `;
    const article: HubArticle = {
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      catSlug: r.cat_slug,
      catTitle: r.cat_title,
      authorName: r.author_name,
      authorRole: r.author_role,
      proofScore: r.proof_score,
      minutes: r.minutes,
      skillTags: parseJson<string[]>(r.skill_tags_json, []),
      replyCount: replies.length,
      body: r.body,
      fields: parseJson<Record<string, string>>(r.fields_json, {}),
      jobSlugs: parseJson<string[]>(r.job_slugs_json, []),
      published: r.published,
      updatedAt: String(r.updated_at),
      replies: replies.map((x) => ({
        id: x.id,
        authorName: x.author_name,
        authorRole: x.author_role,
        body: x.body,
        createdAt: String(x.created_at),
      })),
    };
    return article;
  });

export const preformForJob = createServerFn({ method: "GET" })
  .validator((input: { skills: string[]; have?: string[] }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<{
      slug: string;
      title: string;
      excerpt: string;
      cat_slug: string;
      minutes: number;
      proof_score: number;
      skill_tags_json: string;
    }>`
      select a.slug, a.title, a.excerpt, c.slug as cat_slug, a.minutes, a.proof_score, a.skill_tags_json
      from knowledge_articles a
      join knowledge_categories c on c.id = a.category_id
      where a.published = true
    `;
    const have = new Set((data.have ?? []).map((s) => s.toLowerCase()));
    const missing = data.skills.filter((s) => !have.has(s.toLowerCase()));
    const needles = (missing.length ? missing : data.skills).map((s) => s.toLowerCase());
    const path = rows
      .map((r) => ({
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        catSlug: r.cat_slug,
        minutes: r.minutes,
        proofScore: r.proof_score,
        skillTags: parseJson<string[]>(r.skill_tags_json, []),
      }))
      .filter((a) =>
        a.skillTags.some((t) =>
          needles.some((n) => t.toLowerCase().includes(n) || n.includes(t.toLowerCase())),
        ),
      )
      .slice(0, 4);
    return { missing, path, totalMinutes: path.reduce((s, p) => s + p.minutes, 0) };
  });

export const addHubReply = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { articleId: number; body: string }) => input)
  .handler(async ({ context, data }) => {
    const body = data.body.trim().slice(0, 2000);
    if (body.length < 8) return { ok: false as const, error: "Écrivez au moins une phrase." };
    const sql = await getSql();
    await ensureSeeded(sql);
    const profile = await sql<{ role: string | null }>`
      select role from profiles where user_id = ${context.userId} limit 1
    `;
    const name = `Membre ${context.userId.slice(0, 6)}`;
    await sql`
      insert into knowledge_replies (article_id, user_id, author_name, author_role, body)
      values (${data.articleId}, ${context.userId}, ${name}, ${profile[0]?.role ?? "candidate"}, ${body})
    `;
    return { ok: true as const };
  });

export const adminCreateCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { slug: string; title: string; kicker: string; description: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    if (!(await isOperator(sql, context.userId))) return { ok: false as const, error: "Opérateur seulement" };
    const slug = data.slug
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!slug || !data.title.trim()) return { ok: false as const, error: "Slug et titre requis" };
    await sql`
      insert into knowledge_categories (slug, title, kicker, description, seo_title, seo_description)
      values (
        ${slug}, ${data.title.trim()}, ${data.kicker.trim() || "Savoirs"},
        ${data.description.trim()}, ${data.title.trim()}, ${data.description.trim().slice(0, 170)}
      )
      on conflict (slug) do update set title = excluded.title, description = excluded.description
    `;
    return { ok: true as const, slug };
  });

export const adminCreateField = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { categoryId: number; key: string; label: string; type: string; options: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    if (!(await isOperator(sql, context.userId))) return { ok: false as const, error: "Opérateur seulement" };
    const key = data.key
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_|_$/g, "");
    const options = data.options
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await sql`
      insert into knowledge_fields (category_id, field_key, label, field_type, options_json)
      values (${data.categoryId}, ${key}, ${data.label.trim()}, ${data.type || "text"}, ${JSON.stringify(options)})
      on conflict (category_id, field_key) do update set label = excluded.label, field_type = excluded.field_type, options_json = excluded.options_json
    `;
    return { ok: true as const };
  });

export const adminCreateArticle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      categoryId: number;
      slug: string;
      title: string;
      excerpt: string;
      body: string;
      skills: string;
      minutes: number;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    if (!(await isOperator(sql, context.userId))) return { ok: false as const, error: "Opérateur seulement" };
    const slug = data.slug
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "");
    const skills = data.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const name = `Opérateur ${context.userId.slice(0, 6)}`;
    await sql`
      insert into knowledge_articles (
        slug, category_id, title, excerpt, body, skill_tags_json, author_role, author_name, minutes, proof_score
      ) values (
        ${slug}, ${data.categoryId}, ${data.title.trim()}, ${data.excerpt.trim()},
        ${data.body.trim()}, ${JSON.stringify(skills)}, ${"operator"}, ${name},
        ${Math.max(3, Math.min(40, data.minutes || 8))}, ${70}
      )
      on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, body = excluded.body
    `;
    return { ok: true as const, slug };
  });

export const adminListArticles = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    if (!(await isOperator(sql, context.userId))) return [];
    return sql<{ id: number; slug: string; title: string; published: boolean; cat: string }>`
      select a.id, a.slug, a.title, a.published, c.title as cat
      from knowledge_articles a
      join knowledge_categories c on c.id = a.category_id
      order by a.updated_at desc
    `;
  });

export const adminToggleArticle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; published: boolean }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!(await isOperator(sql, context.userId))) return { ok: false as const };
    await sql`update knowledge_articles set published = ${data.published} where id = ${data.id}`;
    return { ok: true as const };
  });
