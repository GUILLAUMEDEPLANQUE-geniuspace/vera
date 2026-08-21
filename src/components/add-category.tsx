import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { adminCreateCategory } from "@/lib/hub-fn";
import { getMyProfile } from "@/lib/profile-fn";

export function AddCategoryCard() {
  const { user } = useCurrentUserState();
  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: () => getMyProfile(),
    enabled: Boolean(user),
  });
  const isOp = profile.data?.role === "operator";

  if (!user) {
    return (
      <aside className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-xs tracking-wide text-primary uppercase">Backend</p>
        <h2 className="mt-1 font-serif text-2xl">Ajouter une catégorie</h2>
        <p className="mt-2 text-sm text-muted">
          Connectez-vous, ouvrez la console, phrase d’opérateur : « l’honneur est public ». Ensuite vous créez
          catégories, champs, fiches.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/login" className="text-sm font-medium text-primary">
            Connexion
          </Link>
          <Link to="/admin" className="text-sm font-medium text-primary">
            Console
          </Link>
        </div>
      </aside>
    );
  }

  if (!isOp) {
    return (
      <aside className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-xs tracking-wide text-primary uppercase">Backend</p>
        <h2 className="mt-1 font-serif text-2xl">Devenir opérateur</h2>
        <p className="mt-2 text-sm text-muted">
          Allez sur <Link to="/admin" className="text-primary">/admin</Link> et saisissez « l’honneur est public ».
        </p>
      </aside>
    );
  }

  return <CategoryForm />;
}

function CategoryForm() {
  const qc = useQueryClient();
  const [cat, setCat] = useState({ slug: "", title: "", kicker: "", description: "" });
  const add = useMutation({
    mutationFn: () => adminCreateCategory({ data: cat }),
    onSuccess: async (r) => {
      if (!r.ok) return toast.error(r.error);
      toast.success("Catégorie publiée");
      setCat({ slug: "", title: "", kicker: "", description: "" });
      await qc.invalidateQueries({ queryKey: ["hub-cats"] });
      await qc.invalidateQueries({ queryKey: ["savoirs"] });
    },
  });
  return (
    <form
      className="rounded-2xl border border-border bg-surface p-5"
      onSubmit={(e) => {
        e.preventDefault();
        add.mutate();
      }}
    >
      <p className="text-xs tracking-wide text-primary uppercase">Opérateur</p>
      <h2 className="mt-1 font-serif text-2xl">Nouvelle catégorie de fiches</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Slug</Label>
          <Input value={cat.slug} onChange={(e) => setCat({ ...cat, slug: e.target.value })} placeholder="sante" />
        </div>
        <div className="space-y-1.5">
          <Label>Titre</Label>
          <Input value={cat.title} onChange={(e) => setCat({ ...cat, title: e.target.value })} placeholder="Santé & soin" />
        </div>
        <div className="space-y-1.5">
          <Label>Kicker</Label>
          <Input value={cat.kicker} onChange={(e) => setCat({ ...cat, kicker: e.target.value })} placeholder="Terrain" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Description</Label>
          <Textarea
            rows={3}
            value={cat.description}
            onChange={(e) => setCat({ ...cat, description: e.target.value })}
          />
        </div>
      </div>
      <Button className="mt-4" type="submit" disabled={add.isPending}>
        Publier la catégorie
      </Button>
    </form>
  );
}
