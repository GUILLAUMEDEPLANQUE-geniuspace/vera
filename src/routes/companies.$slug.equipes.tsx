import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { CultureRadar } from "@/components/culture-radar";
import { Voices } from "@/components/offer/voices";
import { voicesOf } from "@/lib/company-media";
import { cultureOf } from "@/lib/culture";

const companyRoute = getRouteApi("/companies/$slug");

export const Route = createFileRoute("/companies/$slug/equipes")({
  head: ({ params }) => ({
    meta: [{ title: `Équipes — ${params.slug} | Vera` }],
  }),
  component: EquipesTab,
});

function EquipesTab() {
  const data = companyRoute.useLoaderData();
  if (!data) return null;
  const { company } = data;
  const culture = cultureOf(company.slug);
  const voices = voicesOf(company.slug);
  return (
    <div className="space-y-12">
      <section>
        <p className="text-xs tracking-wide text-primary uppercase">People</p>
        <h2 className="mt-1 font-serif text-3xl">Qui tient ici</h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Pas une mosaïque sourire. Des voix filmées au téléphone, et la carte de culture — parole, hiérarchie, tempo.
        </p>
      </section>
      {voices.length > 0 ? (
        <Voices voices={voices} />
      ) : (
        <p className="text-sm text-muted">Pas encore de capsule équipe pour cette maison.</p>
      )}
      <section>
        <h2 className="font-serif text-2xl">Management et semaine</h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink">{culture.management}</p>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{culture.weekStyle}</p>
        <p className="mt-2 text-sm text-muted">Langues : {culture.languages.join(", ")}</p>
      </section>
      <CultureRadar culture={culture} />
    </div>
  );
}
