import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BARRIERS } from "@/lib/barriers";
import { getMyBrief } from "@/lib/brief-fn";
import { PRESETS } from "@/lib/constants";
import { claimRole, type AppRole } from "@/lib/ops-fn";
import { getMyProfile, listSavedJobs, saveProfile, type ProfileInput } from "@/lib/profile-fn";
import { REMOTE_LABEL, SENIORITY_LABEL } from "@/lib/types";
import { VIVIERS } from "@/lib/viviers";

export const Route = createFileRoute("/me/")({ component: MePage });

function MePage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-xl bg-paper" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <MeInner name={user.displayName ?? user.primaryEmail ?? "Vous"} />;
}

function MeInner({ name }: { name: string }) {
  const qc = useQueryClient();
  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => getMyProfile() });
  const savedQ = useQuery({ queryKey: ["saved"], queryFn: () => listSavedJobs() });
  const briefQ = useQuery({ queryKey: ["brief"], queryFn: () => getMyBrief() });
  const [form, setForm] = useState<ProfileInput | null>(null);

  useEffect(() => {
    if (!profileQ.data || form) return;
    const p = profileQ.data;
    setForm({
      headline: p.headline ?? "",
      location: p.location ?? "",
      remotePref: p.remotePref ?? "hybrid",
      seniority: p.seniority ?? "mid",
      skills: p.skills,
      languages: p.languages,
      bio: p.bio ?? "",
      salaryMin: p.salaryMin,
      salaryMax: p.salaryMax,
      openToWork: p.openToWork,
      roleTargets: p.roleTargets,
      slasher: p.slasher,
      hoursWeek: p.hoursWeek,
      poolPrefs: p.poolPrefs,
      barriers: p.barriers,
    });
  }, [profileQ.data, form]);

  const saveM = useMutation({
    mutationFn: () => saveProfile({ data: form! }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profil enregistré — le signal est à jour");
    },
  });

  function applyPreset(key: keyof typeof PRESETS) {
    const p = PRESETS[key];
    setForm({
      headline: p.headline,
      location: p.location,
      remotePref: p.remotePref,
      seniority: p.seniority,
      skills: [...p.skills],
      languages: [...p.languages],
      bio: p.bio,
      salaryMin: p.salaryMin,
      salaryMax: p.salaryMax,
      openToWork: true,
      roleTargets: [...p.roleTargets],
      slasher: false,
      hoursWeek: null,
      poolPrefs: [],
      barriers: form?.barriers ?? [],
    });
  }

  if (!form) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-xl bg-paper" />
      </div>
    );
  }

  const briefScoreValue = briefQ.data?.score ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Mon espace</p>
      <h1 className="mt-2 font-serif text-4xl">{name}</h1>
      <p className="mt-2 text-muted">
        Le signal de chaque offre se calcule ici. Le brief, lui, est ce que les entreprises lisent.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/me/carnet" className="text-sm font-medium text-primary">
          Mes preuves
        </Link>
        <span className="text-subtle">·</span>
        <Link to="/me/maison" className="text-sm font-medium text-primary">
          Entreprise
        </Link>
        <span className="text-subtle">·</span>
        <Link to="/me/creneaux" className="text-sm font-medium text-primary">
          Créneaux
        </Link>
        <span className="text-subtle">·</span>
        <Link to="/apprendre" className="text-sm font-medium text-primary">
          Apprendre
        </Link>
        {profileQ.data?.role === "operator" && (
          <>
            <span className="text-subtle">·</span>
            <Link to="/admin" className="text-sm font-medium text-primary">
              Console
            </Link>
          </>
        )}
        <span className="text-subtle">·</span>
        <Link to="/me/brief" className="text-sm font-medium text-primary">
          Brief {briefScoreValue ? `(${briefScoreValue})` : ""}
        </Link>
        <span className="text-subtle">·</span>
        <Link to="/me/tracker" className="text-sm font-medium text-primary">
          Suivi des candidatures
        </Link>
        <span className="text-subtle">·</span>
        <Link to="/coach" className="text-sm font-medium text-primary">
          Coach entretien
        </Link>
        <span className="text-subtle">·</span>
        <Link to="/post" className="text-sm font-medium text-primary">
          Publier une offre
        </Link>
      </div>

      <RoleStrip role={profileQ.data?.role ?? "candidate"} />

      {briefScoreValue < 75 && (
        <aside className="mt-6 rounded-xl border border-border bg-surface p-5">
          <h2 className="font-serif text-xl">Votre brief n’est pas prêt</h2>
          <p className="mt-2 text-sm text-muted">
            Sans brief, vous candidatez comme partout ailleurs. Une page suffit : livré, refusé, suite.
          </p>
          <Link to="/me/brief" className="mt-3 inline-block text-sm font-medium text-primary">
            Écrire le brief
          </Link>
        </aside>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <span className="self-center text-xs text-muted">Préremplir</span>
        <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset("designer")}>
          Designer
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset("engineer")}>
          Ingénieur
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => applyPreset("junior")}>
          Premier poste
        </Button>
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          saveM.mutate();
        }}
      >
        <Field label="Titre">
          <Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Product designer" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ville">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <Field label="Présence">
            <select
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
              value={form.remotePref}
              onChange={(e) => setForm({ ...form, remotePref: e.target.value })}
            >
              {Object.entries(REMOTE_LABEL).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Niveau">
            <select
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
              value={form.seniority}
              onChange={(e) => setForm({ ...form, seniority: e.target.value })}
            >
              {Object.entries(SENIORITY_LABEL).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Salaire min">
            <Input
              type="number"
              value={form.salaryMin ?? ""}
              onChange={(e) => setForm({ ...form, salaryMin: e.target.value ? Number(e.target.value) : null })}
            />
          </Field>
          <Field label="Salaire max">
            <Input
              type="number"
              value={form.salaryMax ?? ""}
              onChange={(e) => setForm({ ...form, salaryMax: e.target.value ? Number(e.target.value) : null })}
            />
          </Field>
        </div>
        <Field label="Compétences (virgules)">
          <Input
            value={form.skills.join(", ")}
            onChange={(e) =>
              setForm({
                ...form,
                skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="Figma, React, SQL"
          />
        </Field>
        <Field label="Langues">
          <Input
            value={form.languages.join(", ")}
            onChange={(e) =>
              setForm({
                ...form,
                languages: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </Field>
        <Field label="Note">
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </Field>
        <fieldset className="space-y-3 rounded-xl border border-border p-4">
          <legend className="px-1 text-sm font-medium">Multi-activité / bassins</legend>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-primary"
              checked={Boolean(form.slasher)}
              onChange={(e) => setForm({ ...form, slasher: e.target.checked })}
            />
            <span>Multi-activité — mi-temps salarié + jours auto-entrepreneur, planning écrit.</span>
          </label>
          <Field label="Heures / semaine visées">
            <Input
              type="number"
              value={form.hoursWeek ?? ""}
              onChange={(e) => setForm({ ...form, hoursWeek: e.target.value ? Number(e.target.value) : null })}
              placeholder="8 à 35"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            {VIVIERS.map((v) => {
              const on = (form.poolPrefs ?? []).includes(v.pool);
              return (
                <button
                  key={v.slug}
                  type="button"
                  className={`h-10 rounded-full border px-3 text-sm ${on ? "border-primary bg-paper text-ink" : "border-border text-muted"}`}
                  onClick={() => {
                    const next = on
                      ? (form.poolPrefs ?? []).filter((p) => p !== v.pool)
                      : [...(form.poolPrefs ?? []), v.pool];
                    setForm({ ...form, poolPrefs: next });
                  }}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </fieldset>
        <fieldset className="space-y-3 rounded-xl border border-border p-4">
          <legend className="px-1 text-sm font-medium">Freins périphériques (RSA et autour)</legend>
          <p className="text-xs text-muted">
            Ce que vous avez, pas un slogan. Les entreprises cochent ce qu’elles lèvent. Le Try & Buy n’ouvre que si ça match.
          </p>
          {BARRIERS.map((b) => {
            const on = (form.barriers ?? []).includes(b.id);
            return (
              <label key={b.id} className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-primary"
                  checked={on}
                  onChange={() => {
                    const next = on
                      ? (form.barriers ?? []).filter((id) => id !== b.id)
                      : [...(form.barriers ?? []), b.id];
                    setForm({ ...form, barriers: next });
                  }}
                />
                <span>
                  <span className="font-medium">{b.label}</span>
                  <span className="text-muted"> — {b.candidate}</span>
                </span>
              </label>
            );
          })}
        </fieldset>
        <Button type="submit" disabled={saveM.isPending}>
          {saveM.isPending ? "Enregistrement…" : "Enregistrer le profil"}
        </Button>
      </form>

      <h2 className="mt-16 font-serif text-3xl">Sauvées</h2>
      <div className="mt-4 grid gap-4">
        {savedQ.data?.length === 0 && <p className="text-sm text-muted">Aucune offre sauvée pour l’instant.</p>}
        {savedQ.data?.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function RoleStrip({ role }: { role: AppRole }) {
  const qc = useQueryClient();
  const [phrase, setPhrase] = useState("");
  const claim = useMutation({
    mutationFn: (next: AppRole) => claimRole({ data: { role: next, phrase } }),
    onSuccess: async (res) => {
      if (!res.ok) {
        toast.error("error" in res ? res.error : "Rôle refusé");
        return;
      }
      toast.success("Rôle enregistré");
      await qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
  const label = role === "operator" ? "Opérateur" : role === "house" ? "Entreprise" : "Candidat";
  return (
    <aside className="mt-6 rounded-xl border border-border bg-surface p-5">
      <p className="text-xs tracking-wide text-muted uppercase">Rôle actuel · {label}</p>
      <p className="mt-2 text-sm text-muted">
        Candidat : preuves, épreuve, créneaux. Entreprise : pipeline et refus avec diagnostic. Opérateur : console globale — pas ouverte par défaut.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={role === "candidate" ? "primary" : "secondary"} onClick={() => claim.mutate("candidate")}>
          Candidat
        </Button>
        <Button type="button" size="sm" variant={role === "house" ? "primary" : "secondary"} onClick={() => claim.mutate("house")}>
          Entreprise
        </Button>
      </div>
      {role !== "operator" && (
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div className="min-w-48 flex-1 space-y-1.5">
            <Label>Phrase opérateur (démo lab)</Label>
            <Input value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="l’honneur est public" />
          </div>
          <Button type="button" variant="secondary" size="sm" disabled={!phrase || claim.isPending} onClick={() => claim.mutate("operator")}>
            Devenir opérateur
          </Button>
        </div>
      )}
    </aside>
  );
}
