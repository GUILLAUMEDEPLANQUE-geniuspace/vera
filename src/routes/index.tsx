import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Term } from "@/components/term";
import { JobCard } from "@/components/job-card";
import { SearchBar } from "@/components/search-bar";
import { Badge } from "@/components/ui/badge";
import { COLLECTIONS } from "@/lib/constants";
import { formatSalary } from "@/lib/format";
import { CITIES, DEPTS, REGIONS } from "@/lib/geo";
import { getFeatured, getHonorLeague, getMarketPulse } from "@/lib/jobs-fn";
import { BRAND_HOST } from "@/lib/origin";
import { honorCaption, honorTone } from "@/lib/pact";
import { PILLARS } from "@/lib/pillars";
import { SEM_CITIES, SEM_METIERS } from "@/lib/sem";
import { ldScript, websiteJsonLd } from "@/lib/seo";
import { VIVIERS } from "@/lib/viviers";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [pulse, featured, league] = await Promise.all([
      getMarketPulse(),
      getFeatured(),
      getHonorLeague(),
    ]);
    return { pulse, featured, league: league.slice(0, 5) };
  },
  head: () => ({
    meta: [
      { title: "Vera — l’emploi enfin lisible | Offres à salaire publié" },
      {
        name: "description",
        content:
          "Jobboard indépendant. Verdict avant candidature, pacte de réponse public, brief à la place du CV, grilles d’évaluation visibles. Pas de pubs, pas de ghost cachés.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Vera — l’emploi enfin lisible" },
      {
        property: "og:description",
        content: "Verdict, pacte, brief, offres augmentées. Indeed n’a aucun intérêt à faire ça.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: BRAND_HOST },
    ],
    links: [{ rel: "canonical", href: BRAND_HOST }],
    scripts: [ldScript(websiteJsonLd())],
  }),
  component: Home,
});

function Home() {
  const { pulse: p, featured, league } = Route.useLoaderData();

  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Jobboard indépendant</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] text-ink sm:text-7xl">
            L’emploi,
            <br />
            enfin lisible.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Vera dit aux professionnels quand passer leur chemin. <Term k="verdict">Verdict</Term> avant candidature,{" "}
            <Term k="pacte">pacte</Term> de réponse public, <Term k="brief">brief</Term> à la place du CV. Indeed n’a
            aucun intérêt à faire ça.
          </p>
          <div className="mt-8 max-w-2xl">
            <SearchBar />
          </div>
          <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat label="Offres actives" value={String(p.activeJobs)} />
            <Stat label="Salaires publiés" value={`${p.salaryPublishedPct}\u00a0%`} />
            <Stat label="Ghost signalés" value={String(p.ghostFlagged)} />
            <Stat
              label="Médiane haute"
              value={p.medianSalary ? formatSalary(p.medianSalary, p.medianSalary) : "—"}
            />
          </dl>
        </div>
      </section>

      <section className="border-b border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-serif text-3xl">Pourquoi les pros viennent ici</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Principle
              kicker="01"
              title="Le Verdict"
              titleNode={
                <>
                  Le <Term k="verdict">Verdict</Term>
                </>
              }
              body="Avant de postuler, on calcule si l’offre mérite vos heures : ghost, honneur, fourchette, longueur du process. Un « Passez » est le produit. Pas un bug."
              to="/jobs"
              cta="Lire une offre"
            />
            <Principle
              kicker="02"
              title="Le Pacte"
              titleNode={
                <>
                  Le <Term k="pacte">Pacte</Term>
                </>
              }
              body="L’entreprise s’engage à une date. Si elle manque, son honneur baisse — public, pas négociable. Les maisons sérieuses viennent pour le filtre. Les autres restent sur LinkedIn."
              to="/pacte"
              cta="Voir la ligue"
            />
            <Principle
              kicker="03"
              title="Le Brief"
              titleNode={
                <>
                  Le <Term k="brief">Brief</Term>
                </>
              }
              body="Une page : livré, refusé, suite. Pas un PDF de quatre pages. Les recruteurs lisent moins, et mieux. Vous n’avez plus à vous déguiser."
              to="/me/brief"
              cta="Écrire le vôtre"
            />
            <Principle
              kicker="04"
              title="L’épreuve avant le CV"
              titleNode={
                <>
                  L’<Term k="epreuve">épreuve</Term> avant le CV
                </>
              }
              body="Micro-simulation 2–3 min : diagnostic électrique, scénario de soin, planning chantier. Score public. Les coordonnées après, pas avant."
              to="/jobs"
              cta="Voir une épreuve"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">L’offre augmentée</p>
          <h2 className="mt-2 max-w-2xl font-serif text-3xl sm:text-4xl">
            Lire un poste comme on lit un outil — pas une fiche.
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Salaire contre le marché. Semaine réelle. Carrière en trois nœuds. Visite du lieu. Collègues au téléphone.
            Une épreuve avant le CV. Indeed ne peut pas faire ça : ses clients paient pour le volume.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Flagship
              slug="technicien-maintenance-releve"
              kicker="Relève · Fos"
              title="Technicien de maintenance"
              body="Presse, consignation, astreinte écrite. Épreuve machine. Chef d’équipe en 3 ans."
            />
            <Flagship
              slug="electricien-ombrieres-kora"
              kicker="Kora · Marseille"
              title="Électricien ombrières"
              body="Schéma à diagnostiquer. Visite chantier. Août : stop à 13h, c’est écrit."
            />
            <Flagship
              slug="aide-domicile-lise"
              kicker="Maison Lise · Lyon"
              title="Auxiliaire de vie"
              body="Cinq personnes par jour, pas neuf. Scénario de soin. Trajets payés."
            />
            <Flagship
              slug="business-developer-asie-northline"
              kicker="Northline · Amsterdam"
              title="Business developer Asie"
              body="Mandarin de négo, guanxi nommé, grille publique. Pénurie réelle."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">GeniusKnowledges</p>
          <h2 className="mt-2 max-w-2xl font-serif text-3xl sm:text-4xl">
            <Term k="savoirs">Savoirs</Term> : le métier s’écrit, puis mène à l’offre.
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Robotique, droit, compta, terrain, fit culturel. Si le geste manque, vous{" "}
            <Term k="preform">préformez</Term> 8 min, puis vous tenez l’
            <Term k="epreuve">épreuve</Term>. Le <Term k="drive">Drive</Term> porte la visite et le mode opératoire.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/savoirs" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Entrer dans Savoirs <ArrowRight className="size-3.5" />
            </Link>
            <Link to="/drive" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Ouvrir le Drive <ArrowRight className="size-3.5" />
            </Link>
            <Link to="/lexique" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Lexique <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Référencement</p>
              <h2 className="mt-2 font-serif text-3xl">Piliers — être la réponse, pas l’annonce</h2>
              <p className="mt-2 max-w-xl text-sm text-muted">
                Google, les ATS, les agents IA. Chaque guide cite des offres, des grilles, un scarcity score.
              </p>
            </div>
            <Link to="/guides" className="shrink-0 text-sm font-medium text-primary">
              Tous les guides
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <Link
                key={p.slug}
                to="/guides/$slug"
                params={{ slug: p.slug }}
                className="rounded-xl border border-border bg-bg p-5 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <p className="text-xs tracking-wide text-muted uppercase">{p.kicker}</p>
                <h3 className="mt-2 font-serif text-xl leading-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.excerpt}</p>
              </Link>
            ))}
            <Link
              to="/marche"
              className="rounded-xl border border-primary bg-primary p-5 text-primary-fg transition-transform duration-200 hover:-translate-y-0.5"
            >
              <p className="text-xs tracking-wide text-primary-fg/70 uppercase">Marché</p>
              <h3 className="mt-2 font-serif text-xl">Coaching, assessment, audit</h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-fg/80">
                Autour du recrutement, pas des pubs. Interculturel Asie, consignation, honneur.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Lieux</p>
              <h2 className="mt-2 font-serif text-3xl">18 régions, 101 départements, chaque bassin</h2>
              <p className="mt-2 text-sm text-muted">
                {CITIES.length} villes, {DEPTS.length} départements, {REGIONS.length} régions. Chaque URL : liste d’offres, tension, index salarial. Pas un filtre Indeed.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {SEM_CITIES.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to="/lieux/$city"
                      params={{ city: c.slug }}
                      className="inline-flex h-10 items-center rounded-full border border-border px-3 text-sm hover:border-primary"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
                <Link to="/lieux" className="inline-flex items-center gap-1 text-primary">
                  Toutes les villes <ArrowRight className="size-3.5" />
                </Link>
                <Link to="/lieux/regions" className="text-primary">
                  Régions
                </Link>
                <Link to="/lieux/departements" className="text-primary">
                  Départements
                </Link>
                <Link to="/tension" className="text-primary">
                  Carte de tension
                </Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Métiers</p>
              <h2 className="mt-2 font-serif text-3xl">Une URL par intention</h2>
              <p className="mt-2 text-sm text-muted">
                Technicien, BD Asie, staff : marché, grille, rareté. Google n’a plus à parser Indeed.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {SEM_METIERS.map((m) => (
                  <li key={m.slug}>
                    <Link
                      to="/metiers/$slug"
                      params={{ slug: m.slug }}
                      className="inline-flex h-10 items-center rounded-full border border-border px-3 text-sm hover:border-primary"
                    >
                      {m.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/metiers" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Toutes les fiches <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Ce qu’Indeed n’active pas</p>
          <h2 className="mt-2 font-serif text-3xl">Viviers, PPQC, preuves</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Seniors fractional, binômes, RSA, slashers, reprise. Publication gratuite, paiement sur candidat qualifié.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VIVIERS.map((v) => (
              <Link
                key={v.slug}
                to="/viviers/$slug"
                params={{ slug: v.slug }}
                className="rounded-xl border border-border bg-bg p-5 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <p className="text-xs tracking-wide text-muted uppercase">{v.kicker}</p>
                <h3 className="mt-2 font-serif text-xl leading-tight">{v.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.description}</p>
              </Link>
            ))}
            <Link
              to="/ppqc"
              className="rounded-xl border border-primary bg-primary p-5 text-primary-fg transition-transform duration-200 hover:-translate-y-0.5"
            >
              <p className="text-xs tracking-wide text-primary-fg/70 uppercase">Modèle</p>
              <h3 className="mt-2 font-serif text-xl">PPQC + geo-tension</h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-fg/80">
                Gratuit à publier. Vous payez un candidat qui a tenu l’épreuve, au prix du bassin.
              </p>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
            <Link to="/journal" className="text-primary">
              Journal — preuves
            </Link>
            <Link to="/tension" className="text-primary">
              Tension territoriale
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl">Collections</h2>
            <p className="mt-1 text-sm text-muted">Des listes éditoriales, pas des mots-clés achetés.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              to="/jobs"
              search={{ collection: c.slug }}
              className="rounded-xl border border-border bg-surface p-5 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="font-serif text-2xl text-ink">{c.label}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Voir <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
          <Link
            to="/post"
            className="rounded-xl border border-primary bg-primary p-5 text-primary-fg transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="font-serif text-2xl">Publier une offre</div>
            <p className="mt-2 text-sm leading-relaxed text-primary-fg/80">
              Salaire, compétences, pacte de réponse. Sinon, ce n’est pas une offre Vera.
            </p>
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl">Ligue d’honneur</h2>
              <p className="mt-1 text-sm text-muted">Qui tient sa date. Classement public.</p>
            </div>
            <Link to="/pacte" className="text-sm font-medium text-primary">
              Tout le pacte
            </Link>
          </div>
          <ol className="mt-8 divide-y divide-border rounded-xl border border-border bg-bg">
            {league.map((h, i) => (
              <li key={h.slug}>
                <Link
                  to="/companies/$slug"
                  params={{ slug: h.slug }}
                  className="flex items-center gap-4 px-4 py-3.5"
                >
                  <span className="w-5 font-serif text-lg tabular-nums text-subtle">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{h.name}</span>
                    <span className="text-sm text-muted"> · {h.industry}</span>
                  </div>
                  <Badge tone={honorTone(h.honorScore)}>{honorCaption(h.honorScore, h.honorDue)}</Badge>
                  <span className="font-serif text-2xl tabular-nums">{h.honorScore}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-3xl">À la une — pacte tenu</h2>
          <Link to="/jobs" search={{ pacte: "solide" }} className="text-sm font-medium text-primary">
            Offres solides
          </Link>
        </div>
        <div className="mt-8 grid gap-4">
          {featured.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-serif text-3xl tabular-nums text-ink">{value}</dd>
    </div>
  );
}

function Principle({
  kicker,
  title,
  titleNode,
  body,
  to,
  cta,
}: {
  kicker: string;
  title: string;
  titleNode?: ReactNode;
  body: string;
  to: "/jobs" | "/pacte" | "/me/brief" | "/savoirs";
  cta: string;
}) {
  return (
    <div className="border-t border-border pt-5">
      <p className="text-xs tracking-wide text-subtle">{kicker}</p>
      <h3 className="mt-1 font-serif text-2xl">{titleNode ?? title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      <Link to={to} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
        {cta} <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function Flagship({
  slug,
  kicker,
  title,
  body,
}: {
  slug: string;
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      to="/jobs/$slug"
      params={{ slug }}
      className="rounded-xl border border-border bg-surface p-5 transition-transform duration-200 hover:-translate-y-0.5"
    >
      <p className="text-xs tracking-wide text-muted uppercase">{kicker}</p>
      <h3 className="mt-2 font-serif text-2xl leading-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
        Lire l’offre <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}
