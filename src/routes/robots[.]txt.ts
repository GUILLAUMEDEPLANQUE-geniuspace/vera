import { createFileRoute } from "@tanstack/react-router";
import { requestOrigin } from "@/lib/origin";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = requestOrigin(request);
        const body = `User-agent: *
Allow: /
Allow: /jobs
Allow: /companies
Allow: /guides
Allow: /lieux
Allow: /metiers
Allow: /marche
Allow: /pacte
Allow: /feed.json
Allow: /feed/
Allow: /llms.txt
Allow: /viviers
Allow: /journal
Allow: /tension
Allow: /ppqc
Allow: /talents
Disallow: /me
Disallow: /admin
Disallow: /login
Disallow: /post
Disallow: /api/

Sitemap: ${origin}/sitemap.xml

# Machine-readable jobs for AI agents and ATS
# ${origin}/llms.txt
# ${origin}/feed.json
# ${origin}/feed/{slug}.md
# ${origin}/feed/maisons/{slug}.md
`;
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
