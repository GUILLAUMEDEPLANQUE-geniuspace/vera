import { createFileRoute, Link } from "@tanstack/react-router";
import { BRAND_HOST } from "@/lib/origin";
import { SEM_METIERS } from "@/lib/sem";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/metiers/")({
  head: () => ({
    meta: [
      { title: "Métiers — fiches SEO salaire, grille, pénurie | Vera" },
      {
        name: "description",
        content:
          "Technicien maintenance, électricien, auxiliaire de vie, BD Asie, staff engineer. Pages métiers Vera : marché, grille, offres.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/metiers` }],
    scripts: [
      ldScript(
        itemListJsonLd(
          "Métiers sur Vera",
          SEM_METIERS.map((m) => ({ name: m.name, url: `${BRAND_HOST}/metiers/${m.slug}` })),
        ),
      ),
    ],
  }),
  component: MetiersIndex,
});

function MetiersIndex() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">
          Vera
        </Link>
        {" · Métiers"}
      </nav>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">Fiches métiers</h1>
      <p className="mt-3 text-lg text-muted">
        Une URL par intention de recherche. Salaire, grille, rareté, offres liées. Google n’a plus à parser une landing
        Indeed.
      </p>
      <ul className="mt-10 space-y-6">
        {SEM_METIERS.map((m) => (
          <li key={m.slug}>
            <Link to="/metiers/$slug" params={{ slug: m.slug }} className="font-serif text-2xl text-ink hover:text-primary">
              {m.name}
            </Link>
            <p className="mt-1 text-sm text-muted">{m.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
