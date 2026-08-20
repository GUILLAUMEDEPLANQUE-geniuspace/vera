import { createFileRoute, Link } from "@tanstack/react-router";
import { BarrierMatrix } from "@/components/barrier-matrix";
import { GeoJobs } from "@/components/geo-jobs";
import { SeoFaq } from "@/components/seo-faq";
import { Button } from "@/components/ui/button";
import { listJobs } from "@/lib/jobs-fn";
import { listOpenSlots } from "@/lib/ops-fn";
import { BRAND_HOST } from "@/lib/origin";
import { itemListJsonLd, ldScript } from "@/lib/seo";
import { vivierOf } from "@/lib/viviers";
import { WEEKDAYS } from "@/lib/weekdays";

export const Route = createFileRoute("/viviers/$slug")({
  loader: async ({ params }) => {
    const vivier = vivierOf(params.slug) ?? null;
    const jobs = await listJobs({ data: vivier ? { pool: vivier.pool } : {} });
    const slots = vivier?.pool === "senior-fractional" ? await listOpenSlots() : [];
    return { vivier, jobs, slots };
  },
  head: ({ loaderData, params }) => {
    const v = loaderData?.vivier ?? vivierOf(params.slug);
    if (!v) return { meta: [{ title: "Vivier | Vera" }] };
    const url = `${BRAND_HOST}/viviers/${v.slug}`;
    return {
      meta: [
        { title: v.title },
        { name: "description", content: v.description.slice(0, 170) },
        { name: "robots", content: "index,follow" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript({ "@context": "https://schema.org", "@type": "CollectionPage", name: v.title, url }),
        ldScript({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: v.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
        ldScript(
          itemListJsonLd(
            v.name,
            (loaderData?.jobs ?? []).map((j) => ({ name: j.title, url: `${BRAND_HOST}/jobs/${j.slug}` })),
          ),
        ),
      ],
    };
  },
  component: function VivierPage() {
    const { vivier, jobs, slots } = Route.useLoaderData();
    if (!vivier) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-serif text-4xl">Vivier introuvable</h1>
          <Link to="/viviers" className="mt-4 inline-block text-primary">Tous les viviers</Link>
        </div>
      );
    }
    const tryBuyJobs = jobs.filter((j) => j.tryBuy);
    return (
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted">
          <Link to="/" className="hover:text-ink">Vera</Link>
          {" · "}
          <Link to="/viviers" className="hover:text-ink">Viviers</Link>
          {` · ${vivier.name}`}
        </nav>
        <p className="mt-4 text-xs tracking-wide text-primary uppercase">{vivier.kicker}</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{vivier.name}</h1>
        {vivier.intro.map((p) => (
          <p key={p.slice(0, 40)} className="mt-4 text-base leading-relaxed">{p}</p>
        ))}

        {vivier.pool === "rsa" && (
          <section className="mt-10">
            <h2 className="font-serif text-2xl">Matrice des freins — écrite</h2>
            <p className="mt-2 text-sm text-muted">
              Candidat coche. Maison lève. Try & Buy 5 jours payés, pas une PMSMP gratuite.
            </p>
            <BarrierMatrix />
            {tryBuyJobs.length > 0 && (
              <ul className="mt-6 space-y-2 text-sm">
                {tryBuyJobs.map((j) => (
                  <li key={j.id}>
                    <Link to="/jobs/$slug" params={{ slug: j.slug }} className="text-primary">{j.title}</Link>
                    <span className="text-muted">
                      {" · "}{j.company.name} · Try & Buy {j.tryBuy?.days} j · {j.tryBuy?.dailyPay} € / j
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-sm">
              <Link to="/me" className="text-primary">Cocher vos freins au profil</Link>
            </p>
          </section>
        )}

        {vivier.pool === "senior-fractional" && (
          <section className="mt-10">
            <h2 className="font-serif text-2xl">Calendrier multi-maisons</h2>
            <p className="mt-2 text-sm text-muted">
              Un jour, une maison. Mardi Fos et jeudi Lyon, oui. Deux mardis, non.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {slots.map((s) => (
                <article key={s.id} className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-xs tracking-wide text-muted uppercase">
                    {WEEKDAYS[s.weekday]} · {s.startHour}h–{s.startHour + s.hours}h
                  </p>
                  <h3 className="mt-1 font-serif text-xl">{s.company}</h3>
                  <p className="text-sm text-muted">{s.title} · {s.city}</p>
                  <p className="mt-2 text-xs text-subtle">{s.taken}/{s.seats} tenu{s.taken > 1 ? "s" : ""}</p>
                  <Link to="/jobs/$slug" params={{ slug: s.jobSlug }} className="mt-2 inline-block text-xs text-primary">
                    Offre
                  </Link>
                </article>
              ))}
            </div>
            <Button asChild className="mt-4">
              <Link to="/me/creneaux">Tenir un créneau</Link>
            </Button>
          </section>
        )}

        <div className="mt-12">
          <GeoJobs local={jobs} />
        </div>
        <SeoFaq items={vivier.faqs} />
      </article>
    );
  },
});
