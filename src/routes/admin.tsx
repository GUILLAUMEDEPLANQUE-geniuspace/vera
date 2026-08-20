import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { HubAdmin } from "@/components/hub-admin";
import { Term } from "@/components/term";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminPipeline, adminPulse } from "@/lib/admin-fn";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listAllArticlesAdmin, setArticlePublished } from "@/lib/journal-fn";
import { claimRole, listMyInvoices, payInvoice } from "@/lib/ops-fn";
import { getMyProfile } from "@/lib/profile-fn";

export const Route = createFileRoute("/admin")({
  component: AdminGate,
});

function AdminGate() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="mx-auto max-w-6xl px-4 py-16"><div className="h-64 animate-pulse rounded-xl bg-paper" /></div>;
  if (!user) return <RedirectToSignIn />;
  return <AdminInner />;
}

function AdminInner() {
  const qc = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getMyProfile() });
  const isOp = profile.data?.role === "operator";
  const [phrase, setPhrase] = useState("");
  const claim = useMutation({
    mutationFn: () => claimRole({ data: { role: "operator", phrase } }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error("error" in res ? res.error : "Phrase incorrecte");
        return;
      }
      toast.success("Rôle opérateur tenu");
      await qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
  const pulse = useQuery({ queryKey: ["admin-pulse"], queryFn: () => adminPulse(), enabled: isOp });
  const pipe = useQuery({ queryKey: ["admin-pipe"], queryFn: () => adminPipeline(), enabled: isOp });
  const arts = useQuery({ queryKey: ["admin-arts"], queryFn: () => listAllArticlesAdmin(), enabled: isOp });
  const inv = useQuery({ queryKey: ["invoices"], queryFn: () => listMyInvoices(), enabled: isOp });
  const pub = useMutation({
    mutationFn: (p: { id: number; published: boolean }) => setArticlePublished({ data: p }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-arts"] });
      toast.success("Journal mis à jour");
    },
  });
  const pay = useMutation({
    mutationFn: (id: number) => payInvoice({ data: id }),
    onSuccess: () => {
      toast.success("Facture marquée payée");
      void qc.invalidateQueries({ queryKey: ["invoices"] });
      void qc.invalidateQueries({ queryKey: ["admin-pulse"] });
    },
  });
  const p = pulse.data;

  if (!isOp) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <p className="text-xs tracking-wide text-primary uppercase">Console</p>
        <h1 className="mt-2 font-serif text-4xl">Pas ouverte à tout le monde</h1>
        <p className="mt-3 text-muted">
          L’espace maison gère les offres et les refus. Cette console est pour l’opérateur Vera — pipeline global, journal, factures PPQC.
        </p>
        <p className="mt-4 text-sm text-subtle">
          Démo lab : la phrase d’opérateur est « l’honneur est public ». Ce n’est pas un modèle de sécurité production.
        </p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            claim.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label>Phrase d’opérateur</Label>
            <Input value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="l’honneur est public" />
          </div>
          <Button type="submit" disabled={claim.isPending}>Entrer</Button>
        </form>
        <p className="mt-6 text-sm">
          <Link to="/me/maison" className="text-primary">Espace maison</Link>
          {" · "}
          <Link to="/me" className="text-primary">Profil</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Console Vera</p>
      <h1 className="mt-2 font-serif text-4xl">Opérateur</h1>
      <p className="mt-2 max-w-xl text-muted">
        Pipeline, journal, factures <Term k="ppqc">PPQC</Term>, catégories <Term k="savoirs">Savoirs</Term>,{" "}
        <Term k="drive">Drive</Term>.
      </p>
      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <Stat k="Offres" v={p?.jobs} />
        <Stat k="Maisons" v={p?.companies} />
        <Stat k="Candidatures" v={p?.applications} />
        <Stat k="Qualifiés" v={p?.qualified} />
        <Stat k="Notes" v={p?.articles} />
        <Stat k="PPQC dû" v={p?.invoicesDue} />
        <Stat k="PPQC payé" v={p?.invoicesPaid} />
      </dl>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link to="/me/maison" className="text-primary">Espace maison</Link>
        <Link to="/ppqc" className="text-primary">PPQC</Link>
        <Link to="/tension" className="text-primary">Tension</Link>
        <Link to="/post" className="text-primary">Publier</Link>
      </div>

      <h2 className="mt-12 font-serif text-2xl">Factures PPQC</h2>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {(inv.data ?? []).length === 0 && <li className="py-4 text-sm text-muted">Aucune facture — un qualifié (épreuve ≥ 55 et grille ≥ 55) en crée une.</li>}
        {(inv.data ?? []).map((i) => (
          <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <span>{i.title} · {i.company} · <span className="font-serif text-xl tabular-nums">{i.euros} €</span> · {i.status}</span>
            {i.status !== "paid" && (
              <Button size="sm" onClick={() => pay.mutate(i.id)}>Marquer payée</Button>
            )}
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-serif text-2xl">Pipeline qualifié</h2>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {(pipe.data ?? []).map((r) => (
          <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm">
            <span>
              <Link to="/jobs/$slug" params={{ slug: r.jobSlug }} className="font-medium text-primary">{r.title}</Link>
              <span className="text-muted"> · {r.company} · {r.userId}</span>
            </span>
            <span className={r.qualified ? "text-good" : "text-muted"}>
              {r.qualified ? "Qualifié" : "En cours"} · épreuve {r.trialScore ?? "—"} · grille {r.fitScore ?? "—"}
            </span>
          </li>
        ))}
        {(pipe.data ?? []).length === 0 && <li className="py-4 text-sm text-muted">Aucune candidature pour l’instant.</li>}
      </ul>

      <h2 className="mt-12 font-serif text-2xl">Journal</h2>
      <ul className="mt-4 space-y-3">
        {(arts.data ?? []).map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
            <div className="min-w-0">
              <p className="font-medium">{a.title}</p>
              <p className="text-xs text-muted">{a.authorName} · {a.kind} · {a.published ? "public" : "retiré"}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled={pub.isPending}
              onClick={() => pub.mutate({ id: a.id, published: !a.published })}
            >
              {a.published ? "Retirer" : "Publier"}
            </Button>
          </li>
        ))}
      </ul>
      <HubAdmin />
    </div>
  );
}

function Stat({ k, v }: { k: string; v?: number }) {
  return (
    <div className="border-t border-border pt-3">
      <dt className="text-xs tracking-wide text-muted uppercase">{k}</dt>
      <dd className="mt-1 font-serif text-3xl tabular-nums">{v ?? "—"}</dd>
    </div>
  );
}
