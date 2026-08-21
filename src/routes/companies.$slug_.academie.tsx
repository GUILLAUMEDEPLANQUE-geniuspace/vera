import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CompanyShell } from "@/components/company/company-shell";
import { getAcademy } from "@/lib/academy-fn";
import { getCompany } from "@/lib/jobs-fn";
import { listArticlesByCompany } from "@/lib/journal-fn";
import { listAcademyProofs, listMeetSlots } from "@/lib/meet-fn";

export const Route = createFileRoute("/companies/$slug_/academie")({
  loader: async ({ params }) => {
    const pack = await getCompany({ data: params.slug });
    if (!pack) return null;
    const [academy, articles, proofs, slots] = await Promise.all([
      getAcademy({ data: params.slug }),
      listArticlesByCompany({ data: pack.company.id }),
      listAcademyProofs({ data: params.slug }),
      listMeetSlots({ data: params.slug }),
    ]);
    return { pack, academy, articles, proofs, slots };
  },
  component: AcademyLayout,
});

function AcademyLayout() {
  const data = Route.useLoaderData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
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
  const compact = pathname.split("/").filter(Boolean).length >= 4;
  const hired = data.proofs.hires.reduce((n, h) => n + h.hired, 0);
  return (
    <CompanyShell
      company={data.pack.company}
      jobsCount={data.pack.jobs.length}
      courseCount={data.academy?.courses.length ?? 0}
      articleCount={data.articles.length}
      hireCount={hired}
      slotCount={data.slots.length}
      compact={compact}
    >
      <Outlet />
    </CompanyShell>
  );
}
