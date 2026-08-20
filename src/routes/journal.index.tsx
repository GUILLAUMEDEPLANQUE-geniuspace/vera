import { createFileRoute, Link } from "@tanstack/react-router";
import { listArticles } from "@/lib/journal-fn";
import { BRAND_HOST } from "@/lib/origin";
import { itemListJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/journal/")({
  loader: () => listArticles(),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Journal — carnets, fichiers, preuves de métier | Vera" },
      {
        name: "description",
        content:
          "Maisons et candidats publient des articles, notes et fichiers. Preuve de compétence, pas un LinkedIn.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_HOST}/journal` }],
    scripts: [
      ldScript(
        itemListJsonLd(
          "Journal Vera",
          (loaderData ?? []).map((a) => ({ name: a.title, url: `${BRAND_HOST}/journal/${a.slug}` })),
        ),
      ),
    ],
  }),
  component: function JournalIndex() {
    const arts = Route.useLoaderData();
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-xs tracking-wide text-primary uppercase">Journal</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Preuves, pas des posts</h1>
        <p className="mt-3 text-lg text-muted">
          Les maisons écrivent le geste. Les candidats tiennent un carnet. Les fichiers sont des schémas, pas des plaquettes.
        </p>
        <ul className="mt-10 space-y-8">
          {arts.map((a) => (
            <li key={a.id}>
              <p className="text-xs tracking-wide text-muted uppercase">{a.kind} · {a.authorName}</p>
              <Link to="/journal/$slug" params={{ slug: a.slug }} className="font-serif text-2xl hover:text-primary">
                {a.title}
              </Link>
              <p className="mt-1 text-sm text-muted">{a.excerpt}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  },
});
