import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { lessonOf } from "@/lib/lessons";
import { BRAND_HOST } from "@/lib/origin";
import { listMyLessonsDone, markLessonDone } from "@/lib/ops-fn";

export const Route = createFileRoute("/apprendre/$slug")({
  loader: ({ params }) => lessonOf(params.slug) ?? null,
  head: ({ loaderData }) => {
    const l = loaderData;
    if (!l) return { meta: [{ title: "Leçon | Vera" }] };
    return {
      meta: [
        { title: `${l.title} | Vera` },
        { name: "description", content: l.body[0]?.slice(0, 170) ?? l.title },
      ],
      links: [{ rel: "canonical", href: `${BRAND_HOST}/apprendre/${l.slug}` }],
    };
  },
  component: function LessonPage() {
    const lesson = Route.useLoaderData();
    const { user } = useCurrentUserState();
    const qc = useQueryClient();
    const doneQ = useQuery({ queryKey: ["lessons-done"], queryFn: () => listMyLessonsDone(), enabled: Boolean(user) });
    const mark = useMutation({
      mutationFn: () => markLessonDone({ data: lesson!.slug }),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ["lessons-done"] }),
    });
    if (!lesson) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-serif text-4xl">Leçon introuvable</h1>
          <Link to="/apprendre" className="mt-4 inline-block text-primary">Toutes les leçons</Link>
        </div>
      );
    }
    const done = (doneQ.data ?? []).includes(lesson.slug);
    return (
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted">
          <Link to="/" className="hover:text-ink">Vera</Link>
          {" · "}
          <Link to="/apprendre" className="hover:text-ink">Apprendre</Link>
        </nav>
        <p className="mt-4 text-xs tracking-wide text-primary uppercase">{lesson.kicker} · {lesson.minutes} min</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{lesson.title}</h1>
        {lesson.body.map((p) => (
          <p key={p.slice(0, 40)} className="mt-4 text-base leading-relaxed">{p}</p>
        ))}
        <aside className="mt-8 rounded-xl border border-border bg-surface p-5">
          <p className="text-xs tracking-wide text-muted uppercase">Drill</p>
          <p className="mt-2 text-sm leading-relaxed">{lesson.drill}</p>
        </aside>
        {user && (
          <div className="mt-6">
            <Button disabled={done || mark.isPending} onClick={() => mark.mutate()}>
              {done ? "Module tenu" : "Marquer comme tenu"}
            </Button>
          </div>
        )}
        <p className="mt-8 text-sm">
          <Link to="/jobs" className="text-primary">Rejouer une épreuve</Link>
          {" · "}
          <Link to="/me/carnet" className="text-primary">Carnet</Link>
        </p>
      </article>
    );
  },
});
