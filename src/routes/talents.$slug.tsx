import { createFileRoute, Link } from "@tanstack/react-router";
import { listArticlesByAuthor } from "@/lib/journal-fn";
import { BRAND_HOST } from "@/lib/origin";
import { ldScript } from "@/lib/seo";

export const Route = createFileRoute("/talents/$slug")({
  loader: ({ params }) => listArticlesByAuthor({ data: params.slug }),
  head: ({ params, loaderData }) => {
    const name = loaderData?.[0]?.authorName ?? params.slug;
    const url = `${BRAND_HOST}/talents/${params.slug}`;
    return {
      meta: [
        { title: `${name} — carnet de preuves | Vera` },
        { name: "description", content: `Notes, fichiers et preuves de métier de ${name}. Pas un CV chronologique.` },
        { name: "robots", content: "index,follow" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [ldScript({ "@context": "https://schema.org", "@type": "ProfilePage", name, url })],
    };
  },
  component: function TalentPage() {
    const { slug } = Route.useParams();
    const arts = Route.useLoaderData();
    const name = arts[0]?.authorName ?? slug;
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted">
          <Link to="/" className="hover:text-ink">Vera</Link>
          {" · Preuves"}
        </nav>
        <h1 className="mt-4 font-serif text-4xl">{name}</h1>
        <p className="mt-2 text-muted">Portfolio d’aptitudes : ce qui a été écrit et tenu, pas un PDF.</p>
        {arts.length === 0 && <p className="mt-8 text-muted">Pas encore de notes publiques.</p>}
        <ul className="mt-8 space-y-6">
          {arts.map((a) => (
            <li key={a.id}>
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
