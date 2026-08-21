import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Term } from "@/components/term";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAcademy, joinAcademy } from "@/lib/academy-fn";
import { BRAND_HOST } from "@/lib/origin";
import { academyJsonLd, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/companies/$slug_/academie/")({
  loader: async ({ params }) => getAcademy({ data: params.slug }),
  head: ({ loaderData, params }) => {
    const data = loaderData;
    const name = data?.company.name ?? "Entreprise";
    const origin = BRAND_HOST;
    return {
      meta: [
        { title: `Académie ${name} — formation salariés | Vera` },
        {
          name: "description",
          content: data
            ? `Parcours salariés et modules candidats de ${name}. ${data.courses.length} formations, pacte et grilles liés à la fiche entreprise.`
            : "Académie entreprise Vera.",
        },
        { name: "robots", content: "index,follow" },
      ],
      links: [{ rel: "canonical", href: `${origin}/companies/${params.slug}/academie` }],
      scripts: data
        ? academyJsonLd(data.company, origin, data.courses).map(ldScript)
        : [],
    };
  },
  component: AcademyHub,
});

const CAT_LABEL: Record<string, string> = {
  accueil: "Accueil",
  securite: "Sécurité",
  metier: "Métier",
  candidat: "Candidat",
};

function AcademyHub() {
  const { slug } = Route.useParams();
  const packed = Route.useLoaderData();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["academy", slug],
    queryFn: () => getAcademy({ data: slug }),
    initialData: packed ?? undefined,
  });
  const data = q.data ?? packed;
  const join = useMutation({
    mutationFn: () => joinAcademy({ data: slug }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Académie rejointe — les parcours obligatoires sont assignés.");
      void qc.invalidateQueries({ queryKey: ["academy", slug] });
      void qc.invalidateQueries({ queryKey: ["my-formation"] });
    },
    onError: () => toast.error("Connexion requise"),
  });

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Académie introuvable</h1>
        <Link to="/academies" className="mt-4 inline-block text-primary">
          Toutes les académies
        </Link>
      </div>
    );
  }

  const { company, courses } = data;
  const employee = courses.filter((c) => c.audience === "employee");
  const open = courses.filter((c) => c.audience !== "employee");

  return (
    <div>
      <p className="text-xs tracking-wide text-primary uppercase">
        Académie salariés · {company.industry}
      </p>
      <h2 className="mt-1 font-serif text-3xl sm:text-4xl">Catalogue {company.name}</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink">
        {company.memberCount} salarié{company.memberCount > 1 ? "s" : ""} · {courses.length} parcours. Le
        catalogue est public. Les scores, eux, restent dans{" "}
        <Term k="academie">l’académie</Term> — liés à cette fiche, pas à un outil RH parallèle. Un module
        tenu monte la grille et le brief.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button disabled={join.isPending} onClick={() => join.mutate()}>
          {join.isPending ? "Inscription…" : "Je suis salarié ici"}
        </Button>
        <Button asChild variant="ghost">
          <Link to="/me/formation">Mon espace formation</Link>
        </Button>
      </div>

      <h3 className="mt-14 font-serif text-3xl">Parcours salariés</h3>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Accueil obligatoire, geste métier, sécurité. Assignés dès que vous rejoignez l’académie.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {employee.map((c) => (
          <CourseTile key={c.id} company={slug} course={c} />
        ))}
      </ul>

      <h3 className="mt-14 font-serif text-3xl">Ouvert aux candidats</h3>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Préparer l’épreuve sans mentir sur la grille. Le même geste que les salariés tiennent.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {open.map((c) => (
          <CourseTile key={c.id} company={slug} course={c} />
        ))}
      </ul>
    </div>
  );
}

function CourseTile({
  company,
  course,
}: {
  company: string;
  course: {
    slug: string;
    title: string;
    excerpt: string;
    minutes: number;
    mandatory: boolean;
    moduleCount: number;
    category: string;
    audience: string;
    enrolled: number;
    completed: number;
  };
}) {
  return (
    <li>
      <Link
        to="/companies/$slug/academie/$course"
        params={{ slug: company, course: course.slug }}
        className="block h-full rounded-2xl border border-border bg-surface p-5 hover:border-primary"
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="primary">{CAT_LABEL[course.category] ?? course.category}</Badge>
          {course.mandatory && <Badge tone="warn">Obligatoire</Badge>}
          {course.audience === "both" && <Badge>Candidats aussi</Badge>}
        </div>
        <h3 className="mt-3 font-serif text-2xl">{course.title}</h3>
        <p className="mt-2 text-sm text-muted">{course.excerpt}</p>
        <p className="mt-3 text-xs text-subtle">
          {course.minutes} min · {course.moduleCount} modules · {course.completed}/{course.enrolled || 0} tenus
        </p>
      </Link>
    </li>
  );
}
