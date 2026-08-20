import { createFileRoute, Link } from "@tanstack/react-router";
import { JobCard } from "@/components/job-card";
import { SeoFaq } from "@/components/seo-faq";
import { gridByFamily } from "@/lib/fields";
import { listJobs } from "@/lib/jobs-fn";
import { BRAND_HOST } from "@/lib/origin";
import { SEM_CITIES, metierOfSlug } from "@/lib/sem";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/metiers/$slug")({
  loader: async ({ params }) => {
    const metier = metierOfSlug(params.slug) ?? null;
    const jobs = await listJobs({ data: {} });
    const related = metier
      ? jobs.filter((j) => metier.match(j.title.toLowerCase(), j.skills, j.collection))
      : [];
    return { metier, jobs: related };
  },
  head: ({ loaderData, params }) => {
    const metier = loaderData?.metier ?? metierOfSlug(params.slug);
    if (!metier) return { meta: [{ title: "Métier | Vera" }] };
    const url = `${BRAND_HOST}/metiers/${metier.slug}`;
    return {
      meta: [
        { title: metier.title },
        { name: "description", content: metier.description.slice(0, 170) },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: metier.title },
        { property: "og:description", content: metier.description.slice(0, 170) },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript({
          "@context": "https://schema.org",
          "@type": "Occupation",
          name: metier.name,
          description: metier.description,
          url,
          occupationLocation: { "@type": "Country", name: "France" },
        }),
        ldScript({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: metier.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
        ldScript({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Vera", item: BRAND_HOST },
            { "@type": "ListItem", position: 2, name: "Métiers", item: `${BRAND_HOST}/metiers` },
            { "@type": "ListItem", position: 3, name: metier.name, item: url },
          ],
        }),
        ldScript(
          itemListJsonLd(
            `Offres ${metier.name}`,
            (loaderData?.jobs ?? []).map((j) => ({
              name: `${j.title} — ${j.company.name}`,
              url: `${BRAND_HOST}/jobs/${j.slug}`,
            })),
          ),
        ),
      ],
    };
  },
  component: MetierPage,
});

function MetierPage() {
  const { metier, jobs } = Route.useLoaderData();
  if (!metier) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Métier introuvable</h1>
        <Link to="/metiers" className="mt-4 inline-block text-primary">
          Tous les métiers
        </Link>
      </div>
    );
  }
  const grid = gridByFamily(metier.family);
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">
          Vera
        </Link>
        {" · "}
        <Link to="/metiers" className="hover:text-ink">
          Métiers
        </Link>
        {` · ${metier.name}`}
      </nav>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">{metier.name}</h1>
      <p className="mt-2 text-sm text-muted">{jobs.length} offre{jobs.length > 1 ? "s" : ""} indexée{jobs.length > 1 ? "s" : ""}</p>
      {metier.intro.map((p) => (
        <p key={p.slice(0, 40)} className="mt-4 text-base leading-relaxed text-ink">
          {p}
        </p>
      ))}
      <section className="mt-10 rounded-xl border border-border bg-surface p-5">
        <p className="text-xs tracking-wide text-primary uppercase">Grille publique</p>
        <h2 className="mt-1 font-serif text-2xl">{grid.title}</h2>
        <p className="mt-2 text-sm text-muted">{grid.intro}</p>
        <ul className="mt-3 space-y-1 text-sm text-ink">
          {grid.fields.map((f) => (
            <li key={f.id}>
              {f.label} <span className="text-subtle">· poids {f.weight}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-12">
        <h2 className="font-serif text-2xl">Offres ouvertes</h2>
        <div className="mt-5 grid gap-4">
          {jobs.length === 0 && <p className="text-muted">Aucune offre active pour ce métier.</p>}
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
      <section className="mt-12">
        <h2 className="font-serif text-2xl">Villes</h2>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm">
          {SEM_CITIES.map((c) => (
            <li key={c.slug}>
              <Link to="/lieux/$city" params={{ city: c.slug }} className="text-primary">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <SeoFaq items={metier.faqs} />
    </article>
  );
}
