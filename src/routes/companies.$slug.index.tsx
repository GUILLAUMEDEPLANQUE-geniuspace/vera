import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { CultureRadar } from "@/components/culture-radar";
import { JobCard } from "@/components/job-card";
import { PactBadge } from "@/components/pact-badge";
import { SeoFaq } from "@/components/seo-faq";
import { Badge } from "@/components/ui/badge";
import { cultureOf } from "@/lib/culture";
import { servicesFor } from "@/lib/marketplace";
import { PILLARS } from "@/lib/pillars";
import { companyFaqs, companyLongform } from "@/lib/seo";

const companyRoute = getRouteApi("/companies/$slug");

export const Route = createFileRoute("/companies/$slug/")({
  component: PresentationTab,
});

function PresentationTab() {
  const data = companyRoute.useLoaderData();
  if (!data) return null;
  const { company, jobs, articles, academy, proofs } = data;
  const academyCourses = academy?.courses ?? [];
  const culture = cultureOf(company.slug);
  const faqs = companyFaqs(company, jobs.length, culture);
  const related = PILLARS.filter((p) => p.relatedCompanies.includes(company.slug));
  const services = servicesFor(company.slug);
  const longform = companyLongform(company, culture, jobs.length);
  const hired = proofs.hires.reduce((n, h) => n + h.hired, 0);

  return (
    <div>
      <p className="max-w-2xl text-lg leading-relaxed text-ink">{company.about}</p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <PactBadge honor={company.honorScore} slaDays={company.responseSlaDays} due={company.honorDue} />
        <p className="mt-3 max-w-xl text-sm text-muted">
          {company.honorDue === 0
            ? "Nouveau pacte : aucun dossier clos pour l’instant. L’honneur commencera au premier délai."
            : `${company.honorAnswered} réponses à l’heure sur ${company.honorDue} dossiers clos. Si l’entreprise manque une date, ce chiffre baisse.`}
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

      {hired > 0 && (
        <aside className="mt-8 rounded-xl border border-border bg-paper p-5">
          <p className="text-xs tracking-wide text-primary uppercase">Preuve employeur</p>
          <p className="mt-1 font-serif text-2xl">
            {hired} embauche{hired > 1 ? "s" : ""} issues d’un module tenu
          </p>
          <Link
            to="/companies/$slug/preuves"
            params={{ slug: company.slug }}
            className="mt-2 inline-block text-sm font-medium text-primary"
          >
            Voir le décompte
          </Link>
        </aside>
      )}

      {academyCourses.length > 0 && (
        <section className="mt-12">
          <p className="text-xs tracking-wide text-primary uppercase">Formation salariés</p>
          <h2 className="mt-1 font-serif text-3xl">Académie {company.name}</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            {academy?.company.memberCount ?? 0} salarié{(academy?.company.memberCount ?? 0) > 1 ? "s" : ""} ·{" "}
            {academyCourses.length} parcours branchés à cette fiche. Pas un LMS à côté.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {academyCourses.slice(0, 4).map((c) => (
              <li key={c.id}>
                <Link
                  to="/companies/$slug/academie/$course"
                  params={{ slug: company.slug, course: c.slug }}
                  className="block rounded-xl border border-border bg-surface p-4 hover:border-primary"
                >
                  <p className="text-xs tracking-wide text-muted uppercase">
                    {c.minutes} min{c.mandatory ? " · obligatoire" : ""}
                  </p>
                  <p className="mt-1 font-serif text-xl">{c.title}</p>
                  <p className="mt-1 text-sm text-muted">{c.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/companies/$slug/academie"
            params={{ slug: company.slug }}
            className="mt-4 inline-block text-sm font-medium text-primary"
          >
            Toute l’académie
          </Link>
        </section>
      )}

      {articles.length > 0 && (
        <section className="mt-12">
          <p className="text-xs tracking-wide text-primary uppercase">Journal de l’entreprise</p>
          <h2 className="mt-1 font-serif text-3xl">Blog — preuves, pas plaquette</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {articles.slice(0, 4).map((a) => (
              <li key={a.id} className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-xs tracking-wide text-muted uppercase">{a.kind}</p>
                <Link to="/journal/$slug" params={{ slug: a.slug }} className="mt-1 block font-serif text-2xl hover:text-primary">
                  {a.title}
                </Link>
                <p className="mt-1 text-sm text-muted">{a.excerpt}</p>
              </li>
            ))}
          </ul>
          <Link
            to="/companies/$slug/journal"
            params={{ slug: company.slug }}
            className="mt-4 inline-block text-sm font-medium text-primary"
          >
            Tout le journal
          </Link>
        </section>
      )}

      <section className="mt-12">
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

      {jobs.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-3xl">Offres ouvertes</h2>
          <div className="mt-6 grid gap-4">
            {jobs.slice(0, 3).map((job) => (
              <JobCard key={job.id} job={job} cck={data.cckByJob[job.id]} />
            ))}
          </div>
          {jobs.length > 3 && (
            <Link
              to="/companies/$slug/offres"
              params={{ slug: company.slug }}
              className="mt-4 inline-block text-sm font-medium text-primary"
            >
              Toutes les offres ({jobs.length})
            </Link>
          )}
        </section>
      )}

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
          <h2 className="font-serif text-2xl">Services autour de cette entreprise</h2>
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
