import { createFileRoute, Link } from "@tanstack/react-router";
import { DEPTS, REGIONS, tensionLabel } from "@/lib/geo";
import { BRAND_HOST } from "@/lib/origin";
import { ldScript } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tension")({
  head: () => ({
    meta: [
      { title: "Carte de tension territoriale 2026 | Vera" },
      {
        name: "description",
        content:
          "Tension par région et département : BMO 2026 + offres Vera. Pénurie, marché tendu, bassin plus large. Public, pas un baromètre RH.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/tension` }],
    scripts: [ldScript({ "@context": "https://schema.org", "@type": "Dataset", name: "Tension territoriale Vera 2026", url: `${BRAND_HOST}/tension` })],
  }),
  component: TensionPage,
});

function tone(n: number) {
  if (n >= 78) return "bg-bad/80 text-bg";
  if (n >= 68) return "bg-warn/80 text-ink";
  if (n >= 58) return "bg-paper text-ink";
  return "bg-good/20 text-ink";
}

function TensionPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-primary uppercase">Observatoire</p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Tension territoriale</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Pas une carte dessinée pour faire joli. Des scores par région et département, calés BMO 2026 + nos offres. Cliquez : la page geo s’ouvre, avec les salaires.
      </p>
      <ul className="mt-6 flex flex-wrap gap-3 text-xs text-muted">
        <li><span className="mr-1 inline-block size-3 bg-bad/80" /> pénurie ≥ 78</li>
        <li><span className="mr-1 inline-block size-3 bg-warn/80" /> tendu ≥ 68</li>
        <li><span className="mr-1 inline-block size-3 bg-paper ring-1 ring-border" /> moyen</li>
        <li><span className="mr-1 inline-block size-3 bg-good/20" /> plus large</li>
      </ul>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {REGIONS.map((r) => {
          const ds = DEPTS.filter((d) => d.region === r.slug);
          return (
            <section key={r.slug}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-2xl">
                  <Link to="/lieux/regions/$slug" params={{ slug: r.slug }} className="hover:text-primary">
                    {r.name}
                  </Link>
                </h2>
                <span className="text-sm tabular-nums text-muted">{r.tension} · {tensionLabel(r.tension)}</span>
              </div>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {ds.map((d) => (
                  <li key={d.code}>
                    <Link
                      to="/lieux/departements/$slug"
                      params={{ slug: d.slug }}
                      title={`${d.name} — ${d.tension}`}
                      className={cn("inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-xs tabular-nums", tone(d.tension))}
                    >
                      {d.code}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
