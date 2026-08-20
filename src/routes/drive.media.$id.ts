import { createFileRoute } from "@tanstack/react-router";
import { readDriveBuffer } from "@/lib/drive-fn";
import { getSql } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const Route = createFileRoute("/drive/media/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const id = Number(params.id);
        if (!Number.isFinite(id)) return new Response("no", { status: 404 });
        const sql = await getSql();
        await ensureSeeded(sql);
        const rows = await sql<{ source_url: string | null; mime: string; filename: string }>`
          select source_url, mime, filename from drive_assets where id = ${id} limit 1
        `;
        const meta = rows[0];
        if (!meta) return new Response("no", { status: 404 });
        if (meta.source_url) {
          return new Response(null, { status: 302, headers: { Location: meta.source_url } });
        }
        const packed = await readDriveBuffer(id);
        if (!packed) return new Response("no", { status: 404 });
        const { buf, mime, filename } = packed;
        const range = request.headers.get("range");
        const headers: Record<string, string> = {
          "Content-Type": mime,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600",
          "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
        };
        if (range) {
          const m = /bytes=(\d*)-(\d*)/.exec(range);
          const start = m?.[1] ? Number(m[1]) : 0;
          const end = m?.[2] ? Number(m[2]) : buf.length - 1;
          const slice = buf.subarray(start, end + 1);
          return new Response(slice, {
            status: 206,
            headers: {
              ...headers,
              "Content-Length": String(slice.length),
              "Content-Range": `bytes ${start}-${start + slice.length - 1}/${buf.length}`,
            },
          });
        }
        return new Response(buf, {
          headers: { ...headers, "Content-Length": String(buf.length) },
        });
      },
    },
  },
});
