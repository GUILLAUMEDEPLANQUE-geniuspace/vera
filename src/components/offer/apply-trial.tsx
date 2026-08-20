import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { OfferPack } from "@/lib/offer";
import { cn } from "@/lib/utils";

type Step = "lire" | "epreuve" | "envoyer";

export function ApplyTrial({
  pack,
  simOk,
  simScore,
  applied,
  applying,
  saved,
  quietRaised,
  briefReady,
  showLoginNudge,
  letter,
  onLetter,
  onApply,
  onSave,
  onQuiet,
  savePending,
  quietPending,
  letterPending,
  explainPending,
  onLetterAi,
  onExplain,
}: {
  pack: OfferPack;
  simOk: boolean | null;
  simScore: number | null;
  applied: boolean;
  applying: boolean;
  saved: boolean;
  quietRaised: boolean;
  briefReady: boolean;
  showLoginNudge: boolean;
  letter: string;
  onLetter: (v: string) => void;
  onApply: (score: number) => void;
  onSave: () => void;
  onQuiet: () => void;
  savePending: boolean;
  quietPending: boolean;
  letterPending: boolean;
  explainPending: boolean;
  onLetterAi: () => void;
  onExplain: () => void;
}) {
  const [step, setStep] = useState<Step>("lire");
  const [gateOk, setGateOk] = useState(false);
  const [gateTried, setGateTried] = useState(false);
  const [gatePicks, setGatePicks] = useState<Record<number, string>>({});

  function submitGate() {
    const ok = pack.gates.every((g, i) => g.choices.find((c) => c.id === gatePicks[i])?.ok);
    setGateTried(true);
    setGateOk(ok);
    if (ok) setStep(pack.sim ? "epreuve" : "envoyer");
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Candidature</p>
      <h2 className="mt-1 font-serif text-2xl">Trois portes</h2>
      <ol className="mt-3 flex flex-wrap gap-1.5 text-[11px] tracking-wide uppercase">
        {(["lire", "epreuve", "envoyer"] as Step[]).map((s) => (
          <li
            key={s}
            className={cn(
              "rounded-full px-2 py-0.5",
              step === s ? "bg-primary text-primary-fg" : "bg-paper text-muted",
            )}
          >
            {s === "lire" ? "1 · L’offre" : s === "epreuve" ? "2 · L’épreuve" : "3 · Envoyer"}
          </li>
        ))}
      </ol>

      {showLoginNudge && (
        <p className="mt-3 text-sm text-muted">
          <Link to="/login" className="text-primary">
            Connectez-vous
          </Link>{" "}
          pour passer les portes.
        </p>
      )}

      {step === "lire" && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted">Avez-vous lu le difficile ? Les maisons voient le score.</p>
          {pack.gates.map((g, i) => (
            <fieldset key={g.q} className="space-y-2">
              <legend className="text-sm font-medium text-ink">{g.q}</legend>
              {g.choices.map((c) => (
                <label key={c.id} className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`gate-${i}`}
                    className="size-4 accent-primary"
                    checked={gatePicks[i] === c.id}
                    onChange={() => setGatePicks((p) => ({ ...p, [i]: c.id }))}
                    suppressHydrationWarning
                  />
                  {c.text}
                </label>
              ))}
            </fieldset>
          ))}
          {gateTried && !gateOk && (
            <p className="text-xs text-bad">Relisez le bloc honnête. Une porte reste fermée.</p>
          )}
          <Button className="w-full" onClick={submitGate} disabled={Object.keys(gatePicks).length < pack.gates.length}>
            Ouvrir l’épreuve
          </Button>
        </div>
      )}

      {step === "epreuve" && (
        <div className="mt-4 space-y-3">
          {simOk == null ? (
            <>
              <p className="text-sm text-muted">
                L’épreuve est dans l’offre. Diagnostiquez, puis revenez. C’est le geste, pas le CV.
              </p>
              <a
                href="#epreuve"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-fg"
              >
                Aller à l’épreuve
              </a>
            </>
          ) : (
            <>
              <p className={cn("text-sm", simOk ? "text-good" : "text-warn")}>
                {simOk
                  ? `Épreuve tenue · ${simScore ?? "—"}/100.`
                  : `Épreuve ${simScore ?? "—"}/100 — vous pouvez envoyer. Le score suivra. Modules dans Apprendre.`}
              </p>
              {!simOk && (
                <Link to="/apprendre" className="block text-sm font-medium text-primary">
                  Diagnostic et micro-apprentissage
                </Link>
              )}
              <Button className="w-full" onClick={() => setStep("envoyer")}>
                Dernière porte
              </Button>
            </>
          )}
        </div>
      )}

      {step === "envoyer" && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted">
            Épreuve {simScore ?? "—"}/100{briefReady ? " · brief joint" : " · brief incomplet"}. Qualifié PPQC si épreuve ≥ 55 et grille ≥ 55.
          </p>
          <div className="flex gap-2">
            <Button className="flex-1" disabled={applied || applying} onClick={() => onApply(simScore ?? 0)}>
              {applied ? "Déjà envoyée" : "Envoyer le brief"}
            </Button>
            <Button variant="secondary" aria-label="Sauver" onClick={onSave} disabled={savePending}>
              {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
            </Button>
          </div>
          <Button variant={quietRaised ? "secondary" : "ghost"} className="w-full" disabled={quietPending} onClick={onQuiet}>
            <Hand className="size-4" />
            {quietRaised ? "Main levée" : "Lever la main — sans candidater"}
          </Button>
          <Textarea placeholder="Lettre courte (optionnelle)" value={letter} onChange={(e) => onLetter(e.target.value)} />
          <p className="text-xs text-muted">
            {briefReady ? (
              "Votre brief sera joint."
            ) : (
              <>
                Pas de brief complet.{" "}
                <Link to="/me/brief" className="text-primary">
                  L’écrire
                </Link>
                .
              </>
            )}
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="ghost" size="sm" disabled={letterPending} onClick={onLetterAi}>
              {letterPending ? "Rédaction…" : "Rédiger avec l’assistant"}
            </Button>
            <Button variant="ghost" size="sm" disabled={explainPending} onClick={onExplain}>
              {explainPending ? "Lecture…" : "Pourquoi ce signal"}
            </Button>
            <a href="#prep" className="text-center text-xs font-medium text-primary">
              Préparer l’entretien
            </a>
          </div>
        </div>
      )}
    </div>
  );
}