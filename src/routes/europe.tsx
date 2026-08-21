import { createFileRoute, Link } from "@tanstack/react-router";
import { JobCard } from "@/components/job-card";
import { Term } from "@/components/term";
import { listJobs } from "@/lib/jobs-fn";
import { useLocale } from "@/lib/locale";
import { MARKETS } from "@/lib/markets";
import { BRAND_HOST } from "@/lib/origin";

export const Route = createFileRoute("/europe")({
  loader: async () => {
    const jobs = await listJobs({ data: { collection: "remote", sort: "signal" } });
    const extra = await listJobs({ data: { country: "Germany", sort: "signal" } });
    const seen = new Set(jobs.map((j) => j.id));
    const merged = [...jobs];
    for (const j of extra) {
      if (!seen.has(j.id)) merged.push(j);
    }
    return { jobs: merged.slice(0, 12) };
  },
  head: () => ({
    meta: [
      { title: "Europe — proof before the degree | Vera" },
      {
        name: "description",
        content:
          "Remote Europe ±2h. Published salary. Craft trial, then a short module if you miss, then retry. Talent Passport, EU pay transparency.",
      },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/europe` }],
  }),
  component: EuropeDesk,
});

function EuropeDesk() {
  const { jobs } = Route.useLoaderData();
  const [locale] = useLocale();
  const en = locale === "en";
  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            {en ? "Europe" : "Europe"}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] sm:text-6xl">
            {en ? (
              <>
                Proof before
                <br />
                the degree.
              </>
            ) : (
              <>
                La preuve
                <br />
                avant le titre.
              </>
            )}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            {en
              ? "Same Vera loop, in the timezone that actually works: trial, miss → 8-minute module, retry, passport. Indeed sells volume. We sell a held file."
              : "La même boucle Vera, dans le fuseau qui tient : épreuve, échec → module de 8 min, retry, passeport. Indeed vend du volume. Nous vendons un dossier tenu."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/preuve"
              className="inline-flex h-12 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-fg"
            >
              {en ? "Sit a trial" : "Passer une épreuve"}
            </Link>
            <Link
              to="/jobs"
              search={{ collection: "remote" }}
              className="inline-flex h-12 items-center rounded-lg border border-border bg-surface px-5 text-sm font-medium"
            >
              {en ? "Remote ±2h roles" : "Offres remote ±2h"}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6">
          <Step
            n="01"
            title={en ? "The trial" : "L’épreuve"}
            body={en ? "6–8 min, craft not HR. Contacts after, not before." : "6–8 min, geste pas QCM RH. Coordonnées après."}
          />
          <Step
            n="02"
            title={en ? "Miss → module" : "Échec → module"}
            body={en ? "Failure is a tagged lesson, then a retry. Not a black hole." : "L’échec est une leçon taguée, puis un retry. Pas un silence."}
          />
          <Step
            n="03"
            title={en ? "Passport" : "Passeport"}
            body={en ? "Exportable proof. Companies pay a qualified file, not a click." : "Preuve exportable. L’entreprise paie un qualifié, pas un clic."}
          />
        </div>
      </section>

      <section className="border-b border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-serif text-3xl">{en ? "Why this travels" : "Ce qui voyage"}</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            <Point
              title={en ? "Degrees are a weak proxy" : "Le diplôme est un mauvais proxy"}
              body={en
                ? "US, EU, Canada, Asia are dropping degree filters. Skills assessments, micro-credentials and passports are the new default. Vera’s craft-first loop is already that product."
                : "US, UE, Canada, Asie lâchent le filtre diplôme. Assessments, micro-credentials, passports : Vera est déjà ce produit, avec un geste métier."}
            />
            <Point
              title={en ? "Fail → learn → retry" : "Échec → module → retry"}
              body={en
                ? "HackerRank and Codility gatekeep. Vera turns a miss into an 8-minute module. Recruiters short on talent hate false negatives — this is the argument."
                : "HackerRank et Codility filtrent. Vera transforme l’échec en module. Les recruteurs à court de geste détestent les faux négatifs."}
            />
            <Point
              title={en ? "Talent Passport" : "Passeport"}
              body={en
                ? "Open-Badge-shaped ledger: trial + application + fit score in one artefact. AbilityEx and SkillsFound verify; few attach the score to the hire."
                : "Registre façon Open Badge : épreuve + candidature + fit dans un artefact. AbilityEx vérifie ; peu attachent le score à l’embauche."}
            />
            <Point
              title={en ? "Pay transparency" : "Transparence salariale"}
              body={en
                ? "EU Pay Transparency Directive, German Entgelttransparenz, Irish GPG. Vera already refuses ads without a band. That is compliance as product, not a blog post."
                : "Directive UE, Entgelttransparenz, GPG irlandais. Vera refuse déjà les offres sans bande. La conformité est le produit."}
            />
          </ul>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl">{en ? "Markets, with friction named" : "Marchés, friction nommée"}</h2>
            <Link to="/marches" className="text-sm text-primary">
              {en ? "Expansion notes" : "Notes d’expansion"}
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MARKETS.map((m) => (
              <li key={m.code} className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs tabular-nums text-primary">{m.code}</p>
                <p className="mt-1 font-medium">{en ? m.nameEn : m.name}</p>
                <p className="mt-2 text-xs text-muted">{en ? m.testNoteEn : m.testNote}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-serif text-3xl">{en ? "Roles that already sit on the desk" : "Offres déjà sur le desk"}</h2>
        <p className="mt-2 max-w-xl text-muted">
          {en
            ? "Berlin, Amsterdam, Dublin, Stockholm, Munich — salary published, trial attached."
            : "Berlin, Amsterdam, Dublin, Stockholm, Munich — salaire publié, épreuve attachée."}
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">
          <Term k="desk">Europe</Term>
          {" · "}
          <Link to="/preuve" className="text-primary">
            {en ? "Try the loop" : "Essayer la boucle"}
          </Link>
        </p>
      </section>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs tabular-nums text-primary">{n}</p>
      <h3 className="mt-2 font-serif text-2xl">{title}</h3>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}

function Point({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-xl border border-border bg-bg p-5">
      <h3 className="font-serif text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </li>
  );
}
