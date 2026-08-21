import { createFileRoute, Link } from "@tanstack/react-router";
import { BRAND_HOST } from "@/lib/origin";
import { SERVICES } from "@/lib/marketplace";
import { itemListJsonLd, ldScript } from "@/lib/seo";

const KIND: Record<(typeof SERVICES)[number]["kind"], string> = {
  coaching: "Coaching",
  assessment: "Assessment",
  formation: "Formation",
  audit: "Audit",
};

export const Route = createFileRoute("/marche")({
  head: () => ({
    meta: [
      { title: "Marché — coaching, assessment, formation autour du recrutement | Vera" },
      {
        name: "description",
        content:
          "Services autour du recrutement Vera : coaching interculturel Asie, assessment consignation, supervision soin, audit d’honneur, atelier brief.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/marche` }],
    scripts: [
      ldScript(
        itemListJsonLd(
          "Marché Vera",
          SERVICES.map((s) => ({ name: s.title, url: `${BRAND_HOST}/marche#${s.slug}` })),
        ),
      ),
    ],
  }),
  component: MarchePage,
});

function MarchePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">
          Vera
        </Link>
        {" · "}
        Marché
      </nav>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Marché</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Autour de l’offre : coaching interculturel, assessment métier, formation, audit de pacte. Pas des pubs
        Indeed. Des entreprises qui tiennent déjà un honneur.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {SERVICES.map((s) => (
          <article
            key={s.slug}
            id={s.slug}
            className="rounded-xl border border-border bg-surface p-6 scroll-mt-24"
          >
            <p className="text-xs tracking-wide text-muted uppercase">{KIND[s.kind]}</p>
            <h2 className="mt-1 font-serif text-2xl">{s.title}</h2>
            <p className="mt-1 text-sm text-muted">{s.vendor}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink">{s.blurb}</p>
            <p className="mt-4 font-serif text-2xl tabular-nums">{s.price}</p>
            {s.forHouses.length > 0 && (
              <p className="mt-3 text-xs text-subtle">
                Pensé pour{" "}
                {s.forHouses.map((slug, i) => (
                  <span key={slug}>
                    {i > 0 ? ", " : ""}
                    <Link to="/companies/$slug" params={{ slug }} className="text-primary">
                      {slug}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
