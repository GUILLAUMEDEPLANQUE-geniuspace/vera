import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MatchRing } from "@/components/match-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { completeModule, enrollCourse, getAcademyCourse, joinAcademy } from "@/lib/academy-fn";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BRAND_HOST } from "@/lib/origin";
import { courseJsonLd, ldScript } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/companies/$slug_/academie/$course")({
  loader: async ({ params }) =>
    getAcademyCourse({ data: { company: params.slug, course: params.course } }),
  head: ({ loaderData, params }) => {
    const d = loaderData;
    const origin = BRAND_HOST;
    const url = `${origin}/companies/${params.slug}/academie/${params.course}`;
    if (!d) return { meta: [{ title: "Parcours | Vera" }] };
    return {
      meta: [
        { title: `${d.course.title} — ${d.course.companyName} | Vera` },
        { name: "description", content: d.course.excerpt.slice(0, 170) },
        { name: "robots", content: "index,follow" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(
          courseJsonLd({
            title: d.course.title,
            description: d.course.excerpt,
            url,
            provider: d.course.companyName,
            minutes: d.course.minutes,
            audience: d.course.audience,
          }),
        ),
      ],
    };
  },
  component: CoursePage,
});

function CoursePage() {
  const { slug, course } = Route.useParams();
  const packed = Route.useLoaderData();
  const { user } = useCurrentUserState();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["academy-course", slug, course],
    queryFn: () => getAcademyCourse({ data: { company: slug, course } }),
    initialData: packed ?? undefined,
  });
  const data = q.data ?? packed;
  const firstOpen = data?.modules.find((m) => !m.done)?.id ?? data?.modules[0]?.id ?? 0;
  const [active, setActive] = useState(firstOpen);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [certOpen, setCertOpen] = useState(false);

  const current = useMemo(() => data?.modules.find((m) => m.id === active) ?? data?.modules[0], [data, active]);

  const join = useMutation({
    mutationFn: () => joinAcademy({ data: slug }),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error);
      toast.success("Académie rejointe");
      void qc.invalidateQueries({ queryKey: ["academy-course", slug, course] });
    },
  });
  const enroll = useMutation({
    mutationFn: () => enrollCourse({ data: data!.course.id }),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error);
      toast.success("Parcours ouvert");
      void qc.invalidateQueries({ queryKey: ["academy-course", slug, course] });
    },
  });
  const finish = useMutation({
    mutationFn: () =>
      completeModule({
        data: { moduleId: current!.id, answers: answers[current!.id] ?? [] },
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.completed ? "Parcours tenu" : `Module tenu · ${res.score}/100`);
      void qc.invalidateQueries({ queryKey: ["academy-course", slug, course] });
      void qc.invalidateQueries({ queryKey: ["my-formation"] });
      if (res.completed) setCertOpen(true);
      if (!res.completed && data) {
        const next = data.modules.find((m) => m.id !== current?.id && !m.done);
        if (next) setActive(next.id);
      }
    },
    onError: () => toast.error("Connexion requise"),
  });

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Parcours introuvable</h1>
        <Link to="/academies" className="mt-4 inline-block text-primary">
          Académies
        </Link>
      </div>
    );
  }

  const pct = data.enrollment?.progressPct ?? Math.round((data.modules.filter((m) => m.done).length / Math.max(1, data.modules.length)) * 100);
  const lockedEmployee = data.course.audience === "employee" && !data.member;
  const needsJoin = data.course.audience !== "candidate" && !data.member;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 max-w-2xl">
          <p className="text-xs tracking-wide text-primary uppercase">
            {data.course.minutes} min · {data.course.moduleCount} modules
            {data.course.mandatory ? " · obligatoire" : ""}
          </p>
          <h2 className="mt-2 font-serif text-4xl sm:text-5xl">{data.course.title}</h2>
          <p className="mt-3 text-lg text-muted">{data.course.excerpt}</p>
        </div>
        <MatchRing value={pct} />
      </div>

      {data.enrollment?.status === "completed" && (
        <aside className="mt-6 rounded-2xl border border-good/30 bg-surface p-5">
          <p className="text-xs tracking-wide text-good uppercase">Attestation</p>
          <p className="mt-1 font-serif text-2xl">Parcours tenu.</p>
          <Button type="button" size="sm" className="mt-3" onClick={() => setCertOpen(true)}>
            Voir l’attestation
          </Button>
        </aside>
      )}

      {needsJoin && (
        <aside className="mt-6 rounded-2xl border border-border bg-paper p-5">
          <p className="font-serif text-xl">Parcours salariés</p>
          <p className="mt-1 text-sm text-muted">
            Rejoignez l’académie de {data.course.companyName} pour tenir les modules et garder le score.
          </p>
          <Button className="mt-3" disabled={join.isPending} onClick={() => join.mutate()}>
            Rejoindre l’académie
          </Button>
        </aside>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <ol className="space-y-2">
          {data.modules.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setActive(m.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left text-sm",
                  active === m.id ? "border-primary bg-surface" : "border-border bg-transparent hover:bg-surface",
                )}
              >
                <span className={cn("mt-0.5 grid size-6 place-items-center rounded-full text-xs", m.done ? "bg-good text-primary-fg" : "bg-paper text-muted")}>
                  {m.done ? "✓" : i + 1}
                </span>
                <span>
                  <span className="block font-medium">{m.title}</span>
                  <span className="text-xs text-subtle">
                    {m.kicker} · {m.minutes} min
                    {m.score != null ? ` · ${m.score}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        {current && (
          <article className="rounded-2xl border border-border bg-surface p-5 sm:p-8">
            <p className="text-xs tracking-wide text-primary uppercase">
              {current.kicker} · {current.kind === "quiz" ? "Quiz" : current.kind === "drill" ? "Drill" : "Leçon"}
            </p>
            <h2 className="mt-2 font-serif text-3xl">{current.title}</h2>
            {current.body.split("\n\n").map((p) => (
              <p key={p.slice(0, 48)} className="mt-4 leading-relaxed">
                {p}
              </p>
            ))}

            {current.kind === "quiz" && current.questions.length > 0 && (
              <div className="mt-8 space-y-6">
                {current.questions.map((q, qi) => (
                  <fieldset key={q.q} className="rounded-xl border border-border p-4">
                    <legend className="px-1 text-sm font-medium">{q.q}</legend>
                    <div className="mt-3 space-y-2">
                      {q.choices.map((ch, ci) => {
                        const selected = (answers[current.id] ?? [])[qi] === ci;
                        return (
                          <label key={ch} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                            <input
                              type="radio"
                              name={`q-${current.id}-${qi}`}
                              className="size-4 accent-primary"
                              checked={selected}
                              onChange={() => {
                                const next = [...(answers[current.id] ?? [])];
                                next[qi] = ci;
                                setAnswers({ ...answers, [current.id]: next });
                              }}
                            />
                            {ch}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {current.done ? (
                <Badge tone="good">Module tenu{current.score != null ? ` · ${current.score}` : ""}</Badge>
              ) : lockedEmployee ? (
                <p className="text-sm text-muted">Rejoignez l’académie pour valider.</p>
              ) : (
                <>
                    {!data.enrollment && data.course.audience !== "employee" && (
                      <Button variant="secondary" disabled={enroll.isPending} onClick={() => enroll.mutate()}>
                        Ouvrir le parcours
                      </Button>
                    )}
                    <Button disabled={finish.isPending} onClick={() => finish.mutate()}>
                      {finish.isPending ? "Validation…" : current.kind === "quiz" ? "Valider le quiz" : "Marquer comme tenu"}
                    </Button>
                </>
              )}
            </div>
          </article>
        )}
      </div>

      {certOpen && user && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4" onClick={() => setCertOpen(false)}>
          <div
            className="max-w-lg rounded-2xl border border-border bg-bg p-8 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs tracking-wide text-primary uppercase">Attestation Vera</p>
            <h3 className="mt-2 font-serif text-3xl">{data.course.title}</h3>
            <p className="mt-3 text-muted">
              {user.displayName ?? user.primaryEmail} a tenu ce parcours chez {data.course.companyName}.
            </p>
            <p className="mt-2 text-sm text-subtle">
              {data.enrollment?.completedAt?.slice(0, 10) ?? "aujourd’hui"} · {data.course.minutes} min · score modules publics
            </p>
            <div className="mt-6 flex gap-2">
              <Button type="button" onClick={() => window.print()}>
                Imprimer
              </Button>
              <Button type="button" variant="secondary" onClick={() => setCertOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
