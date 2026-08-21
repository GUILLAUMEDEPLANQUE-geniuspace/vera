import { createFileRoute, Link } from "@tanstack/react-router";
import { ProofLoop } from "@/components/proof-loop";
import { CREDIBILITY } from "@/lib/markets";
import { useLocale } from "@/lib/locale";
import { BRAND_HOST } from "@/lib/origin";

export const Route = createFileRoute("/preuve")({
  head: () => ({
    meta: [
      { title: "Épreuve → module → retry | Vera" },
      {
        name: "description",
        content:
          "Boucle Vera : épreuve métier 6 min. Si vous ratez, un module tagué, puis vous rejouez. Standards nommés, relecteurs métier, pas un QCM LinkedIn.",
      },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/preuve` }],
  }),
  component: PreuvePage,
});

function PreuvePage() {
  const [locale] = useLocale();
  const en = locale === "en";
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">{en ? "The loop" : "La boucle"}</p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
        {en ? "Miss, learn, retry. Not a void." : "Ratez, apprenez, rejouez. Pas un silence."}
      </h1>
      <p className="mt-4 text-lg text-muted">
        {en
          ? "HackerRank stops at the gate. Vera tags what you missed, opens an 8-minute module, then lets you sit the trial again. The passport only stamps a hold."
          : "HackerRank s’arrête au portillon. Vera tague le geste manqué, ouvre un module de 8 min, puis vous laisse rejouer. Le passeport ne tamponne qu’un tenu."}
      </p>

      <ol className="mt-8 grid gap-3 sm:grid-cols-3">
        <li className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs tabular-nums text-primary">1</p>
          <p className="mt-1 font-medium">{en ? "Trial" : "Épreuve"}</p>
          <p className="mt-1 text-xs text-muted">{en ? "Craft, 6 min, threshold 70." : "Geste, 6 min, seuil 70."}</p>
        </li>
        <li className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs tabular-nums text-primary">2</p>
          <p className="mt-1 font-medium">{en ? "Module" : "Module"}</p>
          <p className="mt-1 text-xs text-muted">{en ? "Only the missed tag." : "Seulement le tag loupé."}</p>
        </li>
        <li className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs tabular-nums text-primary">3</p>
          <p className="mt-1 font-medium">{en ? "Retry + stamp" : "Retry + tampon"}</p>
          <p className="mt-1 text-xs text-muted">{en ? "Passport, then apply." : "Passport, puis candidature."}</p>
        </li>
      </ol>

      <div className="mt-12">
        <h2 className="font-serif text-2xl">{en ? "Sit one now" : "Passez-en une"}</h2>
        <p className="mt-2 text-sm text-muted">
          {en
            ? "Lockout for the French industrial basin. Guardrails for remote Europe. Same product."
            : "Consignation pour le bassin industriel. Garde-fous pour le remote Europe. Le même produit."}
        </p>
        <div className="mt-6">
          <ProofLoop />
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-serif text-2xl">{en ? "Who signed the items" : "Qui a signé les items"}</h2>
        <p className="mt-2 text-sm text-muted">
          {en
            ? "Foreign companies will ask: who validated this, is it current, does the 8-minute module work? Here is the ledger."
            : "À l’étranger on demandera : qui a validé, est-ce à jour, le module tient-il ? Voici le registre."}
        </p>
        <ul className="mt-6 space-y-3">
          {CREDIBILITY.map((c) => (
            <li key={c.arena} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{c.standard}</p>
                <p className="text-xs tabular-nums text-muted">
                  n={c.n} · {c.passRate}% {en ? "pass" : "réussite"} · {c.reviewed}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted">{c.reviewer}</p>
              <p className="mt-2 text-sm">{c.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm">
        <Link to="/passport" className="text-primary">
          {en ? "Open the passport" : "Ouvrir le passport"}
        </Link>
        {" · "}
        <Link to="/europe" className="text-primary">
          {en ? "Europe" : "Europe"}
        </Link>
      </p>
    </div>
  );
}
