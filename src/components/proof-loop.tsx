import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useLocale } from "@/lib/locale";
import { recordArenaAttempt } from "@/lib/passport-fn";
import { ARENAS, arenaOf, gradeArena, type Arena } from "@/lib/proof-arena";
import { cn } from "@/lib/utils";

export function ProofLoop({ initialId }: { initialId?: string }) {
  const [locale] = useLocale();
  const en = locale === "en";
  const [arenaId, setArenaId] = useState(initialId ?? "agents");
  const arena = useMemo(() => arenaOf(arenaId) ?? ARENAS[0]!, [arenaId]);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {ARENAS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setArenaId(a.id)}
            className={cn(
              "h-11 rounded-lg border px-4 text-sm",
              a.id === arenaId ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-ink",
            )}
          >
            {en ? a.titleEn : a.title}
          </button>
        ))}
      </div>
      <ArenaPlay key={arena.id} arena={arena} en={en} />
    </div>
  );
}

function ArenaPlay({ arena, en }: { arena: Arena; en: boolean }) {
  const { user } = useCurrentUserState();
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const result = done ? gradeArena(arena, picks) : null;
  const save = useMutation({
    mutationFn: () =>
      recordArenaAttempt({
        data: {
          arenaId: arena.id,
          score: result!.score,
          passed: result!.passed,
          missed: result!.missed,
          title: arena.skillTitle,
        },
      }),
    onSuccess: () => toast.success(en ? "Written to your passport" : "Inscrit au passport"),
    onError: () => toast.error(en ? "Sign in to keep the proof" : "Connectez-vous pour garder la preuve"),
  });

  const q = arena.questions[step];

  if (result) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-xs tracking-wide text-muted uppercase">{arena.standard}</p>
        <p className={cn("mt-2 font-serif text-5xl tabular-nums", result.passed ? "text-good" : "text-bad")}>
          {result.score}
        </p>
        <p className="mt-3 max-w-prose text-sm text-muted">
          {result.passed
            ? en
              ? "Held. The score travels with the application — that is what the company pays."
              : "Tenu. Le score part avec la candidature — c’est ce que l’entreprise paie."
            : en
              ? "Not a void. Failure opens a 8-minute module, then you retry. HackerRank would just reject you."
              : "Pas un trou noir. L’échec ouvre un module de 8 min, puis vous rejouez. HackerRank vous jetterait."}
        </p>
        {!result.passed && (
          <p className="mt-4">
            <Link to="/apprendre/$slug" params={{ slug: arena.lessonSlug }} className="text-sm font-medium text-primary">
              {en ? "Open the module, then retry" : "Ouvrir le module, puis rejouer"}
            </Link>
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => {
              setStep(0);
              setPicks([]);
              setDone(false);
            }}
            variant="secondary"
          >
            {en ? "Retry" : "Rejouer"}
          </Button>
          {user && (
            <Button type="button" onClick={() => save.mutate()} disabled={save.isPending}>
              {en ? "Stamp passport" : "Tamponner le passport"}
            </Button>
          )}
          {!user && (
            <Button asChild variant="secondary">
              <Link to="/login">{en ? "Sign in to keep it" : "Connexion pour le garder"}</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs tracking-wide text-primary uppercase">
        {arena.kicker} · {step + 1}/{arena.questions.length}
      </p>
      <h3 className="mt-2 font-serif text-2xl">{en ? q.promptEn : q.prompt}</h3>
      <p className="mt-2 text-sm text-muted">{en ? arena.briefEn : arena.brief}</p>
      <ul className="mt-5 space-y-2">
        {q.choices.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-left text-sm hover:border-primary"
              onClick={() => {
                const next = [...picks, c.id];
                setPicks(next);
                if (step + 1 >= arena.questions.length) setDone(true);
                else setStep(step + 1);
              }}
            >
              {en ? c.en : c.fr}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
