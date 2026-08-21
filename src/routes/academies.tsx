import { createFileRoute, Link } from "@tanstack/react-router";
import { CompanyMark } from "@/components/company-mark";
import { Term } from "@/components/term";
import { Badge } from "@/components/ui/badge";
import { listAcademies } from "@/lib/academy-fn";
import { BRAND_HOST } from "@/lib/origin";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/academies")({
  loader: () => listAcademies(),
  head: ({ loaderData }) => {
    const houses = loaderData ?? [];
    return {
      meta: [
        { title: "Académies entreprises — formation salariés | Vera" },
        {
          name: "description",
          content:
            "Chaque entreprise Vera a son académie : parcours salariés, modules candidats, attestations. Branchée sur la fiche entreprise, pas un LMS déconnecté.",
        },
        { name: "robots", content: "index,follow" },
      ],
      links: [{ rel: "canonical", href: `${BRAND_HOST}/academies` }],
      scripts: [
        ldScript(
          itemListJsonLd(
            "Académies Vera",
            houses.map((h) => ({
              name: `Académie ${h.name}`,
              url: `${BRAND_HOST}/companies/${h.slug}/academie`,
            })),
          ),
        ),
      ],
    };
  },
  component: AcademiesPage,
});

function AcademiesPage() {
  const houses = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Formation salariés</p>
      <h1 className="mt-2 font-serif text-4xl sm:text-6xl">L’académie est sur la fiche entreprise.</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Pas un LMS à côté. Chaque client Vera a son espace formation, relié à sa page : parcours obligatoires,
        modules métier, <Term k="attestation">attestations</Term>. Le candidat voit ce que le salarié tient.
      </p>
      <p className="mt-3 text-sm text-muted">
        Salarié : rejoignez l’académie de votre maison, tenez les modules, exportez l’attestation.{" "}
        <Link to="/me/formation" className="text-primary">
          Mon espace formation
        </Link>
        . Recruteur :{" "}
        <Link to="/me/academie" className="text-primary">
          pilotez le catalogue
        </Link>
        .
      </p>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2">
        {houses.map((h) => (
          <li key={h.slug}>
            <Link
              to="/companies/$slug/academie"
              params={{ slug: h.slug }}
              className="flex h-full items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <CompanyMark name={h.name} slug={h.slug} className="size-14 text-lg" />
              <div className="min-w-0 flex-1">
                <p className="text-xs tracking-wide text-muted uppercase">{h.industry}</p>
                <h2 className="font-serif text-2xl">{h.name}</h2>
                <p className="mt-2 text-sm text-muted">
                  {h.courseCount} parcours · {h.memberCount} salarié{h.memberCount > 1 ? "s" : ""} · {h.hqCity}
                </p>
              </div>
              <Badge tone="primary">{h.honorScore}</Badge>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
