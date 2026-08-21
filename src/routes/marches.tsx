import { createFileRoute, Link } from "@tanstack/react-router";
import { COMPETITORS, MARKETS } from "@/lib/markets";
import { useLocale } from "@/lib/locale";
import { BRAND_HOST } from "@/lib/origin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/marches")({
  head: () => ({
    meta: [
      { title: "Expansion internationale | Vera" },
      {
        name: "description",
        content:
          "Ce qui voyage (skills-first, boucle échec→module, passeport, transparence salariale) et ce qui freine (localisation, crédibilité des épreuves, culture du test, GTM).",
      },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/marches` }],
  }),
  component: MarchesPage,
});

function MarchesPage() {
  const [locale] = useLocale();
  const en = locale === "en";
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">{en ? "International" : "International"}</p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
        {en ? "The idea travels. The product must be local." : "L’idée voyage. Le produit doit être local."}
      </h1>
      <p className="mt-4 text-lg text-muted">
        {en
          ? "Skills-first is global in 2026. A French editorial job board is not. Here is the friction, named — and what Vera already ships to meet it."
          : "Le skills-first est mondial en 2026. Un jobboard éditorial français ne l’est pas. Voici la friction, nommée — et ce que Vera livre déjà."}
      </p>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">{en ? "What travels" : "Ce qui voyage"}</h2>
        <ul className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
          <li>
            <span className="font-medium text-ink">{en ? "Degrees as a weak proxy." : "Le diplôme comme mauvais proxy."}</span>{" "}
            {en
              ? "US, EU, Canada, Asia drop degree filters. Assessments and passports are mainstream. Craft-first is the product, not a slogan."
              : "US, UE, Canada, Asie lâchent le filtre diplôme. Assessments et passports sont mainstream. Le geste d’abord est le produit, pas un slogan."}
          </li>
          <li>
            <span className="font-medium text-ink">{en ? "Fail → module → retry." : "Échec → module → retry."}</span>{" "}
            {en
              ? "HackerRank / Codility / LinkedIn Skills gatekeep. Vera turns a miss into a tagged 8-minute lesson. That is the rare human loop — and the recruiter argument against false negatives."
              : "HackerRank / Codility / LinkedIn Skills filtrent. Vera transforme l’échec en leçon taguée de 8 min. Boucle humaine rare — et argument recruteur contre les faux négatifs."}
          </li>
          <li>
            <span className="font-medium text-ink">{en ? "Talent Passport." : "Passeport."}</span>{" "}
            {en
              ? "Wallets and Open Badges exist (AbilityEx, T.R.U.S.T., SkillsFound). Almost none bind trial + application + fit into one artefact."
              : "Les wallets et Open Badges existent (AbilityEx, T.R.U.S.T., SkillsFound). Presque aucun n’attache épreuve + candidature + fit dans un artefact."}
          </li>
          <li>
            <span className="font-medium text-ink">{en ? "Pay transparency." : "Transparence salariale."}</span>{" "}
            {en
              ? "EU directive, German law, Irish GPG, spreading US states. Vera already rejects ads without a band. Ahead of the law is a feature."
              : "Directive UE, loi allemande, GPG irlandais, États US. Vera refuse déjà les offres sans bande. Être en avance est une fonctionnalité."}
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">{en ? "What still blocks" : "Ce qui freine encore"}</h2>
        <ol className="mt-4 space-y-5">
          <Block
            n="1"
            title={en ? "French localisation is not a translation" : "La localisation française n’est pas une traduction"}
            body={en
              ? "Cities, shortage trades, house voice, seed copy. An international product needs local trials, local reviewers, local salary law — the Europe is that layer, not Google Translate."
              : "Villes, métiers en pénurie, voix des entreprises, seed. Un produit international a besoin d’épreuves, de relecteurs, de droit salarial locaux — l’Europe est cette couche, pas Google Translate."}
          />
          <Block
            n="2"
            title={en ? "Trust in the trial" : "Confiance dans l’épreuve"}
            body={en
              ? "Companies will ask who signed the items, whether they are current, whether the 8-minute module works. /preuve now publishes reviewer, standard, n, pass rate."
              : "Les entreprises demanderont qui a signé, si c’est à jour, si le module tient. /preuve publie maintenant relecteur, norme, n, taux de réussite."}
          />
          <Block
            n="3"
            title={en ? "Cultural friction of a mandatory trial" : "Friction culturelle de l’épreuve obligatoire"}
            body={en
              ? "Tech/remote markets accept a 6-minute craft gate. Hierarchical or consensus cultures (parts of Asia, Spain, Sweden) may read it as aggression. Frame as shared proof; in guarded markets, trial after the brief, not before the first click."
              : "Le tech/remote accepte un portillon de 6 min. Les cultures hiérarchiques ou de consensus (Asie, Espagne, Suède) peuvent y voir de l’agressivité. Formuler « preuve partagée » ; marchés gardés : épreuve après le brief, pas avant le premier clic."}
          />
          <Block
            n="4"
            title={en ? "Network effects" : "Effets de réseau"}
            body={en
              ? "LinkedIn and Indeed own volume. Exit via a niche (industrial + tech + remote Europe), local partners, or a hard anti-AI-resume stance. Not via more listings."
              : "LinkedIn et Indeed tiennent le volume. Sortir par une niche (industrie + tech + remote Europe), des partenaires locaux, ou un angle anti-CV IA. Pas par plus d’annonces."}
          />
          <Block
            n="5"
            title={en ? "The field is not empty" : "Le terrain n’est pas vide"}
            body={en
              ? "Verification tools and skills-first boards exist. Almost none run the full loop. That is the only honest claim — not « no competitors »."
              : "Outils de vérif et jobboards skills-first existent. Presque aucun ne tient la boucle complète. C’est la seule claim honnête — pas « pas de concurrents »."}
          />
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">{en ? "Country notes" : "Notes par pays"}</h2>
        <ul className="mt-6 space-y-4">
          {MARKETS.map((m) => (
            <li key={m.code} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-serif text-xl">
                  {m.code} · {en ? m.nameEn : m.name}
                </h3>
                <span
                  className={cn(
                    "text-xs tracking-wide uppercase",
                    m.testCulture === "open" && "text-good",
                    m.testCulture === "mixed" && "text-warn",
                    m.testCulture === "guarded" && "text-bad",
                  )}
                >
                  {m.testCulture}
                </span>
              </div>
              <p className="mt-2 text-sm">{en ? m.desk : m.desk}</p>
              <p className="mt-2 text-sm text-muted">{en ? m.lawEn : m.law}</p>
              <p className="mt-2 text-sm text-muted">{en ? m.testNoteEn : m.testNote}</p>
              <p className="mt-2 text-sm">{en ? m.gtmEn : m.gtm}</p>
              <p className="mt-2 text-xs text-subtle">{m.partners.join(" · ")}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">{en ? "Honest gaps vs the field" : "Écarts honnêtes"}</h2>
        <ul className="mt-4 space-y-3">
          {COMPETITORS.map((c) => (
            <li key={c.name} className="rounded-xl border border-border p-4">
              <p className="font-medium">{c.name}</p>
              <p className="mt-1 text-sm text-muted">{c.gap}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm">
        <Link to="/europe" className="text-primary">
          {en ? "Open Europe" : "Voir l’Europe"}
        </Link>
        {" · "}
        <Link to="/preuve" className="text-primary">
          {en ? "Sit a trial" : "Passer une épreuve"}
        </Link>
      </p>
    </div>
  );
}

function Block({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs tabular-nums text-primary">{n}</p>
      <h3 className="mt-1 font-serif text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </li>
  );
}
