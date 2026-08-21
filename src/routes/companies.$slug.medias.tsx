import { useQuery } from "@tanstack/react-query";
import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DriveCard } from "@/components/drive-reader";
import { mediaOf } from "@/lib/company-media";
import { listDriveAssets, listDriveFolders } from "@/lib/drive-fn";

const companyRoute = getRouteApi("/companies/$slug");

export const Route = createFileRoute("/companies/$slug/medias")({
  head: ({ params }) => ({
    meta: [{ title: `Médias — ${params.slug} | Vera` }],
  }),
  component: MediasTab,
});

function MediasTab() {
  const data = companyRoute.useLoaderData();
  const [play, setPlay] = useState(false);
  const driveQ = useQuery({
    queryKey: ["drive-company", data?.company.slug],
    queryFn: () => listDriveAssets({ data: { companySlug: data!.company.slug } }),
    enabled: Boolean(data),
  });
  const foldersQ = useQuery({
    queryKey: ["drive-folders", data?.company.slug],
    queryFn: () => listDriveFolders({ data: data!.company.slug }),
    enabled: Boolean(data),
  });
  if (!data) return null;
  const { company } = data;
  const media = mediaOf(company.slug, company.industry);
  const extras = driveQ.data ?? [];
  const folders = foldersQ.data ?? [];
  return (
    <div>
      <p className="text-xs tracking-wide text-primary uppercase">Photos et vidéo</p>
      <h2 className="mt-1 font-serif text-3xl">Le poste, pas le showroom</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Dossiers maison, galerie, vidéo — le Drive de la fiche, pas un FTP. Chaque fichier s’attache à une offre ou
        une épreuve.
      </p>
      {folders.length > 0 && (
        <p className="mt-4 text-sm text-muted">{folders.map((f) => `${f.name} · ${f.count}`).join("  ·  ")}</p>
      )}

      {media.video && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-ink">
          {play ? (
            <video src={media.video} className="aspect-video w-full object-cover" controls autoPlay playsInline />
          ) : (
            <button type="button" className="relative block w-full" onClick={() => setPlay(true)}>
              <img src={media.cover} alt="" className="aspect-video w-full object-cover opacity-80" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="rounded-full bg-surface px-5 py-3 text-sm font-medium text-ink">Lire la vidéo</span>
              </span>
            </button>
          )}
        </div>
      )}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {media.gallery.map((g) => (
          <li key={g.src} className="overflow-hidden rounded-2xl border border-border bg-surface">
            <img src={g.src} alt={g.caption} className="aspect-[16/10] w-full object-cover" />
            <p className="px-4 py-3 text-sm text-muted">{g.caption}</p>
          </li>
        ))}
      </ul>

      {extras.length > 0 && (
        <section className="mt-10">
          <h3 className="font-serif text-2xl">Drive {company.name}</h3>
          <ul className="mt-4 grid gap-3">
            {extras.map((a) => (
              <li key={a.id}>
                <DriveCard asset={a} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="mt-6 text-sm">
        <Link to="/drive" className="text-primary">
          Tout le Drive Vera
        </Link>
      </p>
    </div>
  );
}
