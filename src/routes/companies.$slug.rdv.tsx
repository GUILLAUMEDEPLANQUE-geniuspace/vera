import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bookMeet, listMeetSlots } from "@/lib/meet-fn";
import { cn } from "@/lib/utils";

const companyRoute = getRouteApi("/companies/$slug");

export const Route = createFileRoute("/companies/$slug/rdv")({
  head: ({ params }) => ({
    meta: [{ title: `Rendez-vous — ${params.slug} | Vera` }],
  }),
  component: RdvTab,
});

function RdvTab() {
  const data = companyRoute.useLoaderData();
  const qc = useQueryClient();
  const { slug } = Route.useParams();
  const q = useQuery({
    queryKey: ["meet", slug],
    queryFn: () => listMeetSlots({ data: slug }),
    initialData: data?.slots,
  });
  const book = useMutation({
    mutationFn: (id: number) => bookMeet({ data: id }),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error);
      toast.success(`Créneau tenu le ${res.day}`);
      void qc.invalidateQueries({ queryKey: ["meet", slug] });
    },
    onError: () => toast.error("Connexion requise pour réserver"),
  });
  if (!data) return null;
  const slots = q.data ?? data.slots;
  const byDay = new Map<string, typeof slots>();
  for (const s of slots) {
    const list = byDay.get(s.weekdayLabel) ?? [];
    list.push(s);
    byDay.set(s.weekdayLabel, list);
  }

  return (
    <div>
      <p className="text-xs tracking-wide text-primary uppercase">Calendrier public</p>
      <h2 className="mt-1 font-serif text-3xl">Prendre rendez-vous</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Visite, info, entretien court. Un créneau, un siège. Pas un formulaire « on vous recontacte ». Un
        compte Vera tient le rendez-vous.
      </p>

      {slots.length === 0 && (
        <p className="mt-8 text-muted">
          Pas de créneau public pour l’instant. Passez par une{" "}
          <Link to="/companies/$slug/offres" params={{ slug }} className="text-primary">
            offre
          </Link>
          .
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[...byDay.entries()].map(([day, list]) => (
          <section key={day} className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-serif text-2xl">{day}</h3>
            <ul className="mt-4 space-y-3">
              {list.map((s) => {
                const full = s.taken >= s.seats;
                const hh = String(s.startHour).padStart(2, "0");
                return (
                  <li
                    key={s.id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border px-3 py-3",
                      full ? "border-border bg-paper" : "border-border bg-bg",
                    )}
                  >
                    <div>
                      <p className="font-serif text-xl tabular-nums">
                        {hh}h00 · {s.minutes} min
                      </p>
                      <p className="text-xs text-muted">
                        {s.kind} · {s.place} · {s.taken}/{s.seats} · {s.nextDay}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={full || book.isPending}
                      variant={full ? "secondary" : "primary"}
                      onClick={() => book.mutate(s.id)}
                    >
                      {full ? "Complet" : "Réserver"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
