import { createFileRoute } from "@tanstack/react-router";
import { getProofMeta } from "@/lib/ops-fn";

export const Route = createFileRoute("/fichiers/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = Number(params.id);
        if (!Number.isFinite(id)) return new Response("no", { status: 404 });
        const row = await getProofMeta({ data: id });
        if (!row) return new Response("no", { status: 404 });
        const buf = Buffer.from(row.body_b64, "base64");
        return new Response(buf, {
          headers: {
            "Content-Type": row.mime,
            "Content-Disposition": `inline; filename="${row.file_name.replace(/"/g, "")}"`,
            "Cache-Control": "private, max-age=3600",
          },
        });
      },
    },
  },
});
