import { createFileRoute, Link } from "@tanstack/react-router";
import { CompanyMark } from "@/components/company-mark";
import { Term } from "@/components/term";
import { Badge } from "@/components/ui/badge";
import { getHonorLeague } from "@/lib/jobs-fn";
import { honorCaption, honorTone } from "@/lib/pact";

export const Route = createFileRoute("/pacte")({
  loader: () => getHonorLeague(),
  component: PactePage,
});

function PactePage() {
  const houses = Route.useLoaderData();

  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Ce que les autres cachent</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] text-ink sm:text-7xl">
            Elles répondent,
            <br />
            ou ça se voit.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Publier sur Vera, c’est signer un <Term k="pacte">Pacte</Term> : une date de réponse, écrite. Si la maison
            manque, son <Term k="honneur">honneur</Term> baisse. Public. Les professionnels viennent ici pour ça — pas
            pour une autre liste d’offres.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <Rule
            title="Une date, pas une promesse"
            body="Chaque offre porte un délai (7, 10, 14 ou 21 jours). Votre suivi affiche le compte à rebours. Indeed n’a jamais osé ça : trop d’annonceurs à ménager."
          />
          <Rule
            title="L’honneur est un chiffre"
            body="Réponses à l’heure / dossiers clos. Atelier Nord : 98. Relais : 44. Ce n’est pas une note culture. C’est le respect du temps des gens."
          />
          <Rule
            title="Le Verdict dit de passer"
            body="Avant de postuler, Vera calcule si l’offre mérite vos heures : ghost, honneur, fourchette, longueur du process. Un « Passez » est un service, pas un échec."
          />
        </div>
      </section>

      <section className="border-t border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl">Ligue d’honneur</h2>
              <p className="mt-1 text-sm text-muted">Classement public. On ne vend pas une meilleure place.</p>
            </div>
            <Link to="/jobs" search={{ pacte: "solide" }} className="text-sm font-medium text-primary">
              Offres à pacte solide
            </Link>
          </div>
          <ol className="mt-8 divide-y divide-border rounded-xl border border-border bg-bg">
            {houses.map((h, i) => (
              <li key={h.slug}>
                <Link
                  to="/companies/$slug"
                  params={{ slug: h.slug }}
                  className="flex items-center gap-4 px-4 py-4 sm:px-5"
                >
                  <span className="w-6 font-serif text-xl tabular-nums text-subtle">{i + 1}</span>
                  <CompanyMark name={h.name} slug={h.slug} className="size-11" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{h.name}</div>
                    <p className="text-xs text-muted">
                      {h.industry} · {h.honorDue === 0 ? "Nouveau pacte" : `${h.honorAnswered}/${h.honorDue} à l’heure`}{" "}
                      · SLA {h.responseSlaDays} j
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-3xl tabular-nums leading-none">{h.honorScore}</div>
                    <Badge tone={honorTone(h.honorScore)} className="mt-1">
                      {honorCaption(h.honorScore, h.honorDue)}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-serif text-3xl">Le Brief, pas le CV</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Une page : ce que vous avez livré, ce que vous refusez, la suite. Les maisons sur Vera reçoivent ça — pas un
          PDF de quatre pages et une photo. Les professionnels sérieux n’ont plus à se déguiser. Les recruteurs
          sérieux n’ont plus à trier du bruit.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link to="/me/brief" className="text-sm font-medium text-primary">
            Écrire votre brief
          </Link>
          <Link to="/jobs" className="text-sm font-medium text-primary">
            Voir les offres
          </Link>
        </div>
      </section>
    </div>
  );
}

function Rule({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-t border-border pt-5">
      <h3 className="font-serif text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
