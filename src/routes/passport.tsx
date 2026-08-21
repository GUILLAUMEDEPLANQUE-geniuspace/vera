import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useLocale } from "@/lib/locale";
import { BRAND_HOST } from "@/lib/origin";
import { listMyPassport } from "@/lib/passport-fn";
import { ARENAS } from "@/lib/proof-arena";

export const Route = createFileRoute("/passport")({
  head: () => ({
    meta: [
      { title: "Passeport | Vera" },
      {
        name: "description",
        content:
          "Registre de preuves Vera : épreuves tenues, modules, scores. Export JSON. Pas un CV généré par IA.",
      },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/passport` }],
  }),
  component: PassportPage,
});

function PassportPage() {
  const [locale] = useLocale();
  const en = locale === "en";
  const { user, isPending } = useCurrentUserState();
  const q = useQuery({
    queryKey: ["passport"],
    queryFn: () => listMyPassport(),
    enabled: Boolean(user),
  });

  const held = (q.data?.ledger ?? []).filter((r) => r.passed);
  const payload = {
    type: "VeraTalentPassport",
    version: "2026.1",
    holder: user?.displayName ?? user?.primaryEmail ?? "anonymous",
    issued: new Date().toISOString().slice(0, 10),
    proofs: held.map((r) => ({
      skill: r.title,
      arena: r.arenaId,
      score: r.score,
      attempt: r.attemptNo,
      evidence: r.evidence,
      at: r.createdAt,
    })),
    lessons: q.data?.lessons ?? [],
  };

  function download() {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vera-passport.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">{en ? "Talent Passport" : "Passeport"}</p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
        {en ? "Proof you can take with you" : "Une preuve que vous emportez"}
      </h1>
      <p className="mt-4 text-lg text-muted">
        {en
          ? "Not a LinkedIn PDF. A ledger of held trials, modules, scores. Companies pay this file — AI-written CVs stay on Indeed."
          : "Pas un PDF LinkedIn. Un registre d’épreuves tenues, de modules, de scores. Les entreprises paient ce dossier — les CV IA restent sur Indeed."}
      </p>

      {isPending && <div className="mt-8 h-40 animate-pulse rounded-xl bg-paper" />}

      <SignedOut>
        <div className="mt-8 rounded-xl border border-border bg-surface p-6">
          <p className="text-sm text-muted">
            {en ? "Sign in to stamp trials onto a passport." : "Connectez-vous pour tamponner les épreuves."}
          </p>
          <Button asChild className="mt-4">
            <Link to="/login">{en ? "Sign in" : "Connexion"}</Link>
          </Button>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="mt-8 rounded-xl border border-border bg-surface p-6">
          <p className="text-xs tracking-wide text-muted uppercase">{en ? "Held proofs" : "Preuves tenues"}</p>
          {held.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              {en ? "None yet. Sit a trial first." : "Aucune encore. Passez une épreuve."}{" "}
              <Link to="/preuve" className="text-primary">
                /preuve
              </Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {held.map((r) => (
                <li key={r.id} className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted">
                      {r.evidence} · {en ? "attempt" : "essai"} {r.attemptNo}
                    </p>
                  </div>
                  <p className="font-serif text-2xl tabular-nums text-good">{r.score}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={download} disabled={held.length === 0}>
              {en ? "Export JSON" : "Exporter JSON"}
            </Button>
            <Button asChild variant="secondary">
              <Link to="/preuve">{en ? "Add a trial" : "Ajouter une épreuve"}</Link>
            </Button>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="font-serif text-2xl">{en ? "Attempt log" : "Journal d’essais"}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {(q.data?.attempts ?? []).map((a, i) => (
              <li key={`${a.arenaId}-${a.createdAt}-${i}`} className="flex justify-between gap-3 text-muted">
                <span>
                  {ARENAS.find((x) => x.id === a.arenaId)?.skillTitle ?? a.arenaId}
                  {a.missed.length ? ` · ${a.missed.join(", ")}` : ""}
                </span>
                <span className="tabular-nums">
                  {a.score}
                  {a.passed ? " · ok" : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </SignedIn>

      <aside className="mt-12 rounded-xl border border-border bg-paper p-5 text-sm text-muted">
        {en
          ? "Format is deliberately boring JSON (Open Badge-shaped). Interop with Credly / wallets comes after the loop is held — not before."
          : "Format volontairement plat (JSON façon Open Badge). L’interop Credly / wallets vient après la boucle tenue — pas avant."}
      </aside>
    </div>
  );
}
