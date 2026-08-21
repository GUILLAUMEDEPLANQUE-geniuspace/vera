import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { houseCck, listCckValues } from "@/lib/cck-fn";
import type { EpreuveKind } from "@/lib/cck-sim";
import { houseDrive } from "@/lib/drive-fn";
import { saveJobEpreuve } from "@/lib/epreuve-fn";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/me/epreuve")({ component: Gate });

const STEPS = [
  { n: 1, title: "Offre", hint: "Laquelle porte l’épreuve." },
  { n: 2, title: "Activer", hint: "Épreuve avant CV — champ CCK bool." },
  { n: 3, title: "Type", hint: "Le kind CCK : geste, consignation, schéma, soin, code." },
  { n: 4, title: "Brief", hint: "Ce que le candidat tient, le symptôme." },
  { n: 5, title: "Étapes", hint: "Une ligne = un geste, dans l’ordre." },
  { n: 6, title: "Média", hint: "Vidéo ou photo du Drive maison." },
  { n: 7, title: "Publier", hint: "L’épreuve est sur la fiche, pas dans un ATS." },
];

const KINDS: { id: EpreuveKind; label: string; blurb: string }[] = [
  { id: "machine", label: "Geste en étapes", blurb: "Vous écrivez l’ordre. Le candidat le tient." },
  { id: "lockout", label: "Consignation", blurb: "Modèle énergie / cadenas / essai." },
  { id: "circuit", label: "Schéma", blurb: "Sonder, puis isoler le bon point." },
  { id: "care", label: "Soin", blurb: "Beats de tournée, pas un QCM hygiène." },
  { id: "code", label: "Revue de code", blurb: "Un snippet, une question vraie." },
];

function Gate() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-xl bg-paper" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <EpreuveTour />;
}

function EpreuveTour() {
  const navigate = useNavigate();
  const cck = useQuery({ queryKey: ["house-cck"], queryFn: () => houseCck() });
  const drive = useQuery({ queryKey: ["house-drive"], queryFn: () => houseDrive() });
  const [step, setStep] = useState(1);
  const [jobId, setJobId] = useState<number | null>(null);
  const [on, setOn] = useState(true);
  const [kind, setKind] = useState<EpreuveKind>("machine");
  const [brief, setBrief] = useState("");
  const [symptom, setSymptom] = useState("");
  const [steps, setSteps] = useState("Observer le poste\nIsoler l’énergie\nEssai de remise en marche");
  const [trap, setTrap] = useState("Sauter une étape = score 0.");
  const [mediaUrl, setMediaUrl] = useState("");

  const jobs = cck.data?.ok ? cck.data.jobs : [];
  const job = jobs.find((j) => j.id === jobId) ?? null;
  const valuesQ = useQuery({
    queryKey: ["cck-values", "job", jobId],
    queryFn: () => listCckValues({ data: { kind: "job", id: jobId! } }),
    enabled: jobId != null,
  });

  const loaded = valuesQ.data;
  useEffect(() => {
    if (!loaded) return;
    const map = Object.fromEntries(loaded.map((v) => [v.name, v.value]));
    if (map.epreuve === "non") setOn(false);
    if (map.epreuve_kind) setKind(map.epreuve_kind as EpreuveKind);
    if (map.epreuve_brief) setBrief(map.epreuve_brief);
    if (map.epreuve_symptom) setSymptom(map.epreuve_symptom);
    if (map.epreuve_steps) setSteps(map.epreuve_steps.replace(/, /g, "\n"));
    if (map.epreuve_trap) setTrap(map.epreuve_trap);
    if (map.video || map.visite_video) setMediaUrl(map.video || map.visite_video);
  }, [loaded]);

  const pub = useMutation({
    mutationFn: () =>
      saveJobEpreuve({
        data: {
          jobId: jobId!,
          epreuve: on,
          kind,
          brief,
          symptom,
          steps,
          trap,
          mediaUrl,
        },
      }),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error);
      toast.success("Épreuve publiée sur la fiche");
      void navigate({ to: "/jobs/$slug", params: { slug: res.slug } });
    },
    onError: () => toast.error("Connexion requise"),
  });

  if (cck.data && !cck.data.ok) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-4xl">Guide épreuve</h1>
        <p className="mt-3 text-muted">{cck.data.error}</p>
        <Link to="/me/maison" className="mt-4 inline-block text-primary">
          Lier une entreprise
        </Link>
      </div>
    );
  }

  const canNext =
    step === 1 ? jobId != null : step === 4 ? brief.trim().length > 8 : step === 5 ? steps.trim().length > 3 : true;

  const assets = drive.data?.ok ? drive.data.assets : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Recruteur · CCK</p>
      <h1 className="mt-2 font-serif text-4xl">Ajouter une épreuve</h1>
      <p className="mt-2 max-w-xl text-muted">
        Un guide, étape par étape — comme un plugin tour. Chaque écran écrit un champ CCK. À la fin, le candidat
        tient le geste sur la fiche, pas un PDF.
      </p>
      <p className="mt-3 text-sm">
        <Link to="/me/cck" className="text-primary">
          Studio CCK
        </Link>
        {" · "}
        <Link to="/me/drive" className="text-primary">
          Drive maison
        </Link>
      </p>

      <ol className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {STEPS.map((s) => (
          <li key={s.n}>
            <button
              type="button"
              onClick={() => s.n <= step && setStep(s.n)}
              className={cn(
                "flex h-11 items-center gap-2 rounded-lg border px-3 text-sm whitespace-nowrap",
                s.n === step ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-muted",
              )}
            >
              <span className="font-serif tabular-nums">{s.n}</span>
              {s.title}
            </button>
          </li>
        ))}
      </ol>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-8">
        <p className="text-xs tracking-wide text-muted uppercase">
          Étape {step} / {STEPS.length}
        </p>
        <h2 className="mt-1 font-serif text-3xl">{STEPS[step - 1]?.title}</h2>
        <p className="mt-2 text-sm text-muted">{STEPS[step - 1]?.hint}</p>

        {step === 1 && (
          <ul className="mt-6 grid gap-2">
            {jobs.length === 0 && <li className="text-sm text-muted">Aucune offre — publiez-en une d’abord.</li>}
            {jobs.map((j) => (
              <li key={j.id}>
                <button
                  type="button"
                  onClick={() => setJobId(j.id)}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-left",
                    jobId === j.id ? "border-primary bg-paper" : "border-border",
                  )}
                >
                  <span className="font-medium">{j.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {step === 2 && (
          <label className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-paper px-4 py-4 text-sm">
            <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />
            Épreuve avant CV — le candidat tient un geste avant d’envoyer un CV.
          </label>
        )}

        {step === 3 && (
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {KINDS.map((k) => (
              <li key={k.id}>
                <button
                  type="button"
                  onClick={() => setKind(k.id)}
                  className={cn(
                    "h-full w-full rounded-xl border px-4 py-4 text-left",
                    kind === k.id ? "border-primary bg-paper" : "border-border",
                  )}
                >
                  <span className="font-medium">{k.label}</span>
                  <span className="mt-1 block text-sm text-muted">{k.blurb}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {step === 4 && (
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Brief</Label>
              <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} placeholder="Consignation à Fos. Cadenas perso, essai, mesure à zéro." />
            </div>
            <div className="space-y-1.5">
              <Label>Symptôme</Label>
              <Textarea value={symptom} onChange={(e) => setSymptom(e.target.value)} rows={3} placeholder="Presse à l’arrêt « visuel ». Air encore en ligne." />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Étapes (une par ligne)</Label>
              <Textarea value={steps} onChange={(e) => setSteps(e.target.value)} rows={6} />
            </div>
            <div className="space-y-1.5">
              <Label>Piège</Label>
              <Input value={trap} onChange={(e) => setTrap(e.target.value)} />
            </div>
            {kind !== "machine" && (
              <p className="text-sm text-muted">
                Pour {kind}, Vera reprend le modèle métier. Vos étapes enrichissent le brief ; le modèle reste le
                geste connu.
              </p>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="mt-6">
            <Label>URL média</Label>
            <Input className="mt-1.5" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="/offer/v/karim.mp4" />
            <p className="mt-3 text-sm text-muted">Ou choisissez dans le Drive maison :</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {assets.length === 0 && (
                <li className="text-sm text-muted">
                  Drive vide.{" "}
                  <Link to="/me/drive" className="text-primary">
                    Déposer un fichier
                  </Link>
                  .
                </li>
              )}
              {assets.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setMediaUrl(a.sourceUrl || `/drive/media/${a.id}`)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-3 text-left text-sm",
                      mediaUrl === (a.sourceUrl || `/drive/media/${a.id}`) ? "border-primary bg-paper" : "border-border",
                    )}
                  >
                    <span className="font-medium">{a.title}</span>
                    <span className="mt-1 block text-xs text-subtle">{a.assetType}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 7 && (
          <div className="mt-6 space-y-3 text-sm">
            <p>
              <span className="text-muted">Offre · </span>
              {job?.title ?? "—"}
            </p>
            <p>
              <span className="text-muted">Épreuve · </span>
              {on ? "oui" : "non"} · {kind}
            </p>
            <p className="max-w-prose leading-relaxed">{brief || "—"}</p>
            <pre className="whitespace-pre-wrap rounded-lg bg-paper p-4 text-sm">{steps}</pre>
            {mediaUrl && <p className="text-muted">Média · {mediaUrl}</p>}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {step > 1 && (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Retour
            </Button>
          )}
          {step < 7 && (
            <Button type="button" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continuer
            </Button>
          )}
          {step === 7 && (
            <Button type="button" disabled={!jobId || pub.isPending} onClick={() => pub.mutate()}>
              {pub.isPending ? "Publication…" : "Publier l’épreuve"}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
