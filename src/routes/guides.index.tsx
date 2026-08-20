import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BRAND_HOST } from "@/lib/origin";
import { PILLARS } from "@/lib/pillars";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/guides/")({
  head: () => ({
    meta: [
      { title: "Guides Vera — pénurie, grilles, offres machine-readable | Vera" },
      {
        name: "description",
        content:
          "Pages piliers : postes commerciaux difficiles 2026, métiers en pénurie, entretien interculturel, grilles publiques, offres lisibles par les agents IA.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Guides Vera — le référencement qui sert les professionnels" },
      {
        property: "og:description",
        content: "Pénurie réelle, grilles publiques, machine-readable. Pas un blog RH.",
      },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/guides` }],
    scripts: [
      ldScript(
        itemListJsonLd(
          "Guides Vera",
          PILLARS.map((p) => ({ name: p.title, url: `${BRAND_HOST}/guides/${p.slug}` })),
        ),
      ),
    ],
  }),
  component: GuidesIndex,
});

function GuidesIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">
          Vera
        </Link>
        {" · "}
        Guides
      </nav>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Guides</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Des pages piliers, pas un blog RH. Pénurie réelle, grilles publiques, offres que les agents IA peuvent
        manger. Google indexe. Les professionnels aussi.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {PILLARS.map((p) => (
          <Link
            key={p.slug}
            to="/guides/$slug"
            params={{ slug: p.slug }}
            className="rounded-xl border border-border bg-surface p-6 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <p className="text-xs tracking-wide text-primary uppercase">{p.kicker}</p>
            <h2 className="mt-2 font-serif text-2xl leading-tight">{p.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{p.excerpt}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Lire <ArrowRight className="size-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
