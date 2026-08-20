import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { getSql } from "./db";
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
};

export const listDriveAssets = createServerFn({ method: "GET" })
  .validator((input: { entityType?: string; entityKey?: string } = {}) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
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
    }>`
      select a.id, a.title, a.slug, a.filename, a.mime, a.asset_type, a.chunk_size, a.byte_size,
             a.source_url, a.entity_type, a.entity_key, a.transcript,
             (select count(*)::int from drive_chunks c where c.asset_id = a.id) as n
      from drive_assets a
      where a.visibility = 'public'
      order by a.created_at desc
    `;
    return rows
      .filter((r) => {
        if (data.entityType && r.entity_type !== data.entityType) return false;
        if (data.entityKey && r.entity_key !== data.entityKey) return false;
        return true;
      })
      .map(
        (r): DriveAsset => ({
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
        }),
      );
  });

export const getDriveAsset = createServerFn({ method: "GET" })
  .validator((id: number) => id)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
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
    }>`
      select a.id, a.title, a.slug, a.filename, a.mime, a.asset_type, a.chunk_size, a.byte_size,
             a.source_url, a.entity_type, a.entity_key, a.transcript,
             (select count(*)::int from drive_chunks c where c.asset_id = a.id) as n
      from drive_assets a
      where a.id = ${data}
      limit 1
    `;
    const r = rows[0];
    if (!r) return null;
    const asset: DriveAsset = {
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
    };
    return asset;
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
    const sql = await getSql();
    await ensureSeeded(sql);
    if (!(await isOperator(sql, context.userId))) return { ok: false as const, error: "Opérateur seulement" };
    const chunkSize = Math.max(4096, Math.min(1_048_576, data.chunkSize || 262144));
    if (!data.chunks.length) return { ok: false as const, error: "Fichier vide" };
    const byteSize = data.chunks.reduce((n, c) => n + Buffer.from(c, "base64").length, 0);
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
    const type = data.mime.startsWith("video/")
      ? "video"
      : data.mime.startsWith("image/")
        ? "image"
        : data.mime.includes("pdf")
          ? "pdf"
          : data.mime.startsWith("text/")
            ? "text"
            : "file";
    const rows = await sql<{ id: number }>`
      insert into drive_assets (
        title, slug, filename, mime, asset_type, chunk_size, byte_size,
        entity_type, entity_key, visibility, transcript, user_id
      ) values (
        ${data.title.trim() || data.filename}, ${slug}, ${data.filename}, ${data.mime}, ${type},
        ${chunkSize}, ${byteSize}, ${data.entityType || null}, ${data.entityKey || null},
        ${"public"}, ${data.transcript || null}, ${context.userId}
      )
      returning id
    `;
    const id = rows[0]?.id;
    if (!id) return { ok: false as const, error: "Insert" };
    for (let i = 0; i < data.chunks.length; i += 1) {
      await sql`insert into drive_chunks (asset_id, idx, body_b64) values (${id}, ${i}, ${data.chunks[i]})`;
    }
    return { ok: true as const, id };
  });
