import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { interviewPrep } from "@/lib/ai-fn";

const PRESETS = [
  "Prépare-moi la question d’ouverture, calée sur le style de cette maison.",
  "Quel piège interculturel dois-je éviter ici ?",
  "Aide-moi à raconter un échec sans me saborder, dans cette culture.",
];

export function InterviewPrep({ jobId, signedIn }: { jobId: number; signedIn: boolean }) {
  const [question, setQuestion] = useState(PRESETS[0]!);
  const [out, setOut] = useState<string | null>(null);
  const m = useMutation({
    mutationFn: () => interviewPrep({ data: { jobId, question } }),
    onSuccess: (res) => {
      if (res.ok) setOut(res.text);
      else toast.error(res.error);
    },
  });

  return (
    <section id="prep" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Entretien</p>
      <h2 className="mt-2 font-serif text-2xl">Préparation adaptée à la maison</h2>
      <p className="mt-2 text-sm text-muted">
        Lettre, piège interculturel, réponse type. L’assistant ne tourne pas tout seul — vous demandez.
      </p>
      {!signedIn ? (
        <p className="mt-4 text-sm text-muted">
          <Link to="/login" className="text-primary">
            Connectez-vous
          </Link>{" "}
          pour une prep calée sur la culture.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setQuestion(p)}
                className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-muted hover:border-primary hover:text-ink"
              >
                {p}
              </button>
            ))}
          </div>
          <Textarea
            className="mt-3 min-h-24"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button className="mt-3" disabled={m.isPending || question.trim().length < 8} onClick={() => m.mutate()}>
            {m.isPending ? "Préparation…" : "Préparer l’entretien"}
          </Button>
        </>
      )}
      {out && <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">{out}</p>}
    </section>
  );
}
