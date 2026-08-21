import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { claimSlot, listMySlots, releaseSlot } from "@/lib/ops-fn";
import { cn } from "@/lib/utils";
import { WEEKDAYS } from "@/lib/weekdays";

export const Route = createFileRoute("/me/creneaux")({ component: Gate });

function Gate() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="mx-auto max-w-4xl px-4 py-16"><div className="h-64 animate-pulse rounded-xl bg-paper" /></div>;
  if (!user) return <RedirectToSignIn />;
  return <Creneaux />;
}

function Creneaux() {
  const qc = useQueryClient();
  const slots = useQuery({ queryKey: ["slots"], queryFn: () => listMySlots() });
  const claim = useMutation({
    mutationFn: (id: number) => claimSlot({ data: id }),
    onSuccess: (res) => {
      if (!res.ok) toast.error("error" in res ? res.error : "Impossible");
      else toast.success("Créneau tenu");
      void qc.invalidateQueries({ queryKey: ["slots"] });
    },
  });
  const rel = useMutation({
    mutationFn: (id: number) => releaseSlot({ data: id }),
    onSuccess: () => {
      toast.success("Créneau rendu");
      void qc.invalidateQueries({ queryKey: ["slots"] });
    },
  });
  const mine = (slots.data ?? []).filter((s) => s.mine);
  const clashDays = new Set(mine.map((s) => s.weekday));
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Senior fractional</p>
      <h1 className="mt-2 font-serif text-4xl">Calendrier plusieurs entreprises</h1>
      <p className="mt-2 max-w-xl text-muted">
        Un jour, une entreprise. Mardi Fos et jeudi Lyon, oui. Deux mardis, non. Le pacte s’applique aux heures.
      </p>
      {mine.length > 0 && (
        <ul className="mt-6 space-y-2 text-sm">
          {mine.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2">
              <span>{WEEKDAYS[s.weekday]} {s.startHour}h · {s.hours} h · {s.company} · {s.city}</span>
              <Button size="sm" variant="secondary" onClick={() => rel.mutate(s.id)}>Rendre</Button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(slots.data ?? []).map((s) => {
          const full = s.taken >= s.seats && !s.mine;
          const clash = clashDays.has(s.weekday) && !s.mine;
          return (
            <article
              key={s.id}
              className={cn(
                "rounded-xl border p-4",
                s.mine ? "border-primary bg-primary/5" : "border-border bg-surface",
              )}
            >
              <p className="text-xs tracking-wide text-muted uppercase">{WEEKDAYS[s.weekday]} · {s.startHour}h–{s.startHour + s.hours}h</p>
              <h2 className="mt-1 font-serif text-xl">{s.company}</h2>
              <p className="text-sm text-muted">{s.title} · {s.city}</p>
              <p className="mt-2 text-xs text-subtle">{s.taken}/{s.seats} tenu{s.taken > 1 ? "s" : ""}</p>
              <div className="mt-3">
                {s.mine ? (
                  <Button size="sm" variant="secondary" onClick={() => rel.mutate(s.id)}>Rendre</Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={full || clash || claim.isPending}
                    onClick={() => claim.mutate(s.id)}
                  >
                    {full ? "Complet" : clash ? "Jour déjà tenu" : "Tenir ce créneau"}
                  </Button>
                )}
              </div>
              <Link to="/jobs/$slug" params={{ slug: s.jobSlug }} className="mt-2 inline-block text-xs text-primary">
                Offre
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
