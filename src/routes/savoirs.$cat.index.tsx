import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Term } from "@/components/term";
import { listHubArticles, listHubCategories } from "@/lib/hub-fn";
import { BRAND_HOST } from "@/lib/origin";

export const Route = createFileRoute("/savoirs/$cat/")({
  loader: async ({ params }) => {
    const [cats, arts] = await Promise.all([
      listHubCategories(),
      listHubArticles({ data: { cat: params.cat } }),
    ]);
    const cat = cats.find((c) => c.slug === params.cat);
    if (!cat) throw notFound();
    return { cat, arts };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Savoirs | Vera" }] };
    const { cat } = loaderData;
    return {
      meta: [
        { title: cat.seoTitle ?? `${cat.title} | Vera Savoirs` },
        { name: "description", content: (cat.seoDescription ?? cat.description).slice(0, 170) },
        { name: "robots", content: "index,follow" },
      ],
      links: [{ rel: "canonical", href: `${BRAND_HOST}/savoirs/${cat.slug}` }],
    };
  },
  component: CatPage,
});

function CatPage() {
  const { cat, arts } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/" className="hover:text-ink">
          Vera
        </Link>
        {" · "}
        <Link to="/savoirs" className="hover:text-ink">
          Savoirs
        </Link>
        {" · "}
        {cat.title}
      </nav>
      <p className="mt-3 text-xs tracking-wide text-primary uppercase">{cat.kicker}</p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{cat.title}</h1>
      <p className="mt-3 text-lg text-muted">{cat.description}</p>
      {cat.fields.length > 0 && (
        <p className="mt-3 text-xs text-subtle">
          Champs de cette catégorie : {cat.fields.map((f) => f.label).join(" · ")}
        </p>
      )}
      <ul className="mt-10 space-y-8">
        {arts.map((a) => (
          <li key={a.slug}>
            <p className="text-xs tracking-wide text-muted uppercase">
              {a.minutes} min · <Term k="proof">Proof Score</Term> {a.proofScore}
            </p>
            <Link
              to="/savoirs/$cat/$slug"
              params={{ cat: a.catSlug, slug: a.slug }}
              className="font-serif text-2xl hover:text-primary"
            >
              {a.title}
            </Link>
            <p className="mt-1 text-sm text-muted">{a.excerpt}</p>
          </li>
        ))}
        {arts.length === 0 && <li className="text-sm text-muted">Pas encore de fiche dans cette catégorie.</li>}
      </ul>
    </div>
  );
}
