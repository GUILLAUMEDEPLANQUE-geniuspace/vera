import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminUploadDrive, listDriveAssets } from "@/lib/drive-fn";
import {
  adminCreateArticle,
  adminCreateCategory,
  adminCreateField,
  adminListArticles,
  adminToggleArticle,
  listHubCategories,
} from "@/lib/hub-fn";
import { Term } from "@/components/term";

async function fileToChunks(file: File, chunkSize: number): Promise<string[]> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const out: string[] = [];
  for (let i = 0; i < buf.length; i += chunkSize) {
    const slice = buf.subarray(i, i + chunkSize);
    let s = "";
    for (let j = 0; j < slice.length; j += 1) s += String.fromCharCode(slice[j]!);
    out.push(btoa(s));
  }
  return out;
}

export function HubAdmin() {
  const qc = useQueryClient();
  const cats = useQuery({ queryKey: ["hub-cats"], queryFn: () => listHubCategories() });
  const arts = useQuery({ queryKey: ["admin-hub-arts"], queryFn: () => adminListArticles() });
  const drive = useQuery({ queryKey: ["admin-drive"], queryFn: () => listDriveAssets({ data: {} }) });

  const [cat, setCat] = useState({ slug: "", title: "", kicker: "", description: "" });
  const [field, setField] = useState({ categoryId: 0, key: "", label: "", type: "text", options: "" });
  const [art, setArt] = useState({
    categoryId: 0,
    slug: "",
    title: "",
    excerpt: "",
    body: "",
    skills: "",
    minutes: 8,
  });
  const [up, setUp] = useState({
    title: "",
    entityType: "knowledge",
    entityKey: "",
    transcript: "",
    chunkSize: 262144,
    file: null as File | null,
  });

  const addCat = useMutation({
    mutationFn: () => adminCreateCategory({ data: cat }),
    onSuccess: async (r) => {
      if (!r.ok) return toast.error(r.error);
      toast.success("Catégorie tenue");
      await qc.invalidateQueries({ queryKey: ["hub-cats"] });
    },
  });
  const addField = useMutation({
    mutationFn: () => adminCreateField({ data: field }),
    onSuccess: async (r) => {
      if (!r.ok) return toast.error(r.error);
      toast.success("Champ tenu");
      await qc.invalidateQueries({ queryKey: ["hub-cats"] });
    },
  });
  const addArt = useMutation({
    mutationFn: () => adminCreateArticle({ data: art }),
    onSuccess: async (r) => {
      if (!r.ok) return toast.error(r.error);
      toast.success("Fiche publiée");
      await qc.invalidateQueries({ queryKey: ["admin-hub-arts"] });
    },
  });
  const tog = useMutation({
    mutationFn: (p: { id: number; published: boolean }) => adminToggleArticle({ data: p }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-hub-arts"] }),
  });
  const upload = useMutation({
    mutationFn: async () => {
      if (!up.file) throw new Error("Fichier");
      const chunks = await fileToChunks(up.file, up.chunkSize);
      return adminUploadDrive({
        data: {
          title: up.title || up.file.name,
          filename: up.file.name,
          mime: up.file.type || "application/octet-stream",
          chunkSize: up.chunkSize,
          chunks,
          entityType: up.entityType,
          entityKey: up.entityKey,
          transcript: up.transcript,
        },
      });
    },
    onSuccess: async (r) => {
      if (!r.ok) return toast.error("error" in r ? r.error : "Échec");
      toast.success("Drive : fichier en chunks");
      await qc.invalidateQueries({ queryKey: ["admin-drive"] });
    },
    onError: () => toast.error("Fichier trop lourd pour la démo lab (gardez < 4 Mo)"),
  });

  const catList = cats.data ?? [];

  return (
    <div className="mt-16 space-y-12">
      <div>
        <p className="text-xs tracking-wide text-primary uppercase">Hub</p>
        <h2 className="mt-1 font-serif text-2xl">
          <Term k="savoirs">Savoirs</Term> & <Term k="drive">GeniusDrive</Term>
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Catégories, champs libres, fiches, fichiers en chunks. C’est ici que le marché, le droit et la robotique
          deviennent crawlables — et liés aux offres.
        </p>
      </div>

      <section>
        <h3 className="font-serif text-xl">Catégories</h3>
        <ul className="mt-3 space-y-1 text-sm">
          {catList.map((c) => (
            <li key={c.id}>
              {c.title} · {c.slug} · {c.articleCount} fiche{c.articleCount > 1 ? "s" : ""} · {c.fields.length} champ
              {c.fields.length > 1 ? "s" : ""}
            </li>
          ))}
        </ul>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            addCat.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input value={cat.slug} onChange={(e) => setCat({ ...cat, slug: e.target.value })} placeholder="robotique" />
          </div>
          <div className="space-y-1.5">
            <Label>Titre</Label>
            <Input value={cat.title} onChange={(e) => setCat({ ...cat, title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Kicker</Label>
            <Input value={cat.kicker} onChange={(e) => setCat({ ...cat, kicker: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea value={cat.description} onChange={(e) => setCat({ ...cat, description: e.target.value })} rows={3} />
          </div>
          <Button type="submit" disabled={addCat.isPending}>
            Ajouter la catégorie
          </Button>
        </form>
      </section>

      <section>
        <h3 className="font-serif text-xl">Champs (par catégorie)</h3>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            addField.mutate();
          }}
        >
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Catégorie</Label>
            <select
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
              value={field.categoryId}
              onChange={(e) => setField({ ...field, categoryId: Number(e.target.value) })}
            >
              <option value={0}>Choisir</option>
              {catList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Clé</Label>
            <Input value={field.key} onChange={(e) => setField({ ...field, key: e.target.value })} placeholder="norme" />
          </div>
          <div className="space-y-1.5">
            <Label>Libellé</Label>
            <Input value={field.label} onChange={(e) => setField({ ...field, label: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <select
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
              value={field.type}
              onChange={(e) => setField({ ...field, type: e.target.value })}
            >
              <option value="text">texte</option>
              <option value="textarea">long</option>
              <option value="number">nombre</option>
              <option value="select">liste</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Options (virgules)</Label>
            <Input value={field.options} onChange={(e) => setField({ ...field, options: e.target.value })} />
          </div>
          <Button type="submit" disabled={addField.isPending || !field.categoryId}>
            Ajouter le champ
          </Button>
        </form>
      </section>

      <section>
        <h3 className="font-serif text-xl">Fiche Savoirs</h3>
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            addArt.mutate();
          }}
        >
          <select
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
            value={art.categoryId}
            onChange={(e) => setArt({ ...art, categoryId: Number(e.target.value) })}
          >
            <option value={0}>Catégorie</option>
            {catList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <Input placeholder="slug" value={art.slug} onChange={(e) => setArt({ ...art, slug: e.target.value })} />
          <Input placeholder="titre" value={art.title} onChange={(e) => setArt({ ...art, title: e.target.value })} />
          <Textarea placeholder="extrait" rows={2} value={art.excerpt} onChange={(e) => setArt({ ...art, excerpt: e.target.value })} />
          <Textarea placeholder="corps" rows={6} value={art.body} onChange={(e) => setArt({ ...art, body: e.target.value })} />
          <Input
            placeholder="compétences, séparées par des virgules"
            value={art.skills}
            onChange={(e) => setArt({ ...art, skills: e.target.value })}
          />
          <Input
            type="number"
            value={art.minutes}
            onChange={(e) => setArt({ ...art, minutes: Number(e.target.value) })}
          />
          <Button type="submit" disabled={addArt.isPending || !art.categoryId}>
            Publier la fiche
          </Button>
        </form>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {(arts.data ?? []).map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span>
                {a.title} · {a.cat} · {a.published ? "public" : "retiré"}
              </span>
              <Button size="sm" variant="secondary" onClick={() => tog.mutate({ id: a.id, published: !a.published })}>
                {a.published ? "Retirer" : "Publier"}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-serif text-xl">Upload Drive (chunks)</h3>
        <p className="mt-1 text-sm text-muted">
          Taille de chunk par défaut 256 Ko. Vidéo / PDF / texte. Liez à une offre (slug) ou une fiche Savoirs.
        </p>
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            upload.mutate();
          }}
        >
          <Input placeholder="titre" value={up.title} onChange={(e) => setUp({ ...up, title: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
              value={up.entityType}
              onChange={(e) => setUp({ ...up, entityType: e.target.value })}
            >
              <option value="knowledge">fiche Savoirs</option>
              <option value="job">offre</option>
              <option value="company">maison</option>
            </select>
            <Input
              placeholder="slug de la fiche / offre"
              value={up.entityKey}
              onChange={(e) => setUp({ ...up, entityKey: e.target.value })}
            />
          </div>
          <Input
            type="number"
            value={up.chunkSize}
            onChange={(e) => setUp({ ...up, chunkSize: Number(e.target.value) })}
          />
          <Textarea
            placeholder="transcript / preuve"
            rows={2}
            value={up.transcript}
            onChange={(e) => setUp({ ...up, transcript: e.target.value })}
          />
          <Input
            type="file"
            onChange={(e) => setUp({ ...up, file: e.target.files?.[0] ?? null })}
          />
          <Button type="submit" disabled={upload.isPending || !up.file}>
            Envoyer en chunks
          </Button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {(drive.data ?? []).map((d) => (
            <li key={d.id}>
              {d.title} · {d.assetType} · {d.chunkCount} parts · {Math.round(d.chunkSize / 1024)} Ko
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
