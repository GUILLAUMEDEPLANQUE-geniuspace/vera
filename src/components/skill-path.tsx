import { Link } from "@tanstack/react-router";
import { Term } from "@/components/term";

export function SkillPath({
  missing,
  path,
  totalMinutes,
}: {
  missing: string[];
  path: { slug: string; title: string; excerpt: string; catSlug: string; minutes: number; proofScore: number }[];
  totalMinutes: number;
}) {
  if (!path.length) return null;
  return (
    <section className="mt-10 rounded-xl border border-border bg-surface p-5">
      <p className="text-xs tracking-wide text-primary uppercase">
        <Term k="preform">Module</Term>
        {" · "}
        <Term k="savoirs">Fiches</Term>
      </p>
      <h2 className="mt-1 font-serif text-2xl">Le geste qui manque, avant de postuler</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {missing.length
          ? `Il manque encore : ${missing.slice(0, 6).join(", ")}. ${totalMinutes} min de fiches, puis l’épreuve.`
          : `Même si le profil est proche, ces fiches tiennent le geste de l’offre. ${totalMinutes} min.`}
      </p>
      <ul className="mt-4 space-y-3">
        {path.map((p) => (
          <li key={p.slug} className="border-t border-border pt-3">
            <Link
              to="/savoirs/$cat/$slug"
              params={{ cat: p.catSlug, slug: p.slug }}
              className="font-medium text-primary"
            >
              {p.title}
            </Link>
            <p className="mt-1 text-xs text-muted">
              {p.minutes} min · <Term k="proof">Score de preuve</Term> {p.proofScore}
            </p>
            <p className="mt-1 text-sm text-muted">{p.excerpt}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">
        <Link to="/savoirs" className="text-primary">
          Toutes les fiches
        </Link>
      </p>
    </section>
  );
}
