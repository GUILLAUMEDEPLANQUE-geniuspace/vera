import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { myHouseApplicants, myPostedJobs } from "@/lib/admin-fn";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listCompanies } from "@/lib/jobs-fn";
import { listMyArticles, saveArticle } from "@/lib/journal-fn";
import { REJECT_REASONS } from "@/lib/lessons";
import { claimRole, houseSetStatus, listMyInvoices, payInvoice, uploadProof } from "@/lib/ops-fn";
import { isQualified } from "@/lib/ppqc";

export const Route = createFileRoute("/me/maison")({ component: Gate });

function Gate() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="mx-auto max-w-3xl px-4 py-16"><div className="h-64 animate-pulse rounded-xl bg-paper" /></div>;
  if (!user) return <RedirectToSignIn />;
  return <Entreprise name={user.displayName ?? user.primaryEmail ?? "Entreprise"} />;
}

function Entreprise({ name }: { name: string }) {
  const qc = useQueryClient();
  const jobs = useQuery({ queryKey: ["my-jobs"], queryFn: () => myPostedJobs() });
  const apps = useQuery({ queryKey: ["my-apps"], queryFn: () => myHouseApplicants() });
  const arts = useQuery({ queryKey: ["my-arts"], queryFn: () => listMyArticles() });
  const inv = useQuery({ queryKey: ["invoices"], queryFn: () => listMyInvoices() });
  const companies = useQuery({ queryKey: ["companies-pick"], queryFn: () => listCompanies() });
  const [reason, setReason] = useState("grid-low");
  const [note, setNote] = useState("");
  const [houseSlug, setHouseSlug] = useState("");
  const claim = useMutation({
    mutationFn: () => claimRole({ data: { role: "house", houseSlug } }),
    onSuccess: async () => {
      toast.success("Entreprise liée");
      await qc.invalidateQueries({ queryKey: ["my-jobs"] });
      await qc.invalidateQueries({ queryKey: ["my-apps"] });
    },
  });
  const reject = useMutation({
    mutationFn: (id: number) => houseSetStatus({ data: { id, status: "rejected", reasons: [reason], note } }),
    onSuccess: async () => {
      toast.success("Refus + diagnostic envoyés");
      await qc.invalidateQueries({ queryKey: ["my-apps"] });
    },
  });
  const pay = useMutation({
    mutationFn: (id: number) => payInvoice({ data: id }),
    onSuccess: () => {
      toast.success("Facture marquée payée");
      void qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileB64, setFileB64] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState("");
  const pub = useMutation({
    mutationFn: async () => {
      let note: string | undefined;
      if (fileB64 && fileMime && fileName) {
        const up = await uploadProof({ data: { fileName, mime: fileMime, bodyB64: fileB64 } });
        if (!up.ok) throw new Error("error" in up ? up.error : "Upload impossible");
        note = `/fichiers/${up.id}`;
      }
      return saveArticle({
        data: {
          title,
          excerpt,
          body,
          kind: fileName ? "fichier" : "article",
          tags: [],
          fileName: fileName || undefined,
          fileNote: note,
          authorKind: "company",
          authorName: name,
          published: true,
        },
      });
    },
    onSuccess: async (res) => {
      toast.success("Note publiée");
      setTitle("");
      setExcerpt("");
      setBody("");
      setFileName("");
      setFileB64(null);
      setFileMime("");
      await qc.invalidateQueries({ queryKey: ["my-arts"] });
      void res.slug;
    },
    onError: () => toast.error("Publication impossible"),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Entreprise</p>
      <h1 className="mt-2 font-serif text-4xl">Espace recruteur</h1>
      <p className="mt-2 text-muted">
        Offres, candidats qualifiés (PPQC), journal, refus avec diagnostic.{" "}
        <Link to="/me/academie" className="text-primary">
          Catalogue formation
        </Link>
        {" · "}
        <Link to="/me/cck" className="text-primary">
          Champs CCK
        </Link>
        {" · "}
        <Link to="/me/epreuve" className="text-primary">
          Guide épreuve
        </Link>
        {" · "}
        <Link to="/me/drive" className="text-primary">
          Drive
        </Link>
        . Publication{" "}
        <Link to="/post" className="text-primary">ici</Link>.
      </p>
      <div className="mt-6 flex flex-wrap items-end gap-2">
        <select
          className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
          value={houseSlug}
          onChange={(e) => setHouseSlug(e.target.value)}
        >
          <option value="">Lier une entreprise seedée</option>
          {(companies.data ?? []).map((h) => (
            <option key={h.slug} value={h.slug}>{h.name}</option>
          ))}
        </select>
        <Button type="button" variant="secondary" disabled={!houseSlug || claim.isPending} onClick={() => claim.mutate()}>
          Recruter pour cette entreprise
        </Button>
      </div>

      <h2 className="mt-10 font-serif text-2xl">Vos offres</h2>
      <ul className="mt-3 space-y-2">
        {(jobs.data ?? []).length === 0 && <li className="text-sm text-muted">Aucune offre à votre nom — publiez pour activer le pipeline.</li>}
        {(jobs.data ?? []).map((j) => (
          <li key={j.id}>
            <Link to="/jobs/$slug" params={{ slug: j.slug }} className="text-primary">{j.title}</Link>
            <span className="text-sm text-muted"> · {j.city}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-serif text-2xl">Candidats</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Motif de refus (public pour le candidat)</Label>
          <select className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REJECT_REASONS.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Note</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Le geste de consignation n’a pas tenu." />
        </div>
      </div>
      <ul className="mt-3 divide-y divide-border border-y border-border">
        {(apps.data ?? []).map((a) => {
          const q = isQualified({ trialScore: a.trial_score, fitScore: a.fit_score });
          return (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span>
                <Link to="/jobs/$slug" params={{ slug: a.job_slug }} className="font-medium">{a.title}</Link>
                <span className={q ? "ml-2 text-good" : "ml-2 text-muted"}>
                  {q ? "Qualifié PPQC" : a.status} · épreuve {a.trial_score ?? "—"} · grille {a.fit_score ?? "—"}
                </span>
              </span>
              {a.status !== "rejected" && a.status !== "offer" && (
                <Button size="sm" variant="secondary" onClick={() => reject.mutate(a.id)}>
                  Non retenu + diagnostic
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <h2 className="mt-10 font-serif text-2xl">Factures PPQC</h2>
      <ul className="mt-3 divide-y divide-border border-y border-border">
        {(inv.data ?? []).length === 0 && <li className="py-3 text-sm text-muted">Aucune facture — un qualifié (épreuve ≥ 55 et grille ≥ 55) en crée une.</li>}
        {(inv.data ?? []).map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-3 py-3 text-sm">
            <span>{i.title} · {i.company} · <span className="font-serif text-xl tabular-nums">{i.euros} €</span> · {i.status}</span>
            {i.status !== "paid" && (
              <Button size="sm" onClick={() => pay.mutate(i.id)}>Marquer payée</Button>
            )}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-serif text-2xl">Publier une note / un fichier</h2>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim().length < 8 || body.trim().length < 40) {
            toast.error("Titre et texte trop courts");
            return;
          }
          pub.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label>Titre</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Chapô</Label>
          <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Texte</Label>
          <Textarea className="min-h-32" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Fichier réel (PDF, PNG, JPEG — max 1,2 Mo)</Label>
          <Input
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp,text/plain"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) {
                setFileB64(null);
                return;
              }
              if (f.size > 900_000) {
                toast.error("Fichier trop lourd (max ~900 ko pour la démo embarquée)");
                return;
              }
              setFileName(f.name);
              setFileMime(f.type || "application/pdf");
              const reader = new FileReader();
              reader.onload = () => setFileB64(String(reader.result ?? ""));
              reader.readAsDataURL(f);
            }}
          />
          {fileB64 && <p className="text-xs text-good">Prêt : {fileName}</p>}
        </div>
        <Button type="submit" disabled={pub.isPending}>{pub.isPending ? "Publication…" : "Publier au journal"}</Button>
      </form>
      <ul className="mt-6 space-y-2 text-sm">
        {(arts.data ?? []).map((a) => (
          <li key={a.id}>
            <Link to="/journal/$slug" params={{ slug: a.slug }} className="text-primary">{a.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
