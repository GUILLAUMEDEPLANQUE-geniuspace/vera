import { createFileRoute, Link } from "@tanstack/react-router";
import { TermBang } from "@/components/term";
import { GLOSSARY } from "@/lib/glossary";
import { BRAND_HOST } from "@/lib/origin";

export const Route = createFileRoute("/lexique")({
  head: () => ({
    meta: [
      { title: "Lexique Vera — Verdict, Pacte, Brief, PPQC, Savoirs, Drive" },
      {
        name: "description",
        content:
          "Tous les mots Vera, expliqués pour le candidat et pour la maison : Verdict, Pacte, Brief, PPQC, vivier, épreuve, GeniusDrive, Savoirs.",
      },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/lexique` }],
  }),
  component: function Lexique() {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted">
          <Link to="/" className="hover:text-ink">
            Vera
          </Link>
          {" · "}
          Lexique
        </nav>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Lexique</h1>
        <p className="mt-3 text-lg text-muted">
          Chaque mot porte un{" "}
          <span className="term-bang inline-grid align-middle" aria-hidden>
            !
          </span>{" "}
          dans le produit. Ici, la fiche complète : définition, usage candidat, usage maison.
        </p>
        <ul className="mt-10 space-y-10">
          {GLOSSARY.map((t) => (
            <li key={t.key} id={t.key} className="border-t border-border pt-6">
              <h2 className="font-serif text-2xl">
                {t.label}
                <TermBang term={t} />
              </h2>
              <p className="mt-2 text-sm leading-relaxed">{t.definition}</p>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Candidat</dt>
                  <dd className="mt-1 text-sm text-muted">{t.candidate}</dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-muted uppercase">Maison</dt>
                  <dd className="mt-1 text-sm text-muted">{t.house}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    );
  },
});
