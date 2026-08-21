import { createFileRoute, Link } from "@tanstack/react-router";
import { Term } from "@/components/term";
import { BRAND_HOST } from "@/lib/origin";
import { itemListJsonLd, ldScript } from "@/lib/seo";
import { VIVIERS } from "@/lib/viviers";

export const Route = createFileRoute("/viviers/")({
  head: () => ({
    meta: [
      { title: "Profils oubliés — seniors, RSA, multi-activité, reprise | Vera" },
      {
        name: "description",
        content:
          "Seniors à la journée, binômes intergénérationnels, RSA et freins, multi-activité, salarié-repreneur. Pas des CVthèques.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/viviers` }],
    scripts: [ldScript(itemListJsonLd("Profils oubliés Vera", VIVIERS.map((v) => ({ name: v.name, url: `${BRAND_HOST}/viviers/${v.slug}` }))))],
  }),
  component: function ViviersIndex() {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-xs tracking-wide text-primary uppercase">
          <Term k="vivier">Profils oubliés</Term>
        </p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Ceux que Indeed n’active pas</h1>
        <p className="mt-3 text-lg text-muted">
          Seniors, RSA, multi-activité, binômes, reprise. Des offres écrites, pas des dispositifs en PDF.
        </p>
        <ul className="mt-10 space-y-6">
          {VIVIERS.map((v) => (
            <li key={v.slug}>
              <Link to="/viviers/$slug" params={{ slug: v.slug }} className="font-serif text-2xl text-ink hover:text-primary">
                {v.name}
              </Link>
              <p className="mt-1 text-sm text-muted">{v.description}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  },
});
