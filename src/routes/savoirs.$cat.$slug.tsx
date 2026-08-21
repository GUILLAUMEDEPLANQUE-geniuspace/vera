import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DriveCard } from "@/components/drive-reader";
import { Term } from "@/components/term";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listDriveAssets } from "@/lib/drive-fn";
import { addHubReply, getHubArticle } from "@/lib/hub-fn";
import { listJobs } from "@/lib/jobs-fn";
import { BRAND_HOST } from "@/lib/origin";
import { articleJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/savoirs/$cat/$slug")({
  loader: async ({ params }) => {
    const [article, jobs, drive] = await Promise.all([
      getHubArticle({ data: { cat: params.cat, slug: params.slug } }),
      listJobs({ data: {} }),
      listDriveAssets({ data: { entityType: "knowledge", entityKey: params.slug } }),
    ]);
    if (!article) throw notFound();
    const related = jobs.filter((j) => article.jobSlugs.includes(j.slug) || j.skills.some((s) => article.skillTags.includes(s)));
    return { article, related: related.slice(0, 6), drive };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Fiche | Vera" }] };
    const { article } = loaderData;
    const url = `${BRAND_HOST}/savoirs/${article.catSlug}/${article.slug}`;
    return {
      meta: [
        { title: `${article.title} | Vera` },
        { name: "description", content: article.excerpt.slice(0, 170) },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.excerpt.slice(0, 170) },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [ldScript(articleJsonLd(article, url))],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { cat, slug } = Route.useParams();
  const initial = Route.useLoaderData();
  const qc = useQueryClient();
  const { user } = useCurrentUserState();
  const artQ = useQuery({
    queryKey: ["hub-art", cat, slug],
    queryFn: () => getHubArticle({ data: { cat, slug } }),
    initialData: initial.article,
  });
  const article = artQ.data ?? initial.article;
  const [body, setBody] = useState("");
  const reply = useMutation({
    mutationFn: () => addHubReply({ data: { articleId: article.id, body } }),
    onSuccess: async (r) => {
      if (!r.ok) return toast.error(r.error);
      setBody("");
      toast.success("Note tenue");
      await qc.invalidateQueries({ queryKey: ["hub-art", cat, slug] });
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted">
        <Link to="/savoirs" className="hover:text-ink">
          Fiches
        </Link>
        {" · "}
        <Link to="/savoirs/$cat" params={{ cat: article.catSlug }} className="hover:text-ink">
          {article.catTitle}
        </Link>
      </nav>
      <p className="mt-3 text-xs tracking-wide text-muted uppercase">
        {article.catTitle} · {article.minutes} min · <Term k="proof">Score de preuve</Term> {article.proofScore}
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{article.title}</h1>
      <p className="mt-3 text-lg text-muted">{article.excerpt}</p>
      <p className="mt-2 text-xs text-subtle">
        {article.authorName} · {article.authorRole === "house" ? "entreprise" : article.authorRole === "candidate" ? "candidat" : "Vera"}
      </p>

      <div className="mt-8 max-w-prose space-y-4 text-base leading-relaxed">
        {article.body.split("\n\n").map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
      </div>

      {Object.keys(article.fields).length > 0 && (
        <dl className="mt-8 grid gap-3 border-y border-border py-4 sm:grid-cols-2">
          {Object.entries(article.fields).map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs tracking-wide text-muted uppercase">{k}</dt>
              <dd className="mt-1 text-sm">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {article.skillTags.length > 0 && (
        <p className="mt-6 text-sm text-muted">Gestes : {article.skillTags.join(" · ")}</p>
      )}

      {initial.drive.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl">
            <Term k="drive">Drive</Term> de la fiche
          </h2>
          <ul className="mt-4 grid gap-3">
            {initial.drive.map((d) => (
              <li key={d.id}>
                <DriveCard asset={d} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {initial.related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl">Offres qui tiennent ce geste</h2>
          <ul className="mt-3 space-y-2">
            {initial.related.map((j) => (
              <li key={j.slug}>
                <Link to="/jobs/$slug" params={{ slug: j.slug }} className="text-sm font-medium text-primary">
                  {j.title} · {j.company.name} · {j.city}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Notes de terrain</h2>
        <p className="mt-1 text-sm text-muted">Pas un fil Twitter. Une note utile, ou rien.</p>
        <ul className="mt-4 space-y-4">
          {article.replies.map((r) => (
            <li key={r.id} className="border-t border-border pt-3">
              <p className="text-xs text-subtle">
                {r.authorName} · {r.authorRole}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{r.body}</p>
            </li>
          ))}
        </ul>
        {user ? (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              reply.mutate();
            }}
          >
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Une note tenue…" />
            <Button type="submit" disabled={reply.isPending}>
              Publier la note
            </Button>
          </form>
        ) : (
          <p className="mt-4 text-sm">
            <Link to="/login" className="text-primary">
              Connexion
            </Link>{" "}
            pour noter.
          </p>
        )}
      </section>
    </div>
  );
}
