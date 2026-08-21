import { createFileRoute } from "@tanstack/react-router";
import { listAcademySitemap } from "@/lib/academy-fn";
import { CITIES, DEPTS, EU_CITIES, REGIONS } from "@/lib/geo";
import { LESSONS } from "@/lib/lessons";
import { listCompanies, listJobs } from "@/lib/jobs-fn";
import { listArticles } from "@/lib/journal-fn";
import { listHubArticles, listHubCategories } from "@/lib/hub-fn";
import { requestOrigin } from "@/lib/origin";
import { PILLARS } from "@/lib/pillars";
import { SEM_METIERS } from "@/lib/sem";
import { VIVIERS } from "@/lib/viviers";

function esc(s: string) {
  const amp = "\u0026";
  return s
    .replace(/&/g, `${amp}amp;`)
    .replace(/</g, `${amp}lt;`)
    .replace(/>/g, `${amp}gt;`)
    .replace(/"/g, `${amp}quot;`);
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = requestOrigin(request);
        const [jobs, companies, articles, cats, savoirs, academyUrls] = await Promise.all([
          listJobs({ data: {} }),
          listCompanies(),
          listArticles(),
          listHubCategories(),
          listHubArticles({ data: {} }),
          listAcademySitemap(),
        ]);
        const today = new Date().toISOString().slice(0, 10);
        const urls: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [
          { loc: `${origin}/`, lastmod: today, changefreq: "daily", priority: "1.0" },
          { loc: `${origin}/jobs`, lastmod: today, changefreq: "hourly", priority: "0.9" },
          { loc: `${origin}/companies`, lastmod: today, changefreq: "daily", priority: "0.8" },
          { loc: `${origin}/guides`, lastmod: today, changefreq: "weekly", priority: "0.8" },
          { loc: `${origin}/lieux`, lastmod: today, changefreq: "weekly", priority: "0.8" },
          { loc: `${origin}/lieux/regions`, lastmod: today, changefreq: "weekly", priority: "0.7" },
          { loc: `${origin}/lieux/departements`, lastmod: today, changefreq: "weekly", priority: "0.7" },
          { loc: `${origin}/metiers`, lastmod: today, changefreq: "weekly", priority: "0.8" },
          { loc: `${origin}/viviers`, lastmod: today, changefreq: "weekly", priority: "0.7" },
          { loc: `${origin}/academies`, lastmod: today, changefreq: "daily", priority: "0.8" },
          { loc: `${origin}/savoirs`, lastmod: today, changefreq: "daily", priority: "0.9" },
          { loc: `${origin}/drive`, lastmod: today, changefreq: "weekly", priority: "0.7" },
          { loc: `${origin}/lexique`, lastmod: today, changefreq: "monthly", priority: "0.6" },
          { loc: `${origin}/apprendre`, lastmod: today, changefreq: "weekly", priority: "0.6" },
          { loc: `${origin}/journal`, lastmod: today, changefreq: "daily", priority: "0.7" },
          { loc: `${origin}/tension`, lastmod: today, changefreq: "weekly", priority: "0.7" },
          { loc: `${origin}/ppqc`, lastmod: today, changefreq: "monthly", priority: "0.5" },
          { loc: `${origin}/marche`, lastmod: today, changefreq: "weekly", priority: "0.6" },
          { loc: `${origin}/pacte`, lastmod: today, changefreq: "monthly", priority: "0.5" },
          { loc: `${origin}/feed.json`, lastmod: today, changefreq: "hourly", priority: "0.5" },
          { loc: `${origin}/llms.txt`, lastmod: today, changefreq: "daily", priority: "0.4" },
        ];
        for (const p of PILLARS) {
          urls.push({
            loc: `${origin}/guides/${p.slug}`,
            lastmod: p.updated,
            changefreq: "weekly",
            priority: "0.8",
          });
        }
        for (const r of REGIONS) {
          urls.push({ loc: `${origin}/lieux/regions/${r.slug}`, lastmod: today, changefreq: "weekly", priority: "0.7" });
        }
        for (const d of DEPTS) {
          urls.push({ loc: `${origin}/lieux/departements/${d.slug}`, lastmod: today, changefreq: "weekly", priority: "0.6" });
        }
        for (const c of CITIES) {
          urls.push({ loc: `${origin}/lieux/${c.slug}`, lastmod: today, changefreq: "weekly", priority: "0.6" });
        }
        for (const c of EU_CITIES) {
          urls.push({ loc: `${origin}/lieux/${c.slug}`, lastmod: today, changefreq: "weekly", priority: "0.6" });
        }
        for (const v of VIVIERS) {
          urls.push({ loc: `${origin}/viviers/${v.slug}`, lastmod: today, changefreq: "weekly", priority: "0.6" });
        }
        for (const l of LESSONS) {
          urls.push({ loc: `${origin}/apprendre/${l.slug}`, lastmod: today, changefreq: "monthly", priority: "0.5" });
        }
        for (const c of cats) {
          urls.push({ loc: `${origin}/savoirs/${c.slug}`, lastmod: today, changefreq: "weekly", priority: "0.8" });
        }
        for (const a of savoirs) {
          urls.push({
            loc: `${origin}/savoirs/${a.catSlug}/${a.slug}`,
            lastmod: today,
            changefreq: "weekly",
            priority: "0.8",
          });
        }
        for (const a of articles) {
          urls.push({ loc: `${origin}/journal/${a.slug}`, lastmod: today, changefreq: "weekly", priority: "0.5" });
        }
        for (const m of SEM_METIERS) {
          urls.push({
            loc: `${origin}/metiers/${m.slug}`,
            lastmod: today,
            changefreq: "weekly",
            priority: "0.7",
          });
        }
        for (const c of companies) {
          urls.push({
            loc: `${origin}/companies/${c.slug}`,
            lastmod: today,
            changefreq: "weekly",
            priority: "0.8",
          });
          urls.push({
            loc: `${origin}/companies/${c.slug}/academie`,
            lastmod: today,
            changefreq: "weekly",
            priority: "0.7",
          });
          for (const tab of ["offres", "journal", "preuves", "equipes", "medias", "rdv"] as const) {
            urls.push({
              loc: `${origin}/companies/${c.slug}/${tab}`,
              lastmod: today,
              changefreq: "weekly",
              priority: "0.6",
            });
          }
          urls.push({
            loc: `${origin}/feed/maisons/${c.slug}.md`,
            lastmod: today,
            changefreq: "weekly",
            priority: "0.3",
          });
        }
        for (const a of academyUrls) {
          urls.push({
            loc: `${origin}/companies/${a.company}/academie/${a.course}`,
            lastmod: today,
            changefreq: "weekly",
            priority: "0.6",
          });
        }
        for (const j of jobs) {
          urls.push({
            loc: `${origin}/jobs/${j.slug}`,
            lastmod: j.postedAt.slice(0, 10),
            changefreq: "daily",
            priority: "0.9",
          });
          urls.push({
            loc: `${origin}/feed/${j.slug}.md`,
            lastmod: j.postedAt.slice(0, 10),
            changefreq: "daily",
            priority: "0.4",
          });
        }
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=600",
          },
        });
      },
    },
  },
});
