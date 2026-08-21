import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { getSql } from "./db";
import { seedDriveMedia } from "./drive-seed";
import { isOperator } from "./ops-fn";
import { ensureSeeded } from "./seed";

export type DriveAsset = {
  id: number;
  title: string;
  slug: string;
  filename: string;
  mime: string;
  assetType: string;
  chunkSize: number;
  byteSize: number;
  sourceUrl: string | null;
  entityType: string | null;
  entityKey: string | null;
  transcript: string | null;
  chunkCount: number;
  folderId: number | null;
  companyId: number | null;
};

export type DriveFolder = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  count: number;
};

async function ready() {
  const sql = await getSql();
  await ensureSeeded(sql);
  await seedDriveMedia(sql);
  return sql;
}

function mapAsset(r: {
  id: number;
  title: string;
  slug: string;
  filename: string;
  mime: string;
  asset_type: string;
  chunk_size: number;
  byte_size: number;
  source_url: string | null;
  entity_type: string | null;
  entity_key: string | null;
  transcript: string | null;
  n: number;
  folder_id?: number | null;
  company_id?: number | null;
}): DriveAsset {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    filename: r.filename,
    mime: r.mime,
    assetType: r.asset_type,
    chunkSize: r.chunk_size,
    byteSize: r.byte_size,
    sourceUrl: r.source_url,
    entityType: r.entity_type,
    entityKey: r.entity_key,
    transcript: r.transcript,
    chunkCount: r.n,
    folderId: r.folder_id ?? null,
    companyId: r.company_id ?? null,
  };
}

export const listDriveAssets = createServerFn({ method: "GET" })
  .validator((input: { entityType?: string; entityKey?: string; companySlug?: string; folderId?: number | null; type?: string } = {}) => input)
  .handler(async ({ data }) => {
    const sql = await ready();
    const rows = await sql<{
      id: number;
      title: string;
      slug: string;
      filename: string;
      mime: string;
      asset_type: string;
      chunk_size: number;
      byte_size: number;
      source_url: string | null;
      entity_type: string | null;
      entity_key: string | null;
      transcript: string | null;
      n: number;
      folder_id: number | null;
      company_id: number | null;
      company_slug: string | null;
    }>`
      select a.id, a.title, a.slug, a.filename, a.mime, a.asset_type, a.chunk_size, a.byte_size,
             a.source_url, a.entity_type, a.entity_key, a.transcript,
             (select count(*)::int from drive_chunks c where c.asset_id = a.id) as n,
             a.folder_id, a.company_id, c.slug as company_slug
      from drive_assets a
      left join companies c on c.id = a.company_id
      where a.visibility = 'public'
      order by a.created_at desc
    `;
    return rows
      .filter((r) => {
        if (data.entityType && r.entity_type !== data.entityType) return false;
        if (data.entityKey && r.entity_key !== data.entityKey) return false;
        if (data.companySlug && r.company_slug !== data.companySlug && r.entity_key !== data.companySlug) return false;
        if (data.folderId != null && r.folder_id !== data.folderId) return false;
        if (data.type && r.asset_type !== data.type) return false;
        return true;
      })
      .map(mapAsset);
  });

export const listDriveFolders = createServerFn({ method: "POST" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<DriveFolder[]> => {
    const sql = await ready();
    const rows = await sql<{
      id: number;
      name: string;
      slug: string;
      parent_id: number | null;
      n: number;
    }>`
      select f.id, f.name, f.slug, f.parent_id,
        (select count(*)::int from drive_assets a where a.folder_id = f.id) as n
      from drive_folders f
      join companies c on c.id = f.company_id
      where c.slug = ${slug}
      order by f.name
    `;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      parentId: r.parent_id,
      count: r.n,
    }));
  });

export const getDriveAsset = createServerFn({ method: "GET" })
  .validator((id: number) => id)
  .handler(async ({ data }) => {
    const sql = await ready();
    const rows = await sql<{
      id: number;
      title: string;
      slug: string;
      filename: string;
      mime: string;
      asset_type: string;
      chunk_size: number;
      byte_size: number;
      source_url: string | null;
      entity_type: string | null;
      entity_key: string | null;
      transcript: string | null;
      n: number;
      folder_id: number | null;
      company_id: number | null;
    }>`
      select a.id, a.title, a.slug, a.filename, a.mime, a.asset_type, a.chunk_size, a.byte_size,
             a.source_url, a.entity_type, a.entity_key, a.transcript,
             (select count(*)::int from drive_chunks c where c.asset_id = a.id) as n,
             a.folder_id, a.company_id
      from drive_assets a
      where a.id = ${data}
      limit 1
    `;
    const r = rows[0];
    return r ? mapAsset(r) : null;
  });

export async function readDriveBuffer(id: number): Promise<{ mime: string; filename: string; buf: Buffer } | null> {
  const sql = await getSql();
  await ensureSeeded(sql);
  const rows = await sql<{
    filename: string;
    mime: string;
    source_url: string | null;
  }>`select filename, mime, source_url from drive_assets where id = ${id} limit 1`;
  const r = rows[0];
  if (!r) return null;
  const chunks = await sql<{ idx: number; body_b64: string }>`
    select idx, body_b64 from drive_chunks where asset_id = ${id} order by idx
  `;
  if (!chunks.length) return null;
  const buf = Buffer.concat(chunks.map((c) => Buffer.from(c.body_b64, "base64")));
  return { mime: r.mime, filename: r.filename, buf };
}

async function insertChunks(
  sql: Awaited<ReturnType<typeof getSql>>,
  data: {
    title: string;
    filename: string;
    mime: string;
    chunkSize: number;
    chunks: string[];
    entityType: string;
    entityKey: string;
    transcript: string;
    userId: string;
    companyId: number | null;
    folderId: number | null;
  },
) {
  const chunkSize = Math.max(4096, Math.min(1_048_576, data.chunkSize || 262144));
  if (!data.chunks.length) return { ok: false as const, error: "Fichier vide" };
  const byteSize = data.chunks.reduce((n, c) => n + Buffer.from(c, "base64").length, 0);
  if (byteSize > 4_500_000) return { ok: false as const, error: "Fichier trop lourd (4 Mo)." };
  const type = data.mime.startsWith("video/")
    ? "video"
    : data.mime.startsWith("audio/")
      ? "audio"
      : data.mime.startsWith("image/")
        ? "image"
        : data.mime.includes("pdf")
          ? "pdf"
          : data.mime.startsWith("text/")
            ? "text"
            : "file";
  const slug =
    data.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) +
    "-" +
    Date.now().toString(36);
  const rows = await sql<{ id: number }>`
    insert into drive_assets (
      title, slug, filename, mime, asset_type, chunk_size, byte_size,
      entity_type, entity_key, visibility, transcript, user_id, company_id, folder_id
    ) values (
      ${data.title.trim() || data.filename}, ${slug}, ${data.filename}, ${data.mime}, ${type},
      ${chunkSize}, ${byteSize}, ${data.entityType || null}, ${data.entityKey || null},
      ${"public"}, ${data.transcript || null}, ${data.userId}, ${data.companyId}, ${data.folderId}
    )
    returning id
  `;
  const id = rows[0]?.id;
  if (!id) return { ok: false as const, error: "Insert" };
  for (let i = 0; i < data.chunks.length; i += 1) {
    await sql`insert into drive_chunks (asset_id, idx, body_b64) values (${id}, ${i}, ${data.chunks[i]})`;
  }
  return { ok: true as const, id, type };
}

export const adminUploadDrive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      title: string;
      filename: string;
      mime: string;
      chunkSize: number;
      chunks: string[];
      entityType: string;
      entityKey: string;
      transcript: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await ready();
    if (!(await isOperator(sql, context.userId))) return { ok: false as const, error: "Opérateur seulement" };
    return insertChunks(sql, { ...data, userId: context.userId, companyId: null, folderId: null });
  });

async function houseOf(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const profile = await sql<{ role: string; house_slug: string | null }>`
    select role, house_slug from profiles where user_id = ${userId} limit 1
  `;
  if (profile[0]?.role !== "house" || !profile[0].house_slug) return null;
  const houses = await sql<{ id: number; slug: string; name: string }>`
    select id, slug, name from companies where slug = ${profile[0].house_slug} limit 1
  `;
  return houses[0] ?? null;
}

export const houseDrive = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready();
    const house = await houseOf(sql, context.userId);
    if (!house) return { ok: false as const, error: "Espace recruteur requis." };
    const folders = await sql<{
      id: number;
      name: string;
      slug: string;
      parent_id: number | null;
      n: number;
    }>`
      select f.id, f.name, f.slug, f.parent_id,
        (select count(*)::int from drive_assets a where a.folder_id = f.id) as n
      from drive_folders f
      where f.company_id = ${house.id}
      order by f.name
    `;
    const assets = await sql<{
      id: number;
      title: string;
      slug: string;
      filename: string;
      mime: string;
      asset_type: string;
      chunk_size: number;
      byte_size: number;
      source_url: string | null;
      entity_type: string | null;
      entity_key: string | null;
      transcript: string | null;
      n: number;
      folder_id: number | null;
      company_id: number | null;
    }>`
      select a.id, a.title, a.slug, a.filename, a.mime, a.asset_type, a.chunk_size, a.byte_size,
             a.source_url, a.entity_type, a.entity_key, a.transcript,
             (select count(*)::int from drive_chunks c where c.asset_id = a.id) as n,
             a.folder_id, a.company_id
      from drive_assets a
      where a.company_id = ${house.id} or a.entity_key = ${house.slug}
      order by a.created_at desc
    `;
    return {
      ok: true as const,
      house,
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        parentId: f.parent_id,
        count: f.n,
      })),
      assets: assets.map(mapAsset),
    };
  });

export const houseMkdir = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((name: string) => name)
  .handler(async ({ context, data: name }) => {
    const sql = await ready();
    const house = await houseOf(sql, context.userId);
    if (!house) return { ok: false as const, error: "Espace recruteur requis." };
    const label = name.trim().slice(0, 40);
    if (label.length < 2) return { ok: false as const, error: "Nom trop court." };
    const slug = label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    try {
      await sql`
        insert into drive_folders (company_id, parent_id, name, slug)
        values (${house.id}, ${null}, ${label}, ${slug})
      `;
    } catch {
      return { ok: false as const, error: "Dossier déjà existant." };
    }
    return { ok: true as const };
  });

export const houseUploadDrive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      title: string;
      filename: string;
      mime: string;
      chunkSize: number;
      chunks: string[];
      folderId: number | null;
      transcript: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await ready();
    const house = await houseOf(sql, context.userId);
    if (!house) return { ok: false as const, error: "Espace recruteur requis." };
    return insertChunks(sql, {
      title: data.title,
      filename: data.filename,
      mime: data.mime,
      chunkSize: data.chunkSize,
      chunks: data.chunks,
      entityType: "company",
      entityKey: house.slug,
      transcript: data.transcript,
      userId: context.userId,
      companyId: house.id,
      folderId: data.folderId,
    });
  });
