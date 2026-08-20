import { createFileRoute } from "@tanstack/react-router";
import { cultureOf } from "@/lib/culture";
import { familyOf } from "@/lib/fields";
import { CITIES, DEPTS, REGIONS } from "@/lib/geo";
import { listCompanies, listJobs } from "@/lib/jobs-fn";
import { requestOrigin } from "@/lib/origin";
import { PILLARS } from "@/lib/pillars";
import { scarcityOf } from "@/lib/scarcity";
import { SEM_CITIES, SEM_METIERS } from "@/lib/sem";
import { VIVIERS } from "@/lib/viviers";

export const Route = createFileRoute("/feed.json")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = requestOrigin(request);
        const [jobs, companies] = await Promise.all([listJobs({ data: {} }), listCompanies()]);
        const body = {
          spec: "vera.feed.v1",
          name: "Vera",
          url: origin,
          generated: new Date().toISOString(),
          hubs: {
            regions: REGIONS.map((r) => ({ slug: r.slug, name: r.name, url: `${origin}/lieux/regions/${r.slug}`, tension: r.tension })),
            departements: DEPTS.map((d) => ({ slug: d.slug, code: d.code, name: d.name, url: `${origin}/lieux/departements/${d.slug}` })),
            villes: CITIES.map((c) => ({ slug: c.slug, name: c.name, url: `${origin}/lieux/${c.slug}` })),
            lieux: SEM_CITIES.map((c) => ({ slug: c.slug, name: c.name, url: `${origin}/lieux/${c.slug}` })),
            metiers: SEM_METIERS.map((m) => ({ slug: m.slug, name: m.name, url: `${origin}/metiers/${m.slug}` })),
            guides: PILLARS.map((p) => ({ slug: p.slug, title: p.title, url: `${origin}/guides/${p.slug}` })),
            viviers: VIVIERS.map((v) => ({ slug: v.slug, name: v.name, url: `${origin}/viviers/${v.slug}`, pool: v.pool })),
          },
          companies: companies.map((c) => {
            const culture = cultureOf(c.slug);
            return {
              slug: c.slug,
              name: c.name,
              url: `${origin}/companies/${c.slug}`,
              md: `${origin}/feed/maisons/${c.slug}.md`,
              industry: c.industry,
              hq: { city: c.hqCity, country: c.hqCountry },
              honor: c.honorScore,
              slaDays: c.responseSlaDays,
              intercultural: culture.intercultural,
              languages: culture.languages,
              jobs: c.jobCount,
            };
          }),
          jobs: jobs.map((j) => {
            const scarcity = scarcityOf(j);
            const culture = cultureOf(j.company.slug);
            return {
              id: j.slug,
              url: `${origin}/jobs/${j.slug}`,
              md: `${origin}/feed/${j.slug}.md`,
              title: j.title,
              company: {
                slug: j.company.slug,
                name: j.company.name,
                honor: j.company.honorScore,
                slaDays: j.company.responseSlaDays,
                industry: j.company.industry,
              },
              location: { city: j.city, country: j.country, remote: j.remoteType },
              pool: j.pool,
              contract: j.contract,
              seniority: j.seniority,
              salary: { min: j.salaryMin, max: j.salaryMax, currency: j.currency, published: true },
              skills: j.skills,
              family: familyOf(j),
              scarcity,
              culture: { intercultural: culture.intercultural, languages: culture.languages },
              postedAt: j.postedAt,
              ghostRisk: j.ghostRisk,
            };
          }),
        };
        return new Response(JSON.stringify(body, null, 2), {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
