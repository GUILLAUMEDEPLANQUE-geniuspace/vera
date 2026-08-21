import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { PactBadge } from "@/components/pact-badge";
import { Term } from "@/components/term";

const companyRoute = getRouteApi("/companies/$slug");

export const Route = createFileRoute("/companies/$slug/preuves")({
  head: ({ params }) => ({
    meta: [{ title: `Preuves — ${params.slug} | Vera` }],
  }),
  component: PreuvesTab,
});

function PreuvesTab() {
  const data = companyRoute.useLoaderData();
  if (!data) return null;
  const { company, proofs, academy } = data;
  const hired = proofs.hires.reduce((n, h) => n + h.hired, 0);
  return (
    <div>
      <p className="text-xs tracking-wide text-primary uppercase">Preuve employeur</p>
      <h2 className="mt-1 font-serif text-3xl">Combien de tenus ont été embauchés</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Un slogan L&D ne suffit pas. Ici le décompte public : modules tenus, parcours finis, embauches issues du geste.
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ProofStat k="Embauches via module" v={String(hired)} />
        <ProofStat k="Parcours tenus" v={String(proofs.completed)} />
        <ProofStat k="Inscriptions" v={String(proofs.held)} />
        <ProofStat k="Honneur" v={String(company.honorScore)} />
      </dl>

      <div className="mt-8 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <PactBadge honor={company.honorScore} slaDays={company.responseSlaDays} due={company.honorDue} />
        <p className="mt-3 text-sm text-muted">
          Le pacte mesure les réponses. Cette page mesure les gestes tenus. Les deux restent publics.
        </p>
      </div>

      <h3 className="mt-12 font-serif text-2xl">Parcours qui ont débouché</h3>
      {proofs.hires.length === 0 && (
        <p className="mt-3 text-sm text-muted">Pas encore d’embauche attribuée à un module — le compteur restera à zéro plutôt que d’inventer.</p>
      )}
      <ul className="mt-4 space-y-3">
        {proofs.hires.map((h) => (
          <li key={h.course_slug} className="flex items-baseline justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3">
            <div>
              <Link
                to="/companies/$slug/academie/$course"
                params={{ slug: company.slug, course: h.course_slug }}
                className="font-serif text-xl hover:text-primary"
              >
                {h.title}
              </Link>
              <p className="text-xs text-muted">{h.held} tenus · {h.hired} embauchés</p>
            </div>
            <p className="font-serif text-3xl tabular-nums text-primary">{h.hired}</p>
          </li>
        ))}
      </ul>

      <section className="mt-12 space-y-4 text-sm leading-relaxed text-muted">
        <p>
          <Term k="preform">Préformation</Term> : un module tenu monte la grille et le brief, pas un badge cosmétique. Le signal de l’offre grimpe de 10 points.
        </p>
        <p>
          Formation salariés : catalogue public, quiz ≥ 70, attestation portable dans le passeport.
        </p>
        <p>
          Seniors et profils atypiques : les viviers restent nommés sur l’offre (CCK « vivier »), pas un programme « diversité » anonyme.
        </p>
        <p>
          Mobilité interne : le recruteur assigne, le salarié tient — dans{" "}
          <Link to="/me/academie" className="text-primary">
            l’espace académie
          </Link>
          .
        </p>
        <p>
          Argent public (POEI, CPF) : un OF partenaire plus tard. Pas un bouton « financer » ici — Vera n’est pas un organisme de formation.
        </p>
      </section>

      {academy && academy.courses.length > 0 && (
        <Link
          to="/companies/$slug/academie"
          params={{ slug: company.slug }}
          className="mt-8 inline-block text-sm font-medium text-primary"
        >
          Tenir un module de {company.name}
        </Link>
      )}
    </div>
  );
}

function ProofStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-border pt-3">
      <dt className="text-xs tracking-wide text-muted uppercase">{k}</dt>
      <dd className="mt-1 font-serif text-2xl tabular-nums">{v}</dd>
    </div>
  );
}
