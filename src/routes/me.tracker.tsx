import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { daysUntil } from "@/lib/pact";
import { lessonOf } from "@/lib/lessons";
import { listMyApplications, updateApplicationStatus } from "@/lib/profile-fn";
import { STATUS_LABEL, STATUS_ORDER, type ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/me/tracker")({ component: TrackerPage });

function TrackerPage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-xl bg-paper" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <TrackerInner />;
}

function TrackerInner() {
  const qc = useQueryClient();
  const apps = useQuery({ queryKey: ["apps"], queryFn: () => listMyApplications() });
  const move = useMutation({
    mutationFn: (input: { id: number; status: ApplicationStatus }) => updateApplicationStatus({ data: input }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["apps"] });
      void qc.invalidateQueries({ queryKey: ["company"] });
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl">Suivi</h1>
      <p className="mt-2 max-w-xl text-muted">
        Chaque candidature porte un pacte. Le compte à rebours est le leur, pas le vôtre. Un retard baisse leur honneur.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-5">
        {STATUS_ORDER.map((status) => {
          const col = apps.data?.filter((a) => a.status === status) ?? [];
          return (
            <section key={status} className="rounded-xl border border-border bg-surface p-3">
              <h2 className="px-1 text-xs font-medium tracking-wide text-muted uppercase">
                {STATUS_LABEL[status]}
                <span className="ml-1 tabular-nums">({col.length})</span>
              </h2>
              <div className="mt-3 space-y-2">
                {col.map((app) => {
                  const left = daysUntil(app.dueAt);
                  return (
                    <article key={app.id} className="rounded-lg border border-border bg-bg p-3">
                      <Link to="/jobs/$slug" params={{ slug: app.job.slug }} className="font-serif text-lg leading-tight">
                        {app.job.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted">{app.job.company.name}</p>
                      {app.briefAttached && <p className="mt-1 text-xs text-good">Brief joint</p>}
                      {(app.fitScore != null || app.trialScore != null) && (
                        <p className="mt-1 text-xs text-muted">
                          {app.fitScore != null ? `Grille ${app.fitScore}` : ""}
                          {app.fitScore != null && app.trialScore != null ? " · " : ""}
                          {app.trialScore != null ? `Épreuve ${app.trialScore}` : ""}
                        </p>
                      )}
                      {app.status === "sent" && (
                        <p
                          className={cn(
                            "mt-1 text-xs",
                            app.pactBreached || (left != null && left < 0)
                              ? "text-bad"
                              : left != null && left <= 2
                                ? "text-warn"
                                : "text-muted",
                          )}
                        >
                          {app.pactBreached || (left != null && left < 0)
                            ? "Pacte rompu — honneur en baisse"
                            : left == null
                              ? "Sans date de pacte"
                              : left === 0
                                ? "Réponse due aujourd’hui"
                                : `Réponse due dans ${left} j`}
                        </p>
                      )}
                      <label className="mt-2 block">
                        <span className="sr-only">Statut</span>
                        <select
                          className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-2 text-xs"
                          value={app.status}
                          onChange={(e) => move.mutate({ id: app.id, status: e.target.value as ApplicationStatus })}
                        >
                          {STATUS_ORDER.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </label>
                      {app.status === "rejected" && app.feedback && (
                        <div className="mt-2 rounded-md bg-paper p-2">
                          <p className="text-xs leading-relaxed text-ink">{app.feedback.text}</p>
                          <ul className="mt-1 space-y-0.5">
                            {app.feedback.lessons.map((slug) => {
                              const l = lessonOf(slug);
                              return (
                                <li key={slug}>
                                  <Link to="/apprendre/$slug" params={{ slug }} className="text-xs text-primary">
                                    {l?.title ?? slug}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </article>
                  );
                })}
                {col.length === 0 && <p className="px-1 py-6 text-center text-xs text-subtle">Vide</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
