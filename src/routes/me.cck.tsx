import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CckFieldInput } from "@/components/cck/field-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  houseAddCckField,
  houseCck,
  listCckValues,
  saveCckValues,
  type CckKind,
} from "@/lib/cck-fn";
import { CCK_KINDS } from "@/lib/cck-kinds";

export const Route = createFileRoute("/me/cck")({ component: Gate });

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
  return <CckStudio />;
}

function CckStudio() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["house-cck"], queryFn: () => houseCck() });
  const [type, setType] = useState("job");
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<CckKind>("text");
  const [options, setOptions] = useState("");
  const [hint, setHint] = useState("");
  const [filterable, setFilterable] = useState(true);
  const [onCard, setOnCard] = useState(true);
  const [entity, setEntity] = useState<{ kind: string; id: number } | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});

  const add = useMutation({
    mutationFn: () =>
      houseAddCckField({
        data: { type, name, label, kind, options, hint, filterable, onCard },
      }),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error);
      toast.success("Champ ajouté au type");
      setName("");
      setLabel("");
      setHint("");
      void qc.invalidateQueries({ queryKey: ["house-cck"] });
    },
  });

  const valuesQ = useQuery({
    queryKey: ["cck-values", entity?.kind, entity?.id],
    queryFn: () => listCckValues({ data: { kind: entity!.kind, id: entity!.id } }),
    enabled: Boolean(entity),
  });

  const save = useMutation({
    mutationFn: () => saveCckValues({ data: { kind: entity!.kind, id: entity!.id, values: vals } }),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error);
      toast.success("Valeurs enregistrées");
      void qc.invalidateQueries({ queryKey: ["cck-values"] });
    },
  });

  const data = q.data;
  if (data && !data.ok) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-4xl">CCK maison</h1>
        <p className="mt-3 text-muted">{data.error}</p>
        <p className="mt-4 text-sm">
          Liez une entreprise dans{" "}
          <Link to="/me/maison" className="text-primary">
            l’espace recruteur
          </Link>
          .
        </p>
      </div>
    );
  }

  const fields = (data?.ok ? data.fields : []).filter((f) => f.typeSlug === type);
  const jobs = data?.ok ? data.jobs : [];
  const courses = data?.ok ? data.courses : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Recruteur · CCK</p>
      <h1 className="mt-2 font-serif text-4xl">Champs de {data?.ok ? data.house.name : "la maison"}</h1>
      <p className="mt-2 text-muted">
        Les mêmes kinds que JoomCCK (texte, choix, date, image, galerie, vidéo, audio, fichier, relation). Pas le
        paywall Joomla. Un recruteur ajoute une épreuve par le{" "}
        <Link to="/me/epreuve" className="text-primary">
          guide étape par étape
        </Link>
        .
      </p>
      <p className="mt-3 text-sm">
        <Link to="/me/maison" className="text-primary">
          Pipeline
        </Link>
        {" · "}
        <Link to="/me/academie" className="text-primary">
          Catalogue
        </Link>
        {" · "}
        <Link to="/me/drive" className="text-primary">
          Drive
        </Link>
        {" · "}
        <Link to="/me/epreuve" className="text-primary">
          Épreuve
        </Link>
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {(data?.ok ? data.types : []).map((t) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => {
              setType(t.slug);
              setEntity(null);
            }}
            className="h-11 rounded-lg border border-border px-3 text-sm"
          >
            <span className={type === t.slug ? "text-ink" : "text-muted"}>{t.label}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">
        {(data?.ok ? data.types : []).find((t) => t.slug === type)?.description}
      </p>

      <h2 className="mt-10 font-serif text-2xl">Champs</h2>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {fields.map((f) => (
          <li key={f.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <div>
              <p className="font-medium">{f.label}</p>
              <p className="text-xs text-subtle">
                {f.name} · {f.kind}
                {f.filterable ? " · filtre" : ""}
                {f.onCard ? " · carte" : ""}
              </p>
            </div>
            <Badge tone={f.house ? "primary" : "default"}>{f.house ? "Maison" : "Vera"}</Badge>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-serif text-2xl">Ajouter un champ</h2>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <div className="space-y-1.5">
          <Label>Nom technique</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="visite_nuit" />
        </div>
        <div className="space-y-1.5">
          <Label>Libellé</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Visite de nuit" />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <select
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as CckKind)}
          >
            {CCK_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.group} · {k.label} ({k.joom})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Options (virgules)</Label>
          <Input value={options} onChange={(e) => setOptions(e.target.value)} placeholder="A, B, C" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Indice recruteur</Label>
          <Input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="Visible sur la fiche, pas un slogan." />
        </div>
        <label className="flex h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={filterable} onChange={(e) => setFilterable(e.target.checked)} />
          Filtrable
        </label>
        <label className="flex h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={onCard} onChange={(e) => setOnCard(e.target.checked)} />
          Sur la carte
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={add.isPending}>
            Publier le champ
          </Button>
        </div>
      </form>

      <h2 className="mt-12 font-serif text-2xl">Valeurs</h2>
      <p className="mt-2 text-sm text-muted">Choisissez une offre ou un parcours, puis remplissez les champs.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {type === "job" &&
          jobs.map((j) => (
            <button
              key={j.id}
              type="button"
              className="h-11 rounded-lg border border-border px-3 text-sm"
              onClick={() => {
                setEntity({ kind: "job", id: j.id });
                setVals({});
              }}
            >
              {j.title}
            </button>
          ))}
        {type === "course" &&
          courses.map((c) => (
            <button
              key={c.id}
              type="button"
              className="h-11 rounded-lg border border-border px-3 text-sm"
              onClick={() => {
                setEntity({ kind: "course", id: c.id });
                setVals({});
              }}
            >
              {c.title}
            </button>
          ))}
      </div>

      {entity && (
        <form
          className="mt-6 space-y-3 rounded-xl border border-border bg-surface p-5"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          {fields.map((f) => {
            const existing = (valuesQ.data ?? []).find((v) => v.name === f.name);
            const value = vals[f.name] ?? existing?.value ?? "";
            return (
              <div key={f.name} className="space-y-1.5">
                <Label>
                  {f.label}
                  <span className="ml-2 text-xs font-normal text-subtle">{f.kind}</span>
                </Label>
                <CckFieldInput
                  kind={f.kind}
                  value={value === "oui" ? "true" : value === "non" ? "false" : value}
                  options={f.options}
                  hint={f.hint}
                  onChange={(v) => setVals((prev) => ({ ...prev, [f.name]: v }))}
                />
              </div>
            );
          })}
          <Button type="submit" disabled={save.isPending}>
            Enregistrer
          </Button>
        </form>
      )}
    </div>
  );
}
