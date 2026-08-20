import { createFileRoute, Link } from "@tanstack/react-router";
import { GeoJobs } from "@/components/geo-jobs";
import { SeoFaq } from "@/components/seo-faq";
import { DEPTS, jobsForRegion, regionCopy, regionOf, tensionLabel } from "@/lib/geo";
import { listJobs } from "@/lib/jobs-fn";
import { BRAND_HOST } from "@/lib/origin";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/lieux/regions/$slug")({
  loader: async ({ params }) => {
    const region = regionOf(params.slug) ?? null;
    const jobs = await listJobs({ data: {} });
    const split = region ? jobsForRegion(jobs, region) : { local: [], remote: [] };
    return { region, ...split };
  },
  head: ({ loaderData, params }) => {
    const region = loaderData?.region ?? regionOf(params.slug);
    if (!region) return { meta: [{ title: "Région | Vera" }] };
    const copy = regionCopy(region);
    const url = `${BRAND_HOST}/lieux/regions/${region.slug}`;
    return {
      meta: [
        { title: copy.title },
        { name: "description", content: copy.description.slice(0, 170) },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: copy.title },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: copy.title,
          url,
          about: { "@type": "AdministrativeArea", name: region.name },
        }),
        ldScript({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: copy.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
        ldScript(
          itemListJsonLd(
            `Offres ${region.name}`,
            (loaderData?.local ?? []).map((j) => ({ name: `${j.title} — ${j.company.name}`, url: `${BRAND_HOST}/jobs/${j.slug}` })),
          ),
        ),
      ],
    };
  },
  component: RegionPage,
});

function RegionPage() {
  const { region, local, remote } = Route.useLoaderData();
  if (!region) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Région introuvable</h1>
        <Link to="/lieux/regions" className="mt-4 inline-block text-primary">Toutes les régions</Link>
      </div>
    );
  }
  const copy = regionCopy(region);
  const depts = DEPTS.filter((d) => d.region === region.slug);
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">Vera</Link>
        {" · "}
        <Link to="/lieux" className="hover:text-ink">Lieux</Link>
        {" · "}
        <Link to="/lieux/regions" className="hover:text-ink">Régions</Link>
        {` · ${region.name}`}
      </nav>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">{region.name}</h1>
      <p className="mt-2 text-sm text-muted">
        Tension {region.tension}/100 — {tensionLabel(region.tension)} · index salarial {region.salaryIndex}
      </p>
      {copy.intro.map((p) => (
        <p key={p.slice(0, 40)} className="mt-4 text-base leading-relaxed">{p}</p>
      ))}
      <ul className="mt-8 flex flex-wrap gap-2 text-sm">
        {depts.map((d) => (
          <li key={d.code}>
            <Link to="/lieux/departements/$slug" params={{ slug: d.slug }} className="text-primary">
              {d.code} {d.name}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-12">
        <GeoJobs local={local} remote={remote} />
      </div>
      <SeoFaq items={copy.faqs} />
    </article>
  );
}
