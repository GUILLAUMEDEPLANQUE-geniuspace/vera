import { createFileRoute, Link } from "@tanstack/react-router";
import { DriveCard } from "@/components/drive-reader";
import { Term, TermLegend } from "@/components/term";
import { listDriveAssets } from "@/lib/drive-fn";
import { BRAND_HOST } from "@/lib/origin";

export const Route = createFileRoute("/drive/")({
  loader: () => listDriveAssets({ data: {} }),
  head: () => ({
    meta: [
      { title: "Fichiers — visites et modes opératoires liés aux offres | Vera" },
      {
        name: "description",
        content:
          "Lecteur Vera : vidéos en chunks HTTP Range, modes opératoires, schémas. La preuve à côté du poste, pas un ZIP mort.",
      },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/drive` }],
  }),
  component: DriveIndex,
});

function DriveIndex() {
  const assets = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">
          Vera
        </Link>
        {" · "}
        Drive
      </nav>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
        <Term k="drive">Fichiers</Term>
      </h1>
      <p className="mt-3 text-lg text-muted">
        Fichiers et visites liés aux offres et aux <Term k="savoirs">fiches</Term>. Lecteur intégré, vidéo découpée
        en chunks, transcript de preuve. Ce n’est pas un cloud.
      </p>
      <div className="mt-3">
        <TermLegend keys={["drive", "proof", "ledger"]} />
      </div>
      <ul className="mt-10 grid gap-3">
        {assets.map((a) => (
          <li key={a.id}>
            <DriveCard asset={a} />
          </li>
        ))}
      </ul>
    </div>
  );
}
