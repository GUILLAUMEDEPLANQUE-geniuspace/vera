import { createFileRoute, Link } from "@tanstack/react-router";
import { GeoJobs } from "@/components/geo-jobs";
import { SeoFaq } from "@/components/seo-faq";
import { CITIES, deptCopy, deptOf, jobsForDept, regionOf, tensionLabel } from "@/lib/geo";
import { listJobs } from "@/lib/jobs-fn";
import { BRAND_HOST } from "@/lib/origin";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/lieux/departements/$slug")({
  loader: async ({ params }) => {
    const dept = deptOf(params.slug) ?? null;
    const region = dept ? (regionOf(dept.region) ?? null) : null;
    const jobs = await listJobs({ data: {} });
    const split = dept ? jobsForDept(jobs, dept) : { local: [] as const, region: [] as const, remote: [] as const };
    return { dept, region, local: split.local, regionJobs: split.region, remote: split.remote };
  },
  head: ({ loaderData, params }) => {
    const dept = loaderData?.dept ?? deptOf(params.slug);
    const region = loaderData?.region ?? (dept ? regionOf(dept.region) : undefined);
    if (!dept || !region) return { meta: [{ title: "Département | Vera" }] };
    const copy = deptCopy(dept, region);
    const url = `${BRAND_HOST}/lieux/departements/${dept.slug}`;
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
          about: { "@type": "AdministrativeArea", name: dept.name, identifier: dept.code },
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
            `Offres ${dept.name}`,
            (loaderData?.local ?? []).map((j) => ({ name: `${j.title} — ${j.company.name}`, url: `${BRAND_HOST}/jobs/${j.slug}` })),
          ),
        ),
      ],
    };
  },
  component: DeptPage,
});

function DeptPage() {
  const { dept, region, local, regionJobs, remote } = Route.useLoaderData();
  if (!dept || !region) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Département introuvable</h1>
        <Link to="/lieux/departements" className="mt-4 inline-block text-primary">
          Tous les départements
        </Link>
      </div>
    );
  }
  const copy = deptCopy(dept, region);
  const cities = CITIES.filter((c) => c.dept === dept.code);
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">Vera</Link>
        {" · "}
        <Link to="/lieux" className="hover:text-ink">Lieux</Link>
        {" · "}
        <Link to="/lieux/departements" className="hover:text-ink">Départements</Link>
        {` · ${dept.name}`}
      </nav>
      <p className="mt-4 text-xs tracking-wide text-primary uppercase">{dept.code}</p>
      <h1 className="mt-1 font-serif text-4xl sm:text-5xl">{dept.name}</h1>
      <p className="mt-2 text-sm text-muted">
        Préfecture {dept.prefecture} · {region.name} · tension {dept.tension}/100 — {tensionLabel(dept.tension)} · index {dept.salaryIndex}
      </p>
      {copy.intro.map((p) => (
        <p key={p.slice(0, 40)} className="mt-4 text-base leading-relaxed">{p}</p>
      ))}
      <p className="mt-6 text-sm">
        Région{" "}
        <Link to="/lieux/regions/$slug" params={{ slug: region.slug }} className="text-primary">
          {region.name}
        </Link>
      </p>
      <ul className="mt-4 flex flex-wrap gap-2 text-sm">
        {cities.map((c) => (
          <li key={c.slug}>
            <Link to="/lieux/$city" params={{ city: c.slug }} className="text-primary">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-12">
        <GeoJobs local={[...local]} bassin={[...regionJobs]} remote={[...remote]} bassinLabel={`Reste de ${region.name}`} />
      </div>
      <SeoFaq items={copy.faqs} />
    </article>
  );
}
