import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MatchRing } from "@/components/match-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { myFormation } from "@/lib/academy-fn";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/me/formation")({ component: Gate });

function Gate() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-xl bg-paper" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <Formation name={user.displayName ?? user.primaryEmail ?? "Vous"} />;
}

function Formation({ name }: { name: string }) {
  const q = useQuery({ queryKey: ["my-formation"], queryFn: () => myFormation() });
  const data = q.data;
  const open = (data?.enrollments ?? []).filter((e) => e.status !== "completed");
  const done = (data?.enrollments ?? []).filter((e) => e.status === "completed");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Salarié</p>
      <h1 className="mt-2 font-serif text-4xl">Formation — {name}</h1>
      <p className="mt-2 text-muted">
        Parcours assignés par vos entreprises Vera. Un module tenu suit le dossier, pas un slide SCORM.
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link to="/academies" className="text-primary">
          Toutes les académies
        </Link>
        <Link to="/me" className="text-primary">
          Mon espace
        </Link>
        {data?.houseSlug && (
          <Link to="/me/academie" className="text-primary">
            Piloter le catalogue
          </Link>
        )}
      </div>

      <h2 className="mt-10 font-serif text-2xl">Mes maisons</h2>
      {(data?.memberships ?? []).length === 0 && (
        <p className="mt-3 text-sm text-muted">
          Aucune académie encore. Ouvrez la fiche entreprise, puis « Je suis salarié ici ».
        </p>
      )}
      <ul className="mt-4 space-y-3">
        {(data?.memberships ?? []).map((m) => (
          <li key={m.slug} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <div>
              <Link to="/companies/$slug/academie" params={{ slug: m.slug }} className="font-serif text-xl hover:text-primary">
                {m.name}
              </Link>
              <p className="text-xs text-subtle">
                {m.industry} · {m.role === "hr" ? "RH" : "Salarié"}
              </p>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link to="/companies/$slug/academie" params={{ slug: m.slug }}>
                Catalogue
              </Link>
            </Button>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-serif text-2xl">En cours</h2>
      {open.length === 0 && <p className="mt-3 text-sm text-muted">Rien d’assigné pour l’instant.</p>}
      <ul className="mt-4 space-y-3">
        {open.map((e) => (
          <li key={e.courseId} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
            <MatchRing value={e.progressPct} size={48} />
            <div className="min-w-0 flex-1">
              <Link
                to="/companies/$slug/academie/$course"
                params={{ slug: e.companySlug, course: e.slug }}
                className="font-serif text-xl hover:text-primary"
              >
                {e.title}
              </Link>
              <p className="text-sm text-muted">
                {e.companyName} · {e.minutes} min
                {e.mandatory ? " · obligatoire" : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-serif text-2xl">Tenus</h2>
      {done.length === 0 && <p className="mt-3 text-sm text-muted">Pas encore d’attestation.</p>}
      <ul className="mt-4 space-y-3">
        {done.map((e) => (
          <li key={e.courseId} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="good">Attestation</Badge>
              <span className="text-xs text-subtle">{e.completedAt?.slice(0, 10)}</span>
            </div>
            <Link
              to="/companies/$slug/academie/$course"
              params={{ slug: e.companySlug, course: e.slug }}
              className="mt-1 block font-serif text-xl hover:text-primary"
            >
              {e.title}
            </Link>
            <p className="text-sm text-muted">{e.companyName}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
