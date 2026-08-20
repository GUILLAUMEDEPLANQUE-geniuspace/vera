import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listMyArticles, listMyBadges, saveArticle } from "@/lib/journal-fn";
import { uploadProof } from "@/lib/ops-fn";

export const Route = createFileRoute("/me/carnet")({ component: Gate });

function Gate() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="mx-auto max-w-3xl px-4 py-16"><div className="h-64 animate-pulse rounded-xl bg-paper" /></div>;
  if (!user) return <RedirectToSignIn />;
  return <Carnet name={user.displayName ?? "Vous"} />;
}

function Carnet({ name }: { name: string }) {
  const qc = useQueryClient();
  const arts = useQuery({ queryKey: ["my-arts"], queryFn: () => listMyArticles() });
  const badges = useQuery({ queryKey: ["my-badges"], queryFn: () => listMyBadges() });
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileB64, setFileB64] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState("");
  const pub = useMutation({
    mutationFn: async () => {
      let note: string | undefined;
      let storedName = fileName || undefined;
      if (fileB64 && fileMime && fileName) {
        const up = await uploadProof({ data: { fileName, mime: fileMime, bodyB64: fileB64 } });
        if (!up.ok) throw new Error("error" in up ? up.error : "Upload impossible");
        note = `/fichiers/${up.id}`;
        storedName = fileName;
      }
      return saveArticle({
        data: {
          title,
          excerpt,
          body,
          kind: storedName ? "fichier" : "note",
          tags: [],
          fileName: storedName,
          fileNote: note,
          authorKind: "candidate",
          authorName: name,
          published: true,
        },
      });
    },
    onSuccess: async () => {
      toast.success("Carnet mis à jour");
      setTitle("");
      setExcerpt("");
      setBody("");
      setFileName("");
      setFileB64(null);
      setFileMime("");
      await qc.invalidateQueries({ queryKey: ["my-arts"] });
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Candidat</p>
      <h1 className="mt-2 font-serif text-4xl">Carnet de preuves</h1>
      <p className="mt-2 text-muted">
        Ça remplace le CV chronologique. Badges d’épreuve, notes, fichiers. Public une fois publié.
      </p>
      <p className="mt-2 text-sm">
        <Link to="/talents/$slug" params={{ slug: name.toLowerCase().replace(/\s+/g, "-") }} className="text-primary">
          Voir le carnet public
        </Link>
        {" · "}
        <Link to="/journal" className="text-primary">
          Journal
        </Link>
      </p>
      {(badges.data ?? []).length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {badges.data!.map((b) => (
            <li key={b.id} className="rounded-full bg-paper px-3 py-1 text-xs">
              {b.label} · {b.score}
            </li>
          ))}
        </ul>
      )}
      <form
        className="mt-8 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim().length < 8 || body.trim().length < 40) {
            toast.error("Écrivez une vraie note");
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
          <Label>Preuve</Label>
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
        <Button type="submit" disabled={pub.isPending}>{pub.isPending ? "Publication…" : "Publier"}</Button>
      </form>
      <ul className="mt-8 space-y-3">
        {(arts.data ?? []).map((a) => (
          <li key={a.id}>
            <Link to="/journal/$slug" params={{ slug: a.slug }} className="font-serif text-xl text-primary">{a.title}</Link>
            <p className="text-sm text-muted">{a.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
