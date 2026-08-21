import { createFileRoute, Link } from "@tanstack/react-router";
import { GeoJobs } from "@/components/geo-jobs";
import { SeoFaq } from "@/components/seo-faq";
import { cityCopy, cityOf, EU_CITIES, jobsForCity, placeOf } from "@/lib/geo";
import { listCompanies, listJobs } from "@/lib/jobs-fn";
import { BRAND_HOST } from "@/lib/origin";
import { cityOfSlug, citySlug, SEM_METIERS } from "@/lib/sem";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/lieux/$city")({
  loader: async ({ params }) => {
    const geo = cityOf(params.city) ?? null;
    const place = geo ? placeOf(geo) : null;
    const sem = cityOfSlug(params.city) ?? null;
    const eu = EU_CITIES.find((c) => c.slug === params.city) ?? null;
    const [jobs, companies] = await Promise.all([listJobs({ data: {} }), listCompanies()]);
    const slug = geo?.slug ?? sem?.slug ?? eu?.slug ?? params.city;
    const split = geo ? jobsForCity(jobs, geo) : { local: jobs.filter((j) => citySlug(j.city) === slug), bassin: [], remote: jobs.filter((j) => j.remoteType === "remote") };
    const localCompanies = companies.filter(
      (c) => citySlug(c.hqCity) === slug || split.local.some((j) => j.company.slug === c.slug),
    );
    return { geo, place, sem, eu, ...split, companies: localCompanies };
  },
  head: ({ loaderData, params }) => {
    const geo = loaderData?.geo ?? cityOf(params.city);
    const place = loaderData?.place ?? (geo ? placeOf(geo) : null);
    const sem = loaderData?.sem ?? cityOfSlug(params.city);
    const eu = loaderData?.eu ?? EU_CITIES.find((c) => c.slug === params.city);
    const name = geo?.name ?? sem?.name ?? eu?.name;
    if (!name) return { meta: [{ title: "Ville | Vera" }] };
    const copy = place && geo ? cityCopy(geo, place.dept, place.region) : null;
    const title = sem?.title ?? copy?.title ?? `Emplois à ${name} | Vera`;
    const description = (sem?.description ?? copy?.description ?? `Offres à ${name}, salaire publié.`).slice(0, 170);
    const url = `${BRAND_HOST}/lieux/${params.city}`;
    const faqs = sem?.faqs ?? copy?.faqs ?? [];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: title },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          url,
          about: { "@type": "City", name },
        }),
        ldScript({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
        ldScript(
          itemListJsonLd(
            `Offres à ${name}`,
            (loaderData?.local ?? []).map((j) => ({ name: `${j.title} — ${j.company.name}`, url: `${BRAND_HOST}/jobs/${j.slug}` })),
          ),
        ),
      ],
    };
  },
  component: CityPage,
});

function CityPage() {
  const { geo, place, sem, eu, local, bassin, remote, companies } = Route.useLoaderData();
  const name = geo?.name ?? sem?.name ?? eu?.name;
  if (!name) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Ville introuvable</h1>
        <Link to="/lieux" className="mt-4 inline-block text-primary">Tous les lieux</Link>
      </div>
    );
  }
  const copy = place && geo ? cityCopy(geo, place.dept, place.region) : null;
  const intro = sem?.intro ?? copy?.intro ?? [`${name} : offres à salaire publié, pacte de réponse, grilles.`];
  const faqs = sem?.faqs ?? copy?.faqs ?? [];
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">Vera</Link>
        {" · "}
        <Link to="/lieux" className="hover:text-ink">Lieux</Link>
        {place && (
          <>
            {" · "}
            <Link to="/lieux/regions/$slug" params={{ slug: place.region.slug }} className="hover:text-ink">
              {place.region.name}
            </Link>
            {" · "}
            <Link to="/lieux/departements/$slug" params={{ slug: place.dept.slug }} className="hover:text-ink">
              {place.dept.name}
            </Link>
          </>
        )}
        {` · ${name}`}
      </nav>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">Emplois à {name}</h1>
      <p className="mt-2 text-sm text-muted">
        {place ? `${place.dept.code} · ${place.region.name}` : eu?.country} · {local.length} offre{local.length > 1 ? "s" : ""} locale{local.length > 1 ? "s" : ""}
      </p>
      {intro.map((p) => (
        <p key={p.slice(0, 40)} className="mt-4 text-base leading-relaxed">{p}</p>
      ))}
      {companies.length > 0 && (
        <ul className="mt-6 space-y-1 text-sm">
          {companies.map((h) => (
            <li key={h.slug}>
              <Link to="/companies/$slug" params={{ slug: h.slug }} className="text-primary">{h.name}</Link>
              <span className="text-muted"> · honneur {h.honorScore}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-12">
        <GeoJobs local={local} bassin={bassin} remote={remote} bassinLabel="Même département" />
      </div>
      <section className="mt-12">
        <h2 className="font-serif text-2xl">Métiers</h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {SEM_METIERS.map((m) => (
            <li key={m.slug}>
              <Link to="/metiers/$slug" params={{ slug: m.slug }} className="text-primary">{m.name}</Link>
            </li>
          ))}
        </ul>
      </section>
      {faqs.length > 0 && <SeoFaq items={faqs} />}
    </article>
  );
}
