import { createFileRoute } from "@tanstack/react-router";
import { cultureOf } from "@/lib/culture";
import { gridByFamily, gridFor, mergeCustom } from "@/lib/fields";
import { getJob } from "@/lib/jobs-fn";
import { jobMarkdown } from "@/lib/machine";
import { requestOrigin } from "@/lib/origin";
import { scarcityOf } from "@/lib/scarcity";

export const Route = createFileRoute("/feed/$slug.md")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const raw = String(
          (params as { slug?: string; "slug.md"?: string }).slug ??
            (params as { "slug.md"?: string })["slug.md"] ??
            "",
        );
        const slug = raw.replace(/\.md$/, "");
        const job = await getJob({ data: slug });
        if (!job) return new Response("Offre introuvable\n", { status: 404 });
        const origin = requestOrigin(request);
        const culture = cultureOf(job.company.slug);
        const base = job.gridFamily ? gridByFamily(job.gridFamily) : gridFor(job);
        const grid = mergeCustom(base, job.customFields);
        const md = jobMarkdown(job, origin, culture, grid, scarcityOf(job));
        return new Response(md, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
