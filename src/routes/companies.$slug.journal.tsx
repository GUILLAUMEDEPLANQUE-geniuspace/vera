import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";

const companyRoute = getRouteApi("/companies/$slug");

export const Route = createFileRoute("/companies/$slug/journal")({
  head: ({ params }) => ({
    meta: [{ title: `Journal — ${params.slug} | Vera` }],
  }),
  component: JournalTab,
});

function JournalTab() {
  const data = companyRoute.useLoaderData();
  if (!data) return null;
  const { company, articles } = data;
  return (
    <div>
      <p className="text-xs tracking-wide text-primary uppercase">Blog entreprise</p>
      <h2 className="mt-1 font-serif text-3xl">Journal de {company.name}</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Preuves de geste, pas une plaquette RH. Chaque note est un type CCK — couverture, tags, fichier.
      </p>
      {articles.length === 0 && (
        <p className="mt-8 text-muted">Pas encore de note publique. Le silence n’est pas une culture.</p>
      )}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <li key={a.id} className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs tracking-wide text-muted uppercase">{a.kind}</p>
            <Link to="/journal/$slug" params={{ slug: a.slug }} className="mt-1 block font-serif text-2xl hover:text-primary">
              {a.title}
            </Link>
            <p className="mt-2 text-sm text-muted">{a.excerpt}</p>
            {a.tags.length > 0 && <p className="mt-3 text-xs text-subtle">{a.tags.join(" · ")}</p>}
          </li>
        ))}
      </ul>
      <Link to="/journal" className="mt-6 inline-block text-sm font-medium text-primary">
        Tous les blogs entreprises
      </Link>
    </div>
  );
}
