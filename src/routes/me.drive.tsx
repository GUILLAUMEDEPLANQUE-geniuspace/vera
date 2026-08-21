import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Film, Folder, Image as ImageIcon, Music } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DriveReader } from "@/components/drive-reader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { houseDrive, houseMkdir, houseUploadDrive, type DriveAsset } from "@/lib/drive-fn";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/me/drive")({ component: Gate });

const TYPES = [
  { id: "", label: "Tous" },
  { id: "image", label: "Images" },
  { id: "video", label: "Vidéos" },
  { id: "audio", label: "Audio" },
  { id: "pdf", label: "PDF" },
  { id: "file", label: "Fichiers" },
];

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

function iconOf(type: string) {
  if (type === "video") return Film;
  if (type === "audio") return Music;
  if (type === "image") return ImageIcon;
  return FileText;
}

function Gate() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-xl bg-paper" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <HouseDrive />;
}

function HouseDrive() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["house-drive"], queryFn: () => houseDrive() });
  const [folder, setFolder] = useState<number | null>(null);
  const [type, setType] = useState("");
  const [qtext, setQtext] = useState("");
  const [dir, setDir] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState<DriveAsset | null>(null);

  const mkdir = useMutation({
    mutationFn: () => houseMkdir({ data: dir }),
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error);
      toast.success("Dossier créé");
      setDir("");
      void qc.invalidateQueries({ queryKey: ["house-drive"] });
    },
  });
  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Fichier");
      const chunks = await fileToChunks(file, 262144);
      return houseUploadDrive({
        data: {
          title: title || file.name,
          filename: file.name,
          mime: file.type || "application/octet-stream",
          chunkSize: 262144,
          chunks,
          folderId: folder,
          transcript: "",
        },
      });
    },
    onSuccess: (res) => {
      if (!res.ok) return toast.error(res.error);
      toast.success("Fichier dans le Drive maison");
      setFile(null);
      setTitle("");
      void qc.invalidateQueries({ queryKey: ["house-drive"] });
    },
    onError: () => toast.error("Fichier trop lourd (gardez < 4 Mo)"),
  });

  if (q.data && !q.data.ok) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-4xl">Drive maison</h1>
        <p className="mt-3 text-muted">{q.data.error}</p>
        <Link to="/me/maison" className="mt-4 inline-block text-primary">
          Lier une entreprise
        </Link>
      </div>
    );
  }

  const folders = q.data?.ok ? q.data.folders : [];
  const all = q.data?.ok ? q.data.assets : [];
  const assets = all.filter((a) => {
    if (folder != null && a.folderId !== folder) return false;
    if (type && a.assetType !== type) return false;
    if (qtext && !`${a.title} ${a.filename}`.toLowerCase().includes(qtext.toLowerCase())) return false;
    return true;
  });
  const house = q.data?.ok ? q.data.house : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Recruteur · médias</p>
      <h1 className="mt-2 font-serif text-4xl">Drive {house?.name ?? ""}</h1>
      <p className="mt-2 max-w-xl text-muted">
        Dossiers, types, upload, aperçu, attache CCK. Pas un FTP Joomla : le fichier vit à côté de l’offre et de
        l’épreuve. Vidéo en chunks HTTP Range, transcript possible.
      </p>
      <p className="mt-3 text-sm">
        <Link to="/me/epreuve" className="text-primary">
          Guide épreuve
        </Link>
        {" · "}
        <Link to="/drive" className="text-primary">
          Lecteur public
        </Link>
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="space-y-2">
          <p className="text-xs tracking-wide text-muted uppercase">Dossiers</p>
          <button
            type="button"
            onClick={() => setFolder(null)}
            className={cn(
              "flex h-11 w-full items-center gap-2 rounded-lg border px-3 text-left text-sm",
              folder == null ? "border-primary bg-surface" : "border-border",
            )}
          >
            <Folder className="size-4 text-primary" />
            Tous
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFolder(f.id)}
              className={cn(
                "flex h-11 w-full items-center gap-2 rounded-lg border px-3 text-left text-sm",
                folder === f.id ? "border-primary bg-surface" : "border-border",
              )}
            >
              <Folder className="size-4 text-primary" />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="tabular-nums text-xs text-subtle">{f.count}</span>
            </button>
          ))}
          <form
            className="flex gap-2 pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              mkdir.mutate();
            }}
          >
            <Input value={dir} onChange={(e) => setDir(e.target.value)} placeholder="Nouveau dossier" />
            <Button type="submit" variant="secondary" disabled={!dir.trim() || mkdir.isPending}>
              Créer
            </Button>
          </form>
        </aside>

        <div>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={cn(
                  "h-11 rounded-lg border px-3 text-sm",
                  type === t.id ? "border-primary bg-surface text-ink" : "border-border text-muted",
                )}
              >
                {t.label}
              </button>
            ))}
            <Input className="max-w-xs" value={qtext} onChange={(e) => setQtext(e.target.value)} placeholder="Chercher" />
          </div>

          <form
            className="mt-4 grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              upload.mutate();
            }}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Fichier</Label>
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Titre</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Geste consignation" />
              </div>
            </div>
            <Button type="submit" className="self-end" disabled={!file || upload.isPending}>
              {upload.isPending ? "Envoi…" : "Déposer"}
            </Button>
          </form>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {assets.length === 0 && <li className="text-sm text-muted">Aucun fichier dans ce dossier.</li>}
            {assets.map((a) => {
              const Icon = iconOf(a.assetType);
              const src = a.sourceUrl || `/drive/media/${a.id}`;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setPreview(a)}
                    className="w-full overflow-hidden rounded-xl border border-border bg-surface text-left hover:border-primary"
                  >
                    {a.assetType === "image" ? (
                      <img src={src} alt="" className="aspect-video w-full object-cover" />
                    ) : (
                      <div className="grid aspect-video place-items-center bg-paper">
                        <Icon className="size-8 text-primary" />
                      </div>
                    )}
                    <span className="block p-3">
                      <span className="block font-medium">{a.title}</span>
                      <span className="mt-1 flex items-center gap-2 text-xs text-subtle">
                        <Badge>{a.assetType}</Badge>
                        {a.byteSize ? `${Math.round(a.byteSize / 1024)} Ko` : "lien"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {preview && (
            <div className="mt-8">
              <DriveReader asset={preview} />
              <p className="mt-3 text-xs text-subtle">
                URL publique : {preview.sourceUrl || `/drive/media/${preview.id}`} — collable dans un champ CCK
                image / vidéo / fichier.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
