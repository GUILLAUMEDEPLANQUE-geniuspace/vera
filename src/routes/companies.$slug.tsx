import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CompanyMark } from "@/components/company-mark";
import { CultureRadar } from "@/components/culture-radar";
import { JobCard } from "@/components/job-card";
import { PactBadge } from "@/components/pact-badge";
import { SeoFaq } from "@/components/seo-faq";
import { Badge } from "@/components/ui/badge";
import { cultureOf } from "@/lib/culture";
import { getCompany } from "@/lib/jobs-fn";
import { listArticlesByCompany } from "@/lib/journal-fn";
import { servicesFor } from "@/lib/marketplace";
import { BRAND_HOST } from "@/lib/origin";
import { PILLARS } from "@/lib/pillars";
import { cityOfSlug, citySlug } from "@/lib/sem";
import {
  companyDescriptionTag,
  companyFaqs,
  companyJsonLd,
  companyLongform,
  companyTitleTag,
  ldScript,
} from "@/lib/seo";

export const Route = createFileRoute("/companies/$slug")({
  loader: async ({ params }) => {
    const data = await getCompany({ data: params.slug });
    if (!data) return null;
    const articles = await listArticlesByCompany({ data: data.company.id });
    return { ...data, articles };
  },
  head: ({ loaderData }) => {
    const data = loaderData;
    if (!data) return { meta: [{ title: "Maison | Vera" }] };
    const { company, jobs } = data;
    const origin = BRAND_HOST;
    const culture = cultureOf(company.slug);
    return {
      meta: [
        { title: companyTitleTag(company) },
        { name: "description", content: companyDescriptionTag(company, jobs.length).slice(0, 170) },
        { name: "robots", content: "index,follow,max-image-preview:large" },
        { property: "og:title", content: companyTitleTag(company) },
        { property: "og:description", content: companyDescriptionTag(company, jobs.length).slice(0, 170) },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: `${origin}/companies/${company.slug}` },
      ],
      links: [
        { rel: "canonical", href: `${origin}/companies/${company.slug}` },
        { rel: "alternate", type: "text/markdown", href: `${origin}/feed/maisons/${company.slug}.md` },
      ],
      scripts: companyJsonLd(company, origin, jobs, culture).map(ldScript),
    };
  },
  component: CompanyPage,
});

function CompanyPage() {
  const { slug } = Route.useParams();
  const initial = Route.useLoaderData();
  const q = useQuery({
    queryKey: ["company", slug],
    queryFn: async () => {
      const data = await getCompany({ data: slug });
      if (!data) return null;
      const articles = await listArticlesByCompany({ data: data.company.id });
      return { ...data, articles };
    },
    initialData: initial ?? undefined,
  });
  const data = q.data ?? initial;

  if (!data && q.isPending) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="h-80 animate-pulse rounded-xl bg-paper" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Maison introuvable</h1>
        <Link to="/companies" className="mt-4 inline-block text-primary">
          Toutes les entreprises
        </Link>
      </div>
    );
  }

  const { company, jobs } = data;
  const articles = "articles" in data && Array.isArray(data.articles) ? data.articles : [];
  const culture = cultureOf(company.slug);
  const faqs = companyFaqs(company, jobs.length, culture);
  const related = PILLARS.filter((p) => p.relatedCompanies.includes(company.slug));
  const services = servicesFor(company.slug);
  const longform = companyLongform(company, culture, jobs.length);
  const city = cityOfSlug(citySlug(company.hqCity));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">
          Vera
        </Link>
        {" · "}
        <Link to="/companies" className="hover:text-ink">
          Maisons
        </Link>
        {city && (
          <>
            {" · "}
            <Link to="/lieux/$city" params={{ city: city.slug }} className="hover:text-ink">
              {city.name}
            </Link>
          </>
        )}
        {" · "}
        {company.name}
      </nav>
      <div className="mt-4 flex items-start gap-5">
        <CompanyMark name={company.name} slug={company.slug} className="size-16 text-2xl" />
        <div>
          <p className="text-xs tracking-wide text-muted uppercase">{company.industry}</p>
          <h1 className="font-serif text-4xl sm:text-5xl">{company.name}</h1>
          <p className="mt-2 max-w-2xl text-lg text-muted">{company.tagline}</p>
        </div>
      </div>
      <p className="mt-8 max-w-2xl leading-relaxed text-ink">{company.about}</p>
      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Meta k="Siège" v={`${company.hqCity}, ${company.hqCountry}`} />
        <Meta k="Taille" v={company.sizeBand} />
        <Meta k="Fondée" v={company.foundedYear ? String(company.foundedYear) : "—"} />
        <Meta k="Interculturel" v={`${culture.intercultural}/100`} />
      </dl>
      <div className="mt-8 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <PactBadge honor={company.honorScore} slaDays={company.responseSlaDays} due={company.honorDue} />
        <p className="mt-3 max-w-xl text-sm text-muted">
          {company.honorDue === 0
            ? "Nouveau pacte : aucun dossier clos pour l’instant. L’honneur commencera au premier délai."
            : `${company.honorAnswered} réponses à l’heure sur ${company.honorDue} dossiers clos. Si la maison manque une date, ce chiffre baisse.`}
        </p>
        <Link to="/pacte" className="mt-3 inline-block text-sm font-medium text-primary">
          Comment le pacte fonctionne
        </Link>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {company.values.map((v) => (
          <Badge key={v} tone="primary">
            {v}
          </Badge>
        ))}
      </div>

      {articles.length > 0 && (
        <section className="mt-12">
          <p className="text-xs tracking-wide text-primary uppercase">Journal de la maison</p>
          <h2 className="mt-1 font-serif text-3xl">Blog — preuves, pas plaquette</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {articles.map((a) => (
              <li key={a.id} className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-xs tracking-wide text-muted uppercase">{a.kind}</p>
                <Link to="/journal/$slug" params={{ slug: a.slug }} className="mt-1 block font-serif text-2xl hover:text-primary">
                  {a.title}
                </Link>
                <p className="mt-1 text-sm text-muted">{a.excerpt}</p>
              </li>
            ))}
          </ul>
          <Link to="/journal" className="mt-4 inline-block text-sm font-medium text-primary">
            Tous les blogs maisons et carnets
          </Link>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Management et semaine</h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink">{culture.management}</p>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{culture.weekStyle}</p>
        <p className="mt-2 text-sm text-muted">Langues : {culture.languages.join(", ")}</p>
      </section>

      <div className="mt-10">
        <CultureRadar culture={culture} />
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Lecture complète</h2>
        <div className="mt-3 max-w-prose space-y-3 text-sm leading-relaxed text-ink">
          {longform.split("\n\n").map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
      </section>

      <h2 className="mt-14 font-serif text-3xl">Offres ouvertes</h2>
      <div className="mt-6 grid gap-4">
        {jobs.length === 0 && <p className="text-muted">Aucune offre en ce moment.</p>}
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-2xl">Guides liés</h2>
          <ul className="mt-4 space-y-3">
            {related.map((p) => (
              <li key={p.slug}>
                <Link to="/guides/$slug" params={{ slug: p.slug }} className="font-medium text-primary">
                  {p.title}
                </Link>
                <p className="text-sm text-muted">{p.excerpt}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {services.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-2xl">Services autour de cette maison</h2>
          <ul className="mt-4 space-y-3">
            {services.map((s) => (
              <li key={s.slug}>
                <Link to="/marche" hash={s.slug} className="font-medium text-primary">
                  {s.title}
                </Link>
                <span className="text-sm text-muted">
                  {" "}
                  · {s.vendor} · {s.price}
                </span>
                <p className="text-sm text-muted">{s.blurb}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <SeoFaq items={faqs} />
      <p className="mt-8 text-xs text-subtle">
        Version machine :{" "}
        <a className="text-primary" href={`/feed/maisons/${company.slug}.md`}>
          Markdown
        </a>
        {" · "}
        <a className="text-primary" href="/feed.json">
          feed.json
        </a>
      </p>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-border pt-3">
      <dt className="text-xs tracking-wide text-muted uppercase">{k}</dt>
      <dd className="mt-1 font-serif text-xl">{v}</dd>
    </div>
  );
}
