import { createFileRoute, Link } from "@tanstack/react-router";
import { listJobs } from "@/lib/jobs-fn";
import { BRAND_HOST } from "@/lib/origin";
import { CITIES, DEPTS, EU_CITIES, REGIONS, placeOfCity, tensionLabel } from "@/lib/geo";
import { citySlug } from "@/lib/sem";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/lieux/")({
  loader: async () => listJobs({ data: {} }),
  head: () => ({
    meta: [
      { title: "Emplois par ville, département, région — geo SEO | Vera" },
      {
        name: "description",
        content:
          "18 régions, 101 départements, préfectures et bassins. Chaque page : offres à salaire publié, tension, index salarial. Vera 2026.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/lieux` }],
    scripts: [
      ldScript(
        itemListJsonLd("Territoires Vera", [
          { name: "Régions", url: `${BRAND_HOST}/lieux/regions` },
          { name: "Départements", url: `${BRAND_HOST}/lieux/departements` },
          ...REGIONS.map((r) => ({ name: r.name, url: `${BRAND_HOST}/lieux/regions/${r.slug}` })),
        ]),
      ),
    ],
  }),
  component: LieuxIndex,
});

function LieuxIndex() {
  const jobs = Route.useLoaderData();
  const counts = new Map<string, number>();
  for (const j of jobs) {
    const s = citySlug(j.city);
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  const withJobs = CITIES.filter((c) => (counts.get(c.slug) ?? 0) > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">Vera</Link>
        {" · Lieux"}
      </nav>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">Le territoire, pas le filtre</h1>
      <p className="mt-3 text-lg text-muted">
        18 régions, 101 départements, préfectures et bassins d’emploi. Chaque URL a des offres, un index salarial, une tension. Google et les agents n’ont plus à parser Indeed.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link to="/lieux/regions" className="text-primary">18 régions</Link>
        <Link to="/lieux/departements" className="text-primary">101 départements</Link>
        <Link to="/tension" className="text-primary">Carte de tension</Link>
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Bassins avec offres</h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {withJobs.map((c) => {
            const p = placeOfCity(c.name);
            return (
              <li key={c.slug}>
                <Link to="/lieux/$city" params={{ city: c.slug }} className="flex items-baseline justify-between gap-4 py-3">
                  <span>
                    <span className="font-serif text-xl">{c.name}</span>
                    {p && <span className="ml-2 text-sm text-muted">{p.dept.code} · {p.region.name}</span>}
                  </span>
                  <span className="text-sm tabular-nums text-subtle">{counts.get(c.slug)} offres</span>
                </Link>
              </li>
            );
          })}
          {EU_CITIES.map((c) => (
            <li key={c.slug}>
              <Link to="/lieux/$city" params={{ city: c.slug }} className="flex items-baseline justify-between gap-4 py-3">
                <span>
                  <span className="font-serif text-xl">{c.name}</span>
                  <span className="ml-2 text-sm text-muted">{c.country}</span>
                </span>
                <span className="text-sm tabular-nums text-subtle">{counts.get(c.slug) ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Toutes les villes</h2>
        <p className="mt-2 text-sm text-muted">
          {CITIES.length} pages. Préfectures + bassins. Chaque URL liste les offres locales, le département, le remote.
        </p>
        {REGIONS.map((r) => {
          const codes = new Set(DEPTS.filter((d) => d.region === r.slug).map((d) => d.code));
          const cities = CITIES.filter((c) => codes.has(c.dept));
          if (!cities.length) return null;
          return (
            <div key={r.slug} className="mt-6">
              <h3 className="font-serif text-xl">
                <Link to="/lieux/regions/$slug" params={{ slug: r.slug }} className="hover:text-primary">
                  {r.name}
                </Link>
              </h3>
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {cities.map((c) => (
                  <li key={c.slug}>
                    <Link to="/lieux/$city" params={{ city: c.slug }} className="text-primary">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Régions</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {REGIONS.map((r) => (
            <li key={r.slug}>
              <Link to="/lieux/regions/$slug" params={{ slug: r.slug }} className="text-primary">
                {r.name}
              </Link>
              <span className="text-sm text-subtle"> · {tensionLabel(r.tension)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Départements</h2>
        <p className="mt-2 text-sm text-muted">{DEPTS.length} pages. Une par code INSEE.</p>
        <p className="mt-3">
          <Link to="/lieux/departements" className="text-primary">
            Voir les 101 départements
          </Link>
        </p>
      </section>
    </div>
  );
}
