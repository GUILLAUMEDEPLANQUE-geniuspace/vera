import { createFileRoute } from "@tanstack/react-router";
import { cultureOf } from "@/lib/culture";
import { getCompany } from "@/lib/jobs-fn";
import { companyMarkdown } from "@/lib/machine";
import { requestOrigin } from "@/lib/origin";

export const Route = createFileRoute("/feed/maisons/$slug.md")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const raw = String(
          (params as { slug?: string; "slug.md"?: string }).slug ??
            (params as { "slug.md"?: string })["slug.md"] ??
            "",
        );
        const slug = raw.replace(/\.md$/, "");
        const data = await getCompany({ data: slug });
        if (!data) return new Response("Maison introuvable\n", { status: 404 });
        const origin = requestOrigin(request);
        const culture = cultureOf(data.company.slug);
        const md = companyMarkdown(data.company, data.jobs, origin, culture);
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
