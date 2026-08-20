import { createFileRoute, Link } from "@tanstack/react-router";
import { LESSONS } from "@/lib/lessons";
import { BRAND_HOST } from "@/lib/origin";

export const Route = createFileRoute("/apprendre/")({
  head: () => ({
    meta: [
      { title: "Micro-apprentissage après l’épreuve | Vera" },
      {
        name: "description",
        content: "Diagnostic post-candidature : consignation, neutre, PAC, plafond de tournée. Pas un silence.",
      },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/apprendre` }],
  }),
  component: function ApprendreIndex() {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-xs tracking-wide text-primary uppercase">Après l’épreuve</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Le refus n’est pas un trou noir</h1>
        <p className="mt-3 text-lg text-muted">
          Score, geste manqué, module de 5–8 min. Puis vous rejouez l’épreuve. Indeed n’a aucun intérêt à faire ça.
        </p>
        <ul className="mt-10 space-y-6">
          {LESSONS.map((l) => (
            <li key={l.slug}>
              <p className="text-xs tracking-wide text-muted uppercase">{l.kicker} · {l.minutes} min</p>
              <Link to="/apprendre/$slug" params={{ slug: l.slug }} className="font-serif text-2xl hover:text-primary">
                {l.title}
              </Link>
              <p className="mt-1 text-sm text-muted">{l.body[0]}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  },
});
