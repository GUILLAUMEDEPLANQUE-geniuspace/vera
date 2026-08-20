import { createFileRoute, Link } from "@tanstack/react-router";
import { BRAND_HOST } from "@/lib/origin";
import { DEPTS, REGIONS, tensionLabel } from "@/lib/geo";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/lieux/departements/")({
  head: () => ({
    meta: [
      { title: "Emplois par département — 101 départements | Vera" },
      {
        name: "description",
        content:
          "Les 101 départements français : offres à salaire publié, tension BMO, préfecture, bassin. Geo SEO Vera 2026.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/lieux/departements` }],
    scripts: [
      ldScript(
        itemListJsonLd(
          "Départements Vera",
          DEPTS.map((d) => ({ name: `${d.code} ${d.name}`, url: `${BRAND_HOST}/lieux/departements/${d.slug}` })),
        ),
      ),
    ],
  }),
  component: DeptsIndex,
});

function DeptsIndex() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">Vera</Link>
        {" · "}
        <Link to="/lieux" className="hover:text-ink">Lieux</Link>
        {" · Départements"}
      </nav>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">101 départements</h1>
      <p className="mt-3 text-lg text-muted">
        Chaque code INSEE a une page : offres du bassin, index salarial, métiers tendus. Google n’a plus à parser un filtre.
      </p>
      {REGIONS.map((r) => {
        const ds = DEPTS.filter((d) => d.region === r.slug);
        if (!ds.length) return null;
        return (
          <section key={r.slug} className="mt-10">
            <h2 className="font-serif text-2xl">
              <Link to="/lieux/regions/$slug" params={{ slug: r.slug }} className="hover:text-primary">
                {r.name}
              </Link>
            </h2>
            <ul className="mt-3 grid gap-1 sm:grid-cols-2">
              {ds.map((d) => (
                <li key={d.code}>
                  <Link to="/lieux/departements/$slug" params={{ slug: d.slug }} className="text-sm text-ink hover:text-primary">
                    <span className="tabular-nums text-subtle">{d.code}</span> {d.name}
                    <span className="text-subtle"> · {tensionLabel(d.tension)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
