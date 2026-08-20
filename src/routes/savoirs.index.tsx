import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AddCategoryCard } from "@/components/add-category";
import { Term, TermLegend } from "@/components/term";
import { catTone } from "@/lib/marks";
import { listHubArticles, listHubCategories } from "@/lib/hub-fn";
import { BRAND_HOST } from "@/lib/origin";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/savoirs/")({
  loader: async () => {
    const [cats, arts] = await Promise.all([listHubCategories(), listHubArticles({ data: {} })]);
    return { cats, arts };
  },
  head: () => ({
    meta: [
      { title: "Savoirs Vera — hub de connaissance pour l’emploi et la formation" },
      {
        name: "description",
        content:
          "GeniusKnowledges : marché, métiers, robotique, droit, compta, création d’entreprise. Fiches liées aux offres. Préformer un geste avant de postuler.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Savoirs Vera — le geste avant le titre" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/savoirs` }],
    scripts: [
      ldScript(
        itemListJsonLd("Savoirs Vera", [
          { name: "Marché", url: `${BRAND_HOST}/savoirs/marche` },
          { name: "Métiers", url: `${BRAND_HOST}/savoirs/metiers` },
          { name: "Robotique", url: `${BRAND_HOST}/savoirs/robotique` },
          { name: "Droit", url: `${BRAND_HOST}/savoirs/droit` },
        ]),
      ),
    ],
  }),
  component: SavoirsIndex,
});

function SavoirsIndex() {
  const packed = Route.useLoaderData();
  const catsQ = useQuery({
    queryKey: ["hub-cats"],
    queryFn: () => listHubCategories(),
    initialData: packed.cats,
  });
  const artsQ = useQuery({
    queryKey: ["hub-arts"],
    queryFn: () => listHubArticles({ data: {} }),
    initialData: packed.arts,
  });
  const cats = catsQ.data ?? packed.cats;
  const arts = artsQ.data ?? packed.arts;
  const featured = arts[0];
  const rest = arts.slice(1);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">
          Vera
        </Link>
        {" · "}
        Savoirs
      </nav>
      <p className="mt-3 text-xs tracking-wide text-primary uppercase">GeniusKnowledges</p>
      <h1 className="mt-2 max-w-3xl font-serif text-4xl sm:text-6xl">
        Le hub où le métier s’écrit — et mène à l’offre.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Pas un forum. Pas un LMS. Des fiches tenues par les maisons et les candidats : marché, droit, compta,
        robotique, terrain. Chaque fiche ouvre des offres. Si le geste manque, vous{" "}
        <Term k="preform">préformez</Term> ici, puis vous tenez l’
        <Term k="epreuve">épreuve</Term>.
      </p>
      <div className="mt-4">
        <TermLegend keys={["savoirs", "preform", "proof", "drive", "epreuve"]} />
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cats.map((c) => {
          const tone = catTone(c.slug);
          return (
            <li key={c.slug}>
              <Link
                to="/savoirs/$cat"
                params={{ cat: c.slug }}
                className="block h-full overflow-hidden rounded-2xl border border-border bg-surface hover:border-primary"
              >
                <span className="block h-1.5" style={{ background: tone.bg }} />
                <span className="block p-5">
                  <p className="text-xs tracking-wide uppercase" style={{ color: tone.bg }}>
                    {c.kicker}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl">{c.title}</h2>
                  <p className="mt-2 text-sm text-muted">{c.description}</p>
                  <p className="mt-3 text-xs text-subtle">
                    {c.articleCount} fiche{c.articleCount > 1 ? "s" : ""}
                  </p>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-10">
        <AddCategoryCard />
      </div>

      {featured && (
        <article className="mt-16 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="h-2" style={{ background: catTone(featured.catSlug).bg }} />
          <div className="p-6 sm:p-8">
            <p className="text-xs tracking-wide text-muted uppercase">
              À la une · {featured.catTitle} · {featured.minutes} min · Proof {featured.proofScore}
            </p>
            <Link
              to="/savoirs/$cat/$slug"
              params={{ cat: featured.catSlug, slug: featured.slug }}
              className="mt-2 block font-serif text-3xl hover:text-primary sm:text-4xl"
            >
              {featured.title}
            </Link>
            <p className="mt-3 max-w-2xl text-muted">{featured.excerpt}</p>
            <p className="mt-3 text-xs text-subtle">
              {featured.authorName} · {featured.authorRole === "house" ? "maison" : featured.authorRole === "candidate" ? "candidat" : "Vera"}
            </p>
          </div>
        </article>
      )}

      <h2 className="mt-16 font-serif text-3xl">Fil — maisons et candidats</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {rest.map((a) => (
          <li key={a.slug} className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs tracking-wide uppercase" style={{ color: catTone(a.catSlug).bg }}>
              {a.catTitle} · {a.minutes} min · Proof {a.proofScore}
            </p>
            <Link
              to="/savoirs/$cat/$slug"
              params={{ cat: a.catSlug, slug: a.slug }}
              className="mt-1 block font-serif text-2xl hover:text-primary"
            >
              {a.title}
            </Link>
            <p className="mt-1 text-sm text-muted">{a.excerpt}</p>
            <p className="mt-2 text-xs text-subtle">
              {a.authorName} · {a.authorRole === "house" ? "maison" : a.authorRole === "candidate" ? "candidat" : "Vera"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
