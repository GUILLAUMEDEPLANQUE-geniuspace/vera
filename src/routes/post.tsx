import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { FAMILIES, gridByFamily, mergeCustom, type FieldKind } from "@/lib/fields";
import { ppqcPrice } from "@/lib/ppqc";
import { postJob, type PostJobInput } from "@/lib/profile-fn";
import { CONTRACT_LABEL, REMOTE_LABEL, SENIORITY_LABEL } from "@/lib/types";
import { VIVIERS } from "@/lib/viviers";

export const Route = createFileRoute("/post")({ component: PostPage });

type ExtraDraft = {
  label: string;
  kind: FieldKind;
  hint: string;
  options: string;
  weight: number;
};

function PostPage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-xl bg-paper" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <PostInner />;
}

function PostInner() {
  const navigate = useNavigate();
  const [form, setForm] = useState<PostJobInput>({
    companyName: "",
    title: "",
    team: "",
    city: "Paris",
    country: "France",
    remoteType: "hybrid",
    contract: "cdi",
    seniority: "mid",
    salaryMin: 45000,
    salaryMax: 60000,
    description: "",
    skills: [],
    slaDays: 10,
    family: "tech",
    pool: "",
  });
  const [skillsRaw, setSkillsRaw] = useState("");
  const [pactOk, setPactOk] = useState(false);
  const [extras, setExtras] = useState<ExtraDraft[]>([]);
  const previewGrid = mergeCustom(
    gridByFamily(form.family || "tech"),
    extras
      .filter((e) => e.label.trim())
      .map((e, i) => ({
        id: `extra-${i}`,
        label: e.label.trim(),
        kind: e.kind,
        weight: e.weight,
        hint: e.hint,
        options: e.kind === "choice" ? e.options.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        min: e.kind === "scale" ? 1 : undefined,
        max: e.kind === "scale" ? 5 : undefined,
      })),
  );

  const quality = useMemo(() => {
    const checks = [
      { ok: form.title.trim().length > 3, label: "Titre précis" },
      { ok: form.companyName.trim().length > 1, label: "Entreprise nommée" },
      { ok: form.salaryMin != null && form.salaryMax != null, label: "Salaire publié" },
      { ok: form.description.trim().length >= 180, label: "Description réelle (≥ 180)" },
      { ok: skillsRaw.split(",").filter((s) => s.trim()).length >= 2, label: "Au moins 2 compétences" },
      { ok: pactOk, label: `Pacte signé (${form.slaDays} jours)` },
    ];
    const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
    return { checks, score };
  }, [form, skillsRaw, pactOk]);

  const pub = useMutation({
    mutationFn: () =>
      postJob({
        data: {
          ...form,
          skills: skillsRaw.split(",").map((s) => s.trim()).filter(Boolean),
          customFields: extras
            .filter((e) => e.label.trim())
            .map((e) => ({
              label: e.label.trim(),
              kind: e.kind,
              hint: e.hint,
              weight: e.weight,
              options: e.options.split(",").map((s) => s.trim()).filter(Boolean),
            })),
        },
      }),
    onSuccess: (res) => {
      toast.success("Offre publiée — le pacte est en vigueur");
      void navigate({ to: "/jobs/$slug", params: { slug: res.slug } });
    },
    onError: () => toast.error("Publication impossible"),
  });

  const canPublish = quality.score === 100;
  const quote = ppqcPrice({
    city: form.city,
    seniority: form.seniority,
    title: form.title || "Poste",
  });

  function addExtra() {
    setExtras((xs) => [...xs, { label: "", kind: "text", hint: "", options: "", weight: 18 }]);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl sm:text-5xl">Publier</h1>
      <p className="mt-3 text-muted">
        Une offre Vera doit pouvoir se lire — et s’engager. Sans salaire, sans pacte de réponse, ce n’est pas une
        offre.{" "}
        <Link to="/pacte" className="text-primary">
          Lire le pacte
        </Link>
        .
      </p>

      <aside className="mt-8 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl">Qualité</h2>
          <span className="font-serif text-3xl tabular-nums text-primary">{quality.score}</span>
        </div>
        <ul className="mt-3 space-y-1 text-sm">
          {quality.checks.map((c) => (
            <li key={c.label} className={c.ok ? "text-good" : "text-muted"}>
              {c.ok ? "Oui — " : "Non — "}
              {c.label}
            </li>
          ))}
        </ul>
      </aside>

      <aside className="mt-4 rounded-xl border border-border bg-surface p-5">
        <p className="text-xs tracking-wide text-muted uppercase">PPQC estimé</p>
        <p className="mt-1 font-serif text-3xl tabular-nums">{quote.euros} €</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{quote.why}</p>
        <p className="mt-2 text-xs text-subtle">
          Publier est gratuit. Vous ne payez que si le candidat tient l’épreuve et la grille (≥ 55).{" "}
          <Link to="/ppqc" className="text-primary">
            Le modèle
          </Link>
        </p>
      </aside>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canPublish) {
            toast.error("Complétez la qualité avant de publier");
            return;
          }
          pub.mutate();
        }}
      >
        <Field label="Entreprise">
          <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
        </Field>
        <Field label="Intitulé">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </Field>
        <Field label="Équipe">
          <Input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ville">
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <Field label="Pays">
            <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Présence">
            <select
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
              value={form.remoteType}
              onChange={(e) => setForm({ ...form, remoteType: e.target.value })}
            >
              {Object.entries(REMOTE_LABEL).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Contrat">
            <select
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
              value={form.contract}
              onChange={(e) => setForm({ ...form, contract: e.target.value })}
            >
              {Object.entries(CONTRACT_LABEL).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
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
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Salaire min (€)">
            <Input
              type="number"
              value={form.salaryMin ?? ""}
              onChange={(e) => setForm({ ...form, salaryMin: e.target.value ? Number(e.target.value) : null })}
            />
          </Field>
          <Field label="Salaire max (€)">
            <Input
              type="number"
              value={form.salaryMax ?? ""}
              onChange={(e) => setForm({ ...form, salaryMax: e.target.value ? Number(e.target.value) : null })}
            />
          </Field>
        </div>
        <Field label="Pacte — réponse sous">
          <select
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
            value={form.slaDays}
            onChange={(e) => setForm({ ...form, slaDays: Number(e.target.value) })}
          >
            <option value={7}>7 jours</option>
            <option value={10}>10 jours</option>
            <option value={14}>14 jours</option>
            <option value={21}>21 jours</option>
          </select>
        </Field>
        <label className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-sm">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-primary"
            checked={pactOk}
            onChange={(e) => setPactOk(e.target.checked)}
          />
          <span>
            Je m’engage à répondre sous {form.slaDays} jours. Un retard baisse l’honneur public de la maison. C’est le
            prix d’être sur Vera.
          </span>
        </label>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="min-h-40"
          />
        </Field>
        <Field label="Compétences (virgules)">
          <Input value={skillsRaw} onChange={(e) => setSkillsRaw(e.target.value)} placeholder="Kotlin, Postgres, Finance" />
        </Field>
        <Field label="Famille de grille — ce que le candidat verra">
          <select
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
            value={form.family ?? "tech"}
            onChange={(e) => setForm({ ...form, family: e.target.value })}
          >
            {FAMILIES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vivier (optionnel)">
          <select
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
            value={form.pool ?? ""}
            onChange={(e) => setForm({ ...form, pool: e.target.value || "" })}
          >
            <option value="">Aucun — vivier classique</option>
            {VIVIERS.map((v) => (
              <option key={v.pool} value={v.pool}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
        <aside className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs tracking-wide text-muted uppercase">Critères publics — scoring live</p>
          <p className="mt-1 font-serif text-xl">{previewGrid.title}</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {previewGrid.fields.map((f) => (
              <li key={f.id}>
                {f.label}{" "}
                <span className="text-subtle">
                  · {f.kind} · poids {f.weight}
                </span>
              </li>
            ))}
          </ul>
        </aside>
        <fieldset className="space-y-4 rounded-xl border border-border p-4">
          <legend className="px-1 text-sm font-medium">Grille maison (public, pondéré)</legend>
          <p className="text-xs text-muted">
            Ajoutez autant de critères que le métier l’exige — mandarin, guanxi, consignation. Ils s’affichent sur
            l’offre et entrent dans le score. Pas de scoring fantôme dans un ATS.
          </p>
          {extras.map((ex, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs tracking-wide text-muted uppercase">Critère {i + 1}</p>
                <button
                  type="button"
                  className="text-xs text-muted hover:text-ink"
                  onClick={() => setExtras((xs) => xs.filter((_, j) => j !== i))}
                >
                  Retirer
                </button>
              </div>
              <Field label="Intitulé">
                <Input
                  value={ex.label}
                  onChange={(e) =>
                    setExtras((xs) => xs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                  }
                  placeholder="Ex. trois portes guanxi nommées"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Type">
                  <select
                    className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm"
                    value={ex.kind}
                    onChange={(e) =>
                      setExtras((xs) => xs.map((x, j) => (j === i ? { ...x, kind: e.target.value as FieldKind } : x)))
                    }
                  >
                    <option value="text">Texte</option>
                    <option value="choice">Choix</option>
                    <option value="scale">Échelle 1–5</option>
                    <option value="bool">Oui / non</option>
                  </select>
                </Field>
                <Field label="Poids (1–40)">
                  <Input
                    type="number"
                    min={1}
                    max={40}
                    value={ex.weight}
                    onChange={(e) =>
                      setExtras((xs) =>
                        xs.map((x, j) => (j === i ? { ...x, weight: Number(e.target.value) || 10 } : x)),
                      )
                    }
                  />
                </Field>
              </div>
              {ex.kind === "choice" && (
                <Field label="Options (virgules)">
                  <Input
                    value={ex.options}
                    onChange={(e) =>
                      setExtras((xs) => xs.map((x, j) => (j === i ? { ...x, options: e.target.value } : x)))
                    }
                  />
                </Field>
              )}
              <Field label="Consigne candidat">
                <Input
                  value={ex.hint}
                  onChange={(e) =>
                    setExtras((xs) => xs.map((x, j) => (j === i ? { ...x, hint: e.target.value } : x)))
                  }
                />
              </Field>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addExtra}>
            Ajouter un critère
          </Button>
        </fieldset>
        <Button type="submit" disabled={!canPublish || pub.isPending}>
          {pub.isPending ? "Publication…" : "Publier l’offre"}
        </Button>
      </form>
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
