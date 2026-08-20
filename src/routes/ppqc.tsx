import { createFileRoute, Link } from "@tanstack/react-router";
import { Term } from "@/components/term";
import { listJobs } from "@/lib/jobs-fn";
import { BRAND_HOST } from "@/lib/origin";
import { ppqcPrice } from "@/lib/ppqc";
import { ldScript } from "@/lib/seo";

export const Route = createFileRoute("/ppqc")({
  loader: () => listJobs({ data: {} }),
  head: () => ({
    meta: [
      { title: "PPQC — payer le candidat qualifié, pas l’annonce | Vera" },
      {
        name: "description",
        content:
          "Publication gratuite. Paiement uniquement sur un candidat qui a réussi l’épreuve métier et la grille. Geo-Tension Pricing.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/ppqc` }],
    scripts: [ldScript({ "@context": "https://schema.org", "@type": "WebPage", name: "PPQC Vera", url: `${BRAND_HOST}/ppqc` })],
  }),
  component: function PpqcPage() {
    const jobs = Route.useLoaderData();
    const sample = jobs.slice(0, 8).map((j) => ({ job: j, price: ppqcPrice(j) }));
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-xs tracking-wide text-primary uppercase">Modèle</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
          <Term k="ppqc">Pay-Per-Qualified-Candidate</Term>
        </h1>
        <p className="mt-4 text-lg text-muted">
          Publier est gratuit, enrichissement et 360° inclus. Vous payez quand quelqu’un a tenu l’épreuve et la grille — pas un clic, pas un CV.
        </p>
        <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm leading-relaxed">
          <li>Offre en ligne, salaire publié, pacte signé. 0 €.</li>
          <li>Le candidat passe l’épreuve (2–3 min) et la grille publique.</li>
          <li>Score épreuve ≥ 1 et grille ≥ 55 : le profil est qualifié. Facture PPQC.</li>
          <li>Geo-Tension : plus le bassin est tendu, plus le profil vaut. Pas un CPM.</li>
        </ol>
        <h2 className="mt-12 font-serif text-2xl">Prix de bassin (démo)</h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {sample.map(({ job, price }) => (
            <li key={job.id} className="flex items-baseline justify-between gap-4 py-3">
              <Link to="/jobs/$slug" params={{ slug: job.slug }} className="min-w-0">
                <span className="font-medium">{job.title}</span>
                <span className="block text-xs text-muted">{job.city} · tension {price.tension}</span>
              </Link>
              <span className="shrink-0 font-serif text-2xl tabular-nums">{price.euros} €</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm">
          <Link to="/post" className="text-primary">Publier une offre</Link>
          {" · "}
          <Link to="/admin" className="text-primary">Console opérateur</Link>
        </p>
      </div>
    );
  },
});
