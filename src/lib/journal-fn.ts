import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { getSql } from "./db";
import { parseJsonList, slugify } from "./format";
import { isOperator } from "./ops-fn";
import { ensureSeeded } from "./seed";

export type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  kind: string;
  tags: string[];
  fileName: string | null;
  fileNote: string | null;
  authorKind: string;
  authorName: string;
  authorSlug: string;
  userId: string | null;
  companyId: number | null;
  published: boolean;
  createdAt: string;
};

type ArticleRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  kind: string;
  tags_json: string;
  file_name: string | null;
  file_note: string | null;
  author_kind: string;
  author_name: string;
  author_slug: string;
  user_id: string | null;
  company_id: number | null;
  published: boolean;
  created_at: string;
};

function mapArticle(r: ArticleRow): Article {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    kind: r.kind,
    tags: parseJsonList(r.tags_json),
    fileName: r.file_name,
    fileNote: r.file_note,
    authorKind: r.author_kind,
    authorName: r.author_name,
    authorSlug: r.author_slug,
    userId: r.user_id,
    companyId: r.company_id,
    published: Boolean(r.published),
    createdAt: String(r.created_at),
  };
}

export const listArticles = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  await ensureSeeded(sql);
  const rows = await sql<ArticleRow>`
    select * from articles where published = true order by created_at desc
  `;
  return rows.map(mapArticle);
});

export const listArticlesByAuthor = createServerFn({ method: "POST" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<ArticleRow>`
      select * from articles where published = true and author_slug = ${slug} order by created_at desc
    `;
    return rows.map(mapArticle);
  });

export const listArticlesByCompany = createServerFn({ method: "POST" })
  .validator((companyId: number) => companyId)
  .handler(async ({ data: companyId }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<ArticleRow>`
      select * from articles where published = true and company_id = ${companyId} order by created_at desc
    `;
    return rows.map(mapArticle);
  });

export const getArticle = createServerFn({ method: "POST" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<ArticleRow>`select * from articles where slug = ${slug} limit 1`;
    return rows[0] ? mapArticle(rows[0]) : null;
  });

export const listMyArticles = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<ArticleRow>`
      select * from articles where user_id = ${context.userId} order by created_at desc
    `;
    return rows.map(mapArticle);
  });

export type ArticleInput = {
  title: string;
  excerpt: string;
  body: string;
  kind: "article" | "note" | "fichier";
  tags: string[];
  fileName?: string;
  fileNote?: string;
  authorKind: "candidate" | "company";
  authorName: string;
  companyId?: number | null;
  published: boolean;
};

export const saveArticle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ArticleInput) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const base = slugify(data.title) || `note-${Date.now()}`;
    let slug = base;
    for (let i = 2; i < 20; i += 1) {
      const clash = await sql<{ n: number }>`select count(*)::int as n from articles where slug = ${slug}`;
      if ((clash[0]?.n ?? 0) === 0) break;
      slug = `${base}-${i}`;
    }
    const authorSlug = slugify(data.authorName) || context.userId.slice(0, 8);
    await sql`
      insert into articles (
        slug, title, excerpt, body, kind, tags_json, file_name, file_note,
        author_kind, author_name, author_slug, user_id, company_id, published
      ) values (
        ${slug}, ${data.title}, ${data.excerpt}, ${data.body}, ${data.kind},
        ${JSON.stringify(data.tags)}, ${data.fileName ?? null}, ${data.fileNote ?? null},
        ${data.authorKind}, ${data.authorName}, ${authorSlug}, ${context.userId},
        ${data.companyId ?? null}, ${data.published}
      )
    `;
    return { ok: true as const, slug };
  });

export const listAllArticlesAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    if (!(await isOperator(sql, context.userId))) return [];
    const rows = await sql<ArticleRow>`select * from articles order by created_at desc`;
    return rows.map(mapArticle);
  });

export const setArticlePublished = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; published: boolean }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!(await isOperator(sql, context.userId))) return { ok: false as const };
    await sql`update articles set published = ${data.published}, updated_at = now() where id = ${data.id}`;
    return { ok: true as const };
  });

export const listMyBadges = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    return sql<{ id: number; family: string; label: string; score: number; created_at: string }>`
      select id, family, label, score, created_at from aptitude_badges
      where user_id = ${context.userId} order by created_at desc
    `;
  });
