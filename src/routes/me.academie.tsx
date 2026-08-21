import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { houseAcademy, houseAssignAll, houseCreateCourse } from "@/lib/academy-fn";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/me/academie")({ component: Gate });

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
  return <HouseAcademy />;
}

function HouseAcademy() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["house-academy"], queryFn: () => houseAcademy() });
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("metier");
  const [audience, setAudience] = useState<"employee" | "candidate" | "both">("employee");
  const [mandatory, setMandatory] = useState(false);
  const [body, setBody] = useState("");

  const create = useMutation({
    mutationFn: () =>
      houseCreateCourse({
        data: { title, excerpt, category, audience, mandatory, body },
      }),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error);
      toast.success("Parcours publié sur la fiche entreprise");
      setTitle("");
      setExcerpt("");
      setBody("");
      void qc.invalidateQueries({ queryKey: ["house-academy"] });
    },
  });
  const assign = useMutation({
    mutationFn: (id: number) => houseAssignAll({ data: id }),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error);
      toast.success(`Assigné à ${res.n} salarié${res.n > 1 ? "s" : ""}`);
      void qc.invalidateQueries({ queryKey: ["house-academy"] });
    },
  });

  const data = q.data;
  if (data && !data.ok) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-4xl">Catalogue formation</h1>
        <p className="mt-3 text-muted">{data.error}</p>
        <p className="mt-4 text-sm">
          Liez une entreprise dans{" "}
          <Link to="/me/maison" className="text-primary">
            l’espace recruteur
          </Link>
          , puis revenez.
        </p>
      </div>
    );
  }

  const house = data?.ok ? data.house : null;
  const courses = data?.ok ? data.courses : [];
  const members = data?.ok ? data.members : [];
  const progress = data?.ok ? data.progress : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Recruteur · formation</p>
      <h1 className="mt-2 font-serif text-4xl">Académie {house?.name ?? ""}</h1>
      <p className="mt-2 text-muted">
        Le catalogue est public sur la fiche entreprise. Les scores restent aux salariés.
      </p>
      {house && (
        <p className="mt-3 text-sm">
          <Link to="/companies/$slug/academie" params={{ slug: house.slug }} className="text-primary">
            Voir la page publique
          </Link>
          {" · "}
          <Link to="/me/maison" className="text-primary">
            Pipeline recrutement
          </Link>
          {" · "}
          <Link to="/me/cck" className="text-primary">
            Champs CCK
          </Link>
        </p>
      )}

      <dl className="mt-8 grid grid-cols-3 gap-4">
        <Stat k="Parcours" v={String(courses.length)} />
        <Stat k="Salariés" v={String(members.length)} />
        <Stat k="Tenus" v={String(progress.filter((p) => p.status === "completed").length)} />
      </dl>

      <h2 className="mt-12 font-serif text-2xl">Catalogue</h2>
      <ul className="mt-4 space-y-3">
        {courses.map((c) => (
          <li key={c.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              {c.mandatory && <Badge tone="warn">Obligatoire</Badge>}
              <Badge>{c.audience === "employee" ? "Salariés" : c.audience === "candidate" ? "Candidats" : "Les deux"}</Badge>
            </div>
            {house && (
              <Link
                to="/companies/$slug/academie/$course"
                params={{ slug: house.slug, course: c.slug }}
                className="mt-1 block font-serif text-xl hover:text-primary"
              >
                {c.title}
              </Link>
            )}
            <p className="text-sm text-muted">
              {c.minutes} min · {c.enrolled} inscrits · {c.completed} tenus
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="mt-3"
              disabled={assign.isPending}
              onClick={() => assign.mutate(c.id)}
            >
              Assigner à tous les salariés
            </Button>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-serif text-2xl">Nouveau parcours</h2>
      <p className="mt-2 text-sm text-muted">
        Un paragraphe = un module. Publié tout de suite sur la fiche entreprise.
      </p>
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <Field label="Titre">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Consignation presse — ordre Vera" />
        </Field>
        <Field label="Chapeau">
          <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Le cadenas avant la clé." />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Catégorie">
            <select
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="accueil">Accueil</option>
              <option value="securite">Sécurité</option>
              <option value="metier">Métier</option>
              <option value="candidat">Candidat</option>
            </select>
          </Field>
          <Field label="Audience">
            <select
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
              value={audience}
              onChange={(e) => setAudience(e.target.value as typeof audience)}
            >
              <option value="employee">Salariés seulement</option>
              <option value="both">Salariés et candidats</option>
              <option value="candidate">Candidats (pré-embauche)</option>
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={mandatory}
            onChange={(e) => setMandatory(e.target.checked)}
          />
          Obligatoire — assigné à tous les salariés
        </label>
        <Field label="Modules (paragraphes séparés par une ligne vide)">
          <Textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            placeholder={"Identifier les énergies.\n\nCadenas perso, puis essai de remise."}
          />
        </Field>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Publication…" : "Publier sur la fiche"}
        </Button>
      </form>

      <h2 className="mt-12 font-serif text-2xl">Salariés</h2>
      {members.length === 0 && <p className="mt-3 text-sm text-muted">Personne n’a encore rejoint. Ils cliquent « Je suis salarié ici » sur la page académie.</p>}
      <ul className="mt-4 space-y-2">
        {members.map((m) => {
          const rows = progress.filter((p) => p.userId === m.userId);
          const done = rows.filter((p) => p.status === "completed").length;
          return (
            <li key={m.userId} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
              <span>
                <span className="font-medium">{m.role === "hr" ? "RH" : "Salarié"}</span>
                <span className="text-subtle"> · {String(m.createdAt).slice(0, 10)}</span>
              </span>
              <span className="text-muted">
                {done}/{rows.length || 0} tenus
              </span>
            </li>
          );
        })}
      </ul>
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

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-border pt-3">
      <dt className="text-xs tracking-wide text-muted uppercase">{k}</dt>
      <dd className="mt-1 font-serif text-2xl">{v}</dd>
    </div>
  );
}
