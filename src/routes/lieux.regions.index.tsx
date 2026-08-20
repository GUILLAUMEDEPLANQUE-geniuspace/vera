import { createFileRoute, Link } from "@tanstack/react-router";
import { BRAND_HOST } from "@/lib/origin";
import { REGIONS, tensionLabel } from "@/lib/geo";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/lieux/regions/")({
  head: () => ({
    meta: [
      { title: "Emplois par région — 18 régions, salaire publié | Vera" },
      {
        name: "description",
        content:
          "Île-de-France, Auvergne-Rhône-Alpes, Bretagne, PACA, DROM… Chaque région Vera : tension, index salarial, offres à salaire publié.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/lieux/regions` }],
    scripts: [
      ldScript(itemListJsonLd("Régions Vera", REGIONS.map((r) => ({ name: r.name, url: `${BRAND_HOST}/lieux/regions/${r.slug}` })))),
    ],
  }),
  component: RegionsIndex,
});

function RegionsIndex() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">Vera</Link>
        {" · "}
        <Link to="/lieux" className="hover:text-ink">Lieux</Link>
        {" · Régions"}
      </nav>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">18 régions</h1>
      <p className="mt-3 text-lg text-muted">
        Métropole, Corse, DROM. Une URL par région, des offres, un score de tension. Pas un filtre Indeed.
      </p>
      <ul className="mt-10 divide-y divide-border border-y border-border">
        {REGIONS.map((r) => (
          <li key={r.slug}>
            <Link to="/lieux/regions/$slug" params={{ slug: r.slug }} className="flex items-baseline justify-between gap-4 py-4">
              <span>
                <span className="font-serif text-2xl">{r.name}</span>
                <span className="ml-2 text-sm text-muted">{tensionLabel(r.tension)}</span>
              </span>
              <span className="text-sm tabular-nums text-subtle">{r.tension}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
