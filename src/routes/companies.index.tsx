import { createFileRoute, Link } from "@tanstack/react-router";
import { CompanyMark } from "@/components/company-mark";
import { Badge } from "@/components/ui/badge";
import { listCompanies } from "@/lib/jobs-fn";
import { honorCaption, honorTone } from "@/lib/pact";
import { BRAND_HOST } from "@/lib/origin";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/companies/")({
  loader: () => listCompanies(),
  head: ({ loaderData }) => {
    const companies = loaderData ?? [];
    return {
      meta: [
        { title: "Entreprises — honneur, culture, offres | Vera" },
        {
          name: "description",
          content:
            "Pages entreprise Vera : pacte de réponse, score d’honneur, culture cartographiée, grilles publiques. Classées par honneur, pas par brochure RH.",
        },
        { name: "robots", content: "index,follow" },
      ],
      links: [{ rel: "canonical", href: `${BRAND_HOST}/companies` }],
      scripts: [
        ldScript(
          itemListJsonLd(
            "Entreprises Vera",
            companies.map((c) => ({ name: c.name, url: `${BRAND_HOST}/companies/${c.slug}` })),
          ),
        ),
      ],
    };
  },
  component: CompaniesPage,
});

function CompaniesPage() {
  const companies = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl sm:text-5xl">Entreprises</h1>
      <p className="mt-2 max-w-xl text-muted">
        Classées par honneur — le respect des dates, pas la brochure RH.{" "}
        <Link to="/pacte" className="text-primary">
          Lire le pacte
        </Link>
        .
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {companies.map((c) => (
          <Link
            key={c.id}
            to="/companies/$slug"
            params={{ slug: c.slug }}
            className="rounded-xl border border-border bg-surface p-5 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-4">
              <CompanyMark name={c.name} slug={c.slug} className="size-14 text-lg" />
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-2xl">{c.name}</h2>
                <p className="mt-1 text-sm text-muted">{c.tagline}</p>
                <p className="mt-3 text-xs text-subtle">
                  {c.industry} · {c.hqCity} · {c.sizeBand} · {c.jobCount} offre{c.jobCount > 1 ? "s" : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-serif text-3xl tabular-nums leading-none">{c.honorScore}</div>
                <Badge tone={honorTone(c.honorScore)} className="mt-1">
                  {honorCaption(c.honorScore, c.honorDue)}
                </Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
