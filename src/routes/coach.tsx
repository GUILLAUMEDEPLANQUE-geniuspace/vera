import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { careerCompass, interviewPrep } from "@/lib/ai-fn";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listJobs } from "@/lib/jobs-fn";

export const Route = createFileRoute("/coach")({ component: CoachPage });

const PROMPTS = [
  "Prépare-moi la question « parlez-moi d’un désaccord avec un PM ».",
  "Quelles sont les trois questions que je dois poser à la fin ?",
  "Aide-moi à raconter un échec sans me saborder.",
  "Prépare-moi l’entretien interculturel de cette maison : silence, face, non public.",
];

function CoachPage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="mx-auto max-w-3xl px-4 py-16"><div className="h-64 animate-pulse rounded-xl bg-paper" /></div>;
  if (!user) return <RedirectToSignIn />;
  return <CoachInner />;
}

function CoachInner() {
  const jobs = useQuery({ queryKey: ["jobs-coach"], queryFn: () => listJobs({ data: { sort: "recent" } }) });
  const [jobId, setJobId] = useState<number | "">("");
  const [question, setQuestion] = useState(PROMPTS[0]!);
  const [answer, setAnswer] = useState<string | null>(null);
  const [compass, setCompass] = useState<string | null>(null);

  const prep = useMutation({
    mutationFn: () =>
      interviewPrep({
        data: { question, jobId: jobId === "" ? undefined : jobId },
      }),
    onSuccess: (res) => {
      if (res.ok) setAnswer(res.text);
      else toast.error(res.error);
    },
  });

  const compassM = useMutation({
    mutationFn: () => careerCompass(),
    onSuccess: (res) => {
      if (res.ok) setCompass(res.text);
      else toast.error(res.error);
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Assistant</p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Coach</h1>
      <p className="mt-3 text-muted">
        Préparation d’entretien et boussole de carrière. Un clic, une réponse — pas un chatbot qui tourne à vide.
      </p>

      <section className="mt-10 rounded-xl border border-border bg-surface p-5 sm:p-7">
        <h2 className="font-serif text-2xl">Entretien</h2>
        <label className="mt-4 block text-sm">
          <span className="text-muted">Offre (optionnel)</span>
          <select
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm"
            value={jobId}
            onChange={(e) => setJobId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Sans offre précise</option>
            {jobs.data?.slice(0, 24).map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} · {j.company.name}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setQuestion(p)}
              className="rounded-full border border-border bg-bg px-3 py-1.5 text-left text-xs text-muted hover:text-ink"
            >
              {p}
            </button>
          ))}
        </div>
        <Textarea className="mt-3" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <Button className="mt-3" disabled={prep.isPending || !question.trim()} onClick={() => prep.mutate()}>
          {prep.isPending ? "Préparation…" : "Préparer la réponse"}
        </Button>
        {answer && <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-ink">{answer}</p>}
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5 sm:p-7">
        <h2 className="font-serif text-2xl">Boussole</h2>
        <p className="mt-2 text-sm text-muted">
          Trois directions parmi les offres Vera, à partir de{" "}
          <Link to="/me" className="text-primary">
            votre profil
          </Link>
          .
        </p>
        <Button className="mt-4" variant="secondary" disabled={compassM.isPending} onClick={() => compassM.mutate()}>
          {compassM.isPending ? "Lecture du marché…" : "Où regarder"}
        </Button>
        {compass && <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-ink">{compass}</p>}
      </section>
    </div>
  );
}
