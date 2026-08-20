import { createFileRoute, Link } from "@tanstack/react-router";
import { getArticle } from "@/lib/journal-fn";
import { BRAND_HOST } from "@/lib/origin";
import { ldScript } from "@/lib/seo";

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ params }) => getArticle({ data: params.slug }),
  head: ({ loaderData }) => {
    const a = loaderData;
    if (!a || !a.published) return { meta: [{ title: "Note | Vera" }, { name: "robots", content: "noindex" }] };
    const url = `${BRAND_HOST}/journal/${a.slug}`;
    return {
      meta: [
        { title: `${a.title} | Vera` },
        { name: "description", content: a.excerpt.slice(0, 170) },
        { name: "robots", content: "index,follow" },
        { property: "og:type", content: "article" },
        { property: "og:title", content: a.title },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title,
          description: a.excerpt,
          author: { "@type": a.authorKind === "company" ? "Organization" : "Person", name: a.authorName },
          datePublished: a.createdAt,
        }),
      ],
    };
  },
  component: function ArticlePage() {
    const a = Route.useLoaderData();
    if (!a || !a.published) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-serif text-4xl">Introuvable</h1>
          <Link to="/journal" className="mt-4 inline-block text-primary">Journal</Link>
        </div>
      );
    }
    return (
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted">
          <Link to="/" className="hover:text-ink">Vera</Link>
          {" · "}
          <Link to="/journal" className="hover:text-ink">Journal</Link>
        </nav>
        <p className="mt-4 text-xs tracking-wide text-primary uppercase">
          {a.kind} · {a.authorName}
        </p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{a.title}</h1>
        <p className="mt-4 text-lg text-muted">{a.excerpt}</p>
        {a.body.split("\n\n").map((p) => (
          <p key={p.slice(0, 48)} className="mt-4 text-base leading-relaxed">{p}</p>
        ))}
        {a.fileName && (
          <aside className="mt-8 rounded-xl border border-border bg-surface p-5">
            <p className="text-xs tracking-wide text-muted uppercase">Fichier</p>
            {a.fileNote?.startsWith("/fichiers/") ? (
              <a href={a.fileNote} className="mt-1 inline-block font-serif text-xl text-primary">
                {a.fileName}
              </a>
            ) : (
              <p className="mt-1 font-serif text-xl">{a.fileName}</p>
            )}
            {a.fileNote && !a.fileNote.startsWith("/fichiers/") && (
              <p className="mt-2 text-sm text-muted">{a.fileNote}</p>
            )}
          </aside>
        )}
        <p className="mt-10 text-sm">
          {a.authorKind === "company" ? (
            <Link to="/companies/$slug" params={{ slug: a.authorSlug }} className="text-primary">
              Maison {a.authorName}
            </Link>
          ) : (
            <Link to="/talents/$slug" params={{ slug: a.authorSlug }} className="text-primary">
              Carnet de {a.authorName}
            </Link>
          )}
        </p>
      </article>
    );
  },
});
