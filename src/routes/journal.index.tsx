import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CompanyMark } from "@/components/company-mark";
import { listArticles } from "@/lib/journal-fn";
import { BRAND_HOST } from "@/lib/origin";
import { itemListJsonLd, ldScript } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journal/")({
  loader: () => listArticles(),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Journal — blogs maisons et carnets candidats | Vera" },
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
    const [who, setWho] = useState<"all" | "company" | "candidate">("all");
    const filtered = useMemo(
      () => (who === "all" ? arts : arts.filter((a) => a.authorKind === who)),
      [arts, who],
    );
    const houses = arts.filter((a) => a.authorKind === "company").length;
    const people = arts.filter((a) => a.authorKind === "candidate").length;
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-xs tracking-wide text-primary uppercase">Journal</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Blogs des maisons. Carnets des candidats.</h1>
        <p className="mt-3 text-lg text-muted">
          Les maisons écrivent le geste. Les candidats tiennent un carnet. Les fichiers sont des schémas, pas des
          plaquettes.
        </p>
        <div className="mt-8 flex gap-1 rounded-full border border-border bg-surface p-1">
          {(
            [
              { id: "all" as const, label: `Tout · ${arts.length}` },
              { id: "company" as const, label: `Maisons · ${houses}` },
              { id: "candidate" as const, label: `Candidats · ${people}` },
            ]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setWho(t.id)}
              className={cn(
                "min-h-11 flex-1 rounded-full px-3 text-sm",
                who === t.id ? "bg-primary text-primary-fg" : "text-muted hover:text-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <ul className="mt-10 space-y-6">
          {filtered.map((a) => (
            <li key={a.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start gap-3">
                <CompanyMark name={a.authorName} slug={a.authorSlug} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs tracking-wide text-muted uppercase">
                    {a.authorKind === "company" ? "Blog maison" : a.authorKind === "candidate" ? "Carnet candidat" : a.kind}{" "}
                    · {a.authorName} · {a.kind}
                  </p>
                  <Link to="/journal/$slug" params={{ slug: a.slug }} className="mt-1 block font-serif text-2xl hover:text-primary">
                    {a.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{a.excerpt}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  },
});
