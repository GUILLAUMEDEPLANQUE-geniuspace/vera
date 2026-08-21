import { Link } from "@tanstack/react-router";
import { FileText, Film, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Term } from "@/components/term";
import type { DriveAsset } from "@/lib/drive-fn";

function iconOf(type: string) {
  if (type === "video") return Film;
  if (type === "image") return ImageIcon;
  return FileText;
}

export function DriveCard({ asset }: { asset: DriveAsset }) {
  const Icon = iconOf(asset.assetType);
  return (
    <Link
      to="/drive/$id"
      params={{ id: String(asset.id) }}
      className="flex gap-3 rounded-xl border border-border bg-surface p-4 hover:border-primary"
    >
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
      <span className="min-w-0">
        <span className="block font-medium text-ink">{asset.title}</span>
        <span className="mt-1 block text-xs text-muted">
          {asset.assetType} · chunk {Math.round(asset.chunkSize / 1024)} Ko
          {asset.chunkCount ? ` · ${asset.chunkCount} part${asset.chunkCount > 1 ? "s" : ""}` : ""}
          {asset.byteSize ? ` · ${asset.byteSize} o` : ""}
        </span>
      </span>
    </Link>
  );
}

export function DriveReader({ asset }: { asset: DriveAsset }) {
  const src = asset.sourceUrl || `/drive/media/${asset.id}`;
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (asset.assetType !== "text" && !asset.mime.startsWith("text/")) return;
    if (asset.sourceUrl) return;
    let cancel = false;
    fetch(`/drive/media/${asset.id}`)
      .then((r) => r.text())
      .then((t) => {
        if (!cancel) setText(t);
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [asset]);

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <p className="text-xs tracking-wide text-primary uppercase">
        <Term k="drive">Fichiers</Term>
      </p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl">{asset.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {asset.filename} · {asset.mime} · chunks de {Math.round(asset.chunkSize / 1024)} Ko
        {asset.chunkCount ? ` · ${asset.chunkCount} parties` : ""} · HTTP Range
      </p>

      {asset.assetType === "video" && (
        <video className="mt-6 w-full rounded-lg bg-ink" src={src} controls playsInline preload="metadata" />
      )}
      {asset.assetType === "audio" && (
        <audio className="mt-6 w-full" src={src} controls preload="metadata" />
      )}
      {asset.assetType === "image" && (
        <img className="mt-6 w-full rounded-lg" src={src} alt={asset.title} />
      )}
      {asset.assetType === "pdf" && (
        <iframe title={asset.title} className="mt-6 h-[70vh] w-full rounded-lg border border-border" src={src} />
      )}
      {(asset.assetType === "text" || asset.mime.startsWith("text/")) && (
        <pre className="mt-6 max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-lg bg-paper p-4 text-sm leading-relaxed">
          {text ?? "Chargement…"}
        </pre>
      )}
      {asset.assetType === "file" && !asset.sourceUrl && (
        <p className="mt-6 text-sm">
          <a className="text-primary" href={src} download={asset.filename}>
            Télécharger {asset.filename}
          </a>
        </p>
      )}

      {asset.transcript && (
        <section className="mt-8">
          <h2 className="font-serif text-xl">Transcript / preuve</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{asset.transcript}</p>
        </section>
      )}
    </div>
  );
}
