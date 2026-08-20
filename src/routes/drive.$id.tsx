import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { DriveReader } from "@/components/drive-reader";
import { getDriveAsset } from "@/lib/drive-fn";
import { BRAND_HOST } from "@/lib/origin";

export const Route = createFileRoute("/drive/$id")({
  loader: async ({ params }) => {
    const id = Number(params.id);
    if (!Number.isFinite(id)) throw notFound();
    const asset = await getDriveAsset({ data: id });
    if (!asset) throw notFound();
    return asset;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Drive | Vera" }] };
    return {
      meta: [
        { title: `${loaderData.title} | GeniusDrive Vera` },
        { name: "description", content: loaderData.transcript?.slice(0, 170) ?? loaderData.title },
      ],
      links: [{ rel: "canonical", href: `${BRAND_HOST}/drive/${loaderData.id}` }],
    };
  },
  component: function DrivePage() {
    const asset = Route.useLoaderData();
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="mb-6 text-xs text-muted">
          <Link to="/drive" className="hover:text-ink">
            Drive
          </Link>
          {" · "}
          {asset.filename}
        </nav>
        <DriveReader asset={asset} />
        {asset.entityType === "knowledge" && asset.entityKey && (
          <p className="mt-6 text-sm">
            <Link to="/savoirs" className="text-primary">
              Retour Savoirs
            </Link>
            {" · fiche "}
            {asset.entityKey}
          </p>
        )}
        {asset.entityType === "job" && asset.entityKey && (
          <p className="mt-6 text-sm">
            <Link to="/jobs/$slug" params={{ slug: asset.entityKey }} className="text-primary">
              Offre liée
            </Link>
          </p>
        )}
      </div>
    );
  },
});
