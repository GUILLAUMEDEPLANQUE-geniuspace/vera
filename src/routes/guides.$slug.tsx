import { createFileRoute, Link } from "@tanstack/react-router";
import { JobCard } from "@/components/job-card";
import { listCompanies, listJobs } from "@/lib/jobs-fn";
import { BRAND_HOST } from "@/lib/origin";
import { PILLARS, pillarOf } from "@/lib/pillars";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/guides/$slug")({
  loader: async ({ params }) => {
    const pillar = pillarOf(params.slug) ?? null;
    if (!pillar) return { pillar: null, jobs: [], companyNames: {} as Record<string, string> };
    const [jobs, companies] = await Promise.all([listJobs({ data: {} }), listCompanies()]);
    const related = jobs.filter((j) => pillar.relatedJobs.includes(j.slug));
    const companyNames = Object.fromEntries(companies.map((c) => [c.slug, c.name]));
    return { pillar, jobs: related, companyNames };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.pillar ?? pillarOf(params.slug);
    if (!p) return { meta: [{ title: "Guide | Vera" }] };
    const url = `${BRAND_HOST}/guides/${p.slug}`;
    return {
      meta: [
        { title: `${p.title} | Vera` },
        { name: "description", content: p.excerpt.slice(0, 170) },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt.slice(0, 170) },
        { property: "og:type", content: "article" },
        { property: "article:modified_time", content: p.updated },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: p.excerpt,
          dateModified: p.updated,
          inLanguage: "fr-FR",
          author: { "@type": "Organization", name: "Vera" },
          publisher: { "@type": "Organization", name: "Vera", url: BRAND_HOST },
          mainEntityOfPage: url,
        }),
        ldScript({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Vera", item: BRAND_HOST },
            { "@type": "ListItem", position: 2, name: "Guides", item: `${BRAND_HOST}/guides` },
            { "@type": "ListItem", position: 3, name: p.title, item: url },
          ],
        }),
        ldScript(
          itemListJsonLd(
            p.title,
            (p.ranking ?? []).length
              ? (p.ranking ?? []).map((r) => ({
                  name: `${r.rank}. ${r.title}`,
                  url: r.jobSlug
                    ? `${BRAND_HOST}/jobs/${r.jobSlug}`
                    : r.metierSlug
                      ? `${BRAND_HOST}/metiers/${r.metierSlug}`
                      : r.companySlug
                        ? `${BRAND_HOST}/companies/${r.companySlug}`
                        : url,
                }))
              : p.relatedJobs.map((slug) => ({ name: slug, url: `${BRAND_HOST}/jobs/${slug}` })),
          ),
        ),
      ],
    };
  },
  component: GuidePage,
});

function GuidePage() {
  const { pillar, jobs, companyNames } = Route.useLoaderData();
  if (!pillar) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Guide introuvable</h1>
        <Link to="/guides" className="mt-4 inline-block text-primary">
          Tous les guides
        </Link>
      </div>
    );
  }

  const others = PILLARS.filter((p) => p.slug !== pillar.slug);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">
          Vera
        </Link>
        {" · "}
        <Link to="/guides" className="hover:text-ink">
          Guides
        </Link>
      </nav>
      <p className="mt-4 text-xs tracking-wide text-primary uppercase">{pillar.kicker}</p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{pillar.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{pillar.excerpt}</p>
      <p className="mt-2 text-xs text-subtle">Mis à jour {pillar.updated}</p>

      {pillar.sections.map((s) => (
        <section key={s.h} className="mt-10">
          <h2 className="font-serif text-2xl sm:text-3xl">{s.h}</h2>
          {s.p.map((para) => (
            <p key={para.slice(0, 48)} className="mt-3 text-base leading-relaxed text-ink">
              {para}
            </p>
          ))}
        </section>
      ))}

      {pillar.ranking && pillar.ranking.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-2xl sm:text-3xl">Le classement</h2>
          <ol className="mt-6 divide-y divide-border border-y border-border">
            {pillar.ranking.map((r) => (
              <li key={r.rank} className="py-5">
                <p className="text-xs tracking-wide text-muted uppercase">
                  {String(r.rank).padStart(2, "0")} · {r.family}
                </p>
                <h3 className="mt-1 font-serif text-2xl leading-tight">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink">{r.why}</p>
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  {r.jobSlug && (
                    <Link to="/jobs/$slug" params={{ slug: r.jobSlug }} className="text-primary">
                      Offre liée
                    </Link>
                  )}
                  {r.metierSlug && (
                    <Link to="/metiers/$slug" params={{ slug: r.metierSlug }} className="text-primary">
                      Fiche métier
                    </Link>
                  )}
                  {r.companySlug && (
                    <Link to="/companies/$slug" params={{ slug: r.companySlug }} className="text-primary">
                      Entreprise
                    </Link>
                  )}
                  {r.citySlug && (
                    <Link to="/lieux/$city" params={{ city: r.citySlug }} className="text-primary">
                      Ville
                    </Link>
                  )}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {jobs.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-2xl">Offres liées</h2>
          <div className="mt-5 grid gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      {pillar.relatedCompanies.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl">Entreprises</h2>
          <ul className="mt-3 flex flex-wrap gap-3 text-sm">
            {pillar.relatedCompanies.map((slug) => (
              <li key={slug}>
                <Link to="/companies/$slug" params={{ slug }} className="text-primary">
                  {companyNames[slug] ?? slug}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-14 border-t border-border pt-8">
        <h2 className="font-serif text-2xl">Autres piliers</h2>
        <ul className="mt-4 space-y-3">
          {others.map((p) => (
            <li key={p.slug}>
              <Link to="/guides/$slug" params={{ slug: p.slug }} className="font-medium text-primary">
                {p.title}
              </Link>
              <p className="text-sm text-muted">{p.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
