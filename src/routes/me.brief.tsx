import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Term } from "@/components/term";
import { draftBrief } from "@/lib/ai-fn";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyBrief, saveBrief } from "@/lib/brief-fn";
import { BRIEF_PRESETS } from "@/lib/constants";
import { briefScore, type ShippedItem } from "@/lib/types";

export const Route = createFileRoute("/me/brief")({ component: BriefPage });

function BriefPage() {
  const { user, isPending } = useCurrentUserState();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready || isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-xl bg-paper" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <BriefInner name={user.displayName ?? user.primaryEmail ?? "Vous"} />;
}

function BriefInner({ name }: { name: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["brief"], queryFn: () => getMyBrief() });
  const [shipped, setShipped] = useState<ShippedItem[] | null>(null);
  const [refuse, setRefuse] = useState("");
  const [nextChapter, setNextChapter] = useState("");
  const [workingStyle, setWorkingStyle] = useState("");

  useEffect(() => {
    if (!q.data || shipped) return;
    const b = q.data.brief;
    const rows = [...b.shipped];
    while (rows.length < 3) rows.push({ title: "", impact: "", year: "" });
    setShipped(rows);
    setRefuse(b.refuse.join("\n"));
    setNextChapter(b.nextChapter ?? "");
    setWorkingStyle(b.workingStyle ?? "");
  }, [q.data, shipped]);

  const saveM = useMutation({
    mutationFn: () =>
      saveBrief({
        data: {
          shipped: shipped ?? [],
          refuse: refuse.split("\n").map((s) => s.trim()).filter(Boolean),
          nextChapter,
          workingStyle,
        },
      }),
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["brief"] });
      toast.success(res.score >= 75 ? "Brief prêt — il partira avec vos candidatures" : "Brief enregistré");
    },
  });

  const draftM = useMutation({
    mutationFn: () => draftBrief(),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      try {
        const parsed = JSON.parse(res.text.replace(/```json|```/g, "").trim()) as {
          shipped?: ShippedItem[];
          refuse?: string[];
          nextChapter?: string;
          workingStyle?: string;
        };
        if (parsed.shipped?.length) {
          const rows = parsed.shipped.slice(0, 5).map((s) => ({
            title: s.title ?? "",
            impact: s.impact ?? "",
            year: s.year ?? "",
          }));
          while (rows.length < 3) rows.push({ title: "", impact: "", year: "" });
          setShipped(rows);
        }
        if (parsed.refuse) setRefuse(parsed.refuse.join("\n"));
        if (parsed.nextChapter) setNextChapter(parsed.nextChapter);
        if (parsed.workingStyle) setWorkingStyle(parsed.workingStyle);
        toast.success("Ébauche prête — relisez avant d’enregistrer");
      } catch {
        toast.error("L’ébauche n’était pas lisible. Réessayez.");
      }
    },
  });

  function applyPreset(key: keyof typeof BRIEF_PRESETS) {
    const p = BRIEF_PRESETS[key];
    setShipped(p.shipped.map((s) => ({ ...s })));
    setRefuse(p.refuse.join("\n"));
    setNextChapter(p.nextChapter);
    setWorkingStyle(p.workingStyle);
  }

  if (!shipped) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-xl bg-paper" />
      </div>
    );
  }

  const score = briefScore({
    shipped,
    refuse: refuse.split("\n").filter(Boolean),
    nextChapter,
    workingStyle,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Espace</p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
        Le <Term k="brief">Brief</Term>
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Une page. Ce que {name} a livré, ce qu’il refuse, ce qu’il veut. C’est ce que les maisons lisent — pas un CV
        chronologique.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link to="/me" className="font-medium text-primary">
          Profil
        </Link>
        <span className="text-subtle">·</span>
        <Link to="/pacte" className="font-medium text-primary">
          Le Pacte
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Préremplir</span>
        <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset("designer")}>
          Designer
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset("engineer")}>
          Ingénieur
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset("junior")}>
          Premier poste
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={draftM.isPending} onClick={() => draftM.mutate()}>
          {draftM.isPending ? "Ébauche…" : "Ébaucher depuis le profil"}
        </Button>
        <span className="ml-auto font-serif text-3xl tabular-nums text-primary">{score}</span>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            saveM.mutate();
          }}
        >
          <div>
            <h2 className="font-serif text-2xl">Livré</h2>
            <p className="mt-1 text-xs text-muted">Trois preuves. Un titre, un impact, une année.</p>
            <div className="mt-3 space-y-4">
              {shipped.map((row, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_4.5rem]">
                  <Input
                    placeholder="Ce que vous avez livré"
                    value={row.title}
                    onChange={(e) => {
                      const next = [...shipped];
                      next[i] = { ...row, title: e.target.value };
                      setShipped(next);
                    }}
                  />
                  <Input
                    placeholder="Année"
                    value={row.year}
                    onChange={(e) => {
                      const next = [...shipped];
                      next[i] = { ...row, year: e.target.value };
                      setShipped(next);
                    }}
                  />
                  <Input
                    className="sm:col-span-2"
                    placeholder="Impact mesurable"
                    value={row.impact}
                    onChange={(e) => {
                      const next = [...shipped];
                      next[i] = { ...row, impact: e.target.value };
                      setShipped(next);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Je refuse (une ligne par refus)</Label>
            <Textarea value={refuse} onChange={(e) => setRefuse(e.target.value)} className="min-h-28" />
          </div>
          <div className="space-y-1.5">
            <Label>La suite</Label>
            <Textarea value={nextChapter} onChange={(e) => setNextChapter(e.target.value)} className="min-h-24" />
          </div>
          <div className="space-y-1.5">
            <Label>Comment je travaille</Label>
            <Textarea value={workingStyle} onChange={(e) => setWorkingStyle(e.target.value)} className="min-h-24" />
          </div>
          <Button type="submit" disabled={saveM.isPending}>
            {saveM.isPending ? "Enregistrement…" : "Enregistrer le brief"}
          </Button>
        </form>

        <article className="rounded-xl border border-border bg-surface p-6 shadow-soft lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Aperçu</p>
          <h2 className="mt-2 font-serif text-3xl">{name}</h2>
          <section className="mt-6">
            <h3 className="text-xs tracking-wide text-muted uppercase">Livré</h3>
            <ul className="mt-2 space-y-3">
              {shipped.filter((s) => s.title).map((s) => (
                <li key={s.title}>
                  <div className="font-medium">
                    {s.title}
                    {s.year ? <span className="text-muted"> · {s.year}</span> : null}
                  </div>
                  {s.impact ? <p className="text-sm text-muted">{s.impact}</p> : null}
                </li>
              ))}
              {shipped.every((s) => !s.title) && <li className="text-sm text-subtle">Rien pour l’instant.</li>}
            </ul>
          </section>
          <section className="mt-6">
            <h3 className="text-xs tracking-wide text-muted uppercase">Je refuse</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {refuse.split("\n").filter(Boolean).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
          {nextChapter.trim() && (
            <section className="mt-6">
              <h3 className="text-xs tracking-wide text-muted uppercase">La suite</h3>
              <p className="mt-2 text-sm leading-relaxed">{nextChapter}</p>
            </section>
          )}
          {workingStyle.trim() && (
            <section className="mt-6">
              <h3 className="text-xs tracking-wide text-muted uppercase">Travail</h3>
              <p className="mt-2 text-sm leading-relaxed">{workingStyle}</p>
            </section>
          )}
          <p className="mt-8 text-xs text-subtle">
            {score >= 75
              ? "Ce brief partira avec chaque candidature."
              : "Complétez livraisons, refus et suite pour qu’il soit joint."}
          </p>
        </article>
      </div>
    </div>
  );
}
