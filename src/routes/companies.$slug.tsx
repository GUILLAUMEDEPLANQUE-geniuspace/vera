import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { CompanyShell } from "@/components/company/company-shell";
import { getAcademy } from "@/lib/academy-fn";
import { listCckFields, listCckValuesForCompany } from "@/lib/cck-fn";
import { getCompany } from "@/lib/jobs-fn";
import { listArticlesByCompany } from "@/lib/journal-fn";
import { listAcademyProofs, listMeetSlots } from "@/lib/meet-fn";
import { BRAND_HOST } from "@/lib/origin";
import { cultureOf } from "@/lib/culture";
import { academyJsonLd, companyDescriptionTag, companyJsonLd, companyTitleTag, ldScript } from "@/lib/seo";

export const Route = createFileRoute("/companies/$slug")({
  loader: async ({ params }) => {
    const data = await getCompany({ data: params.slug });
    if (!data) return null;
    const [articles, academy, proofs, slots, cckFields, cckByJob] = await Promise.all([
      listArticlesByCompany({ data: data.company.id }),
      getAcademy({ data: params.slug }),
      listAcademyProofs({ data: params.slug }),
      listMeetSlots({ data: params.slug }),
      listCckFields({ data: { type: "job", companyId: data.company.id } }),
      listCckValuesForCompany({ data: { kind: "job", companyId: data.company.id } }),
    ]);
    return { ...data, articles, academy, proofs, slots, cckFields, cckByJob };
  },
  head: ({ loaderData }) => {
    const data = loaderData;
    if (!data) return { meta: [{ title: "Entreprise | Vera" }] };
    const { company, jobs } = data;
    const origin = BRAND_HOST;
    const culture = cultureOf(company.slug);
    const academy = data.academy;
    return {
      meta: [
        { title: companyTitleTag(company) },
        { name: "description", content: companyDescriptionTag(company, jobs.length).slice(0, 170) },
        { name: "robots", content: "index,follow,max-image-preview:large" },
        { property: "og:title", content: companyTitleTag(company) },
        { property: "og:description", content: companyDescriptionTag(company, jobs.length).slice(0, 170) },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: `${origin}/companies/${company.slug}` },
      ],
      links: [
        { rel: "canonical", href: `${origin}/companies/${company.slug}` },
        { rel: "alternate", type: "text/markdown", href: `${origin}/feed/maisons/${company.slug}.md` },
      ],
      scripts: [
        ...companyJsonLd(company, origin, jobs, culture).map(ldScript),
        ...(academy ? academyJsonLd(academy.company, origin, academy.courses).map(ldScript) : []),
      ],
    };
  },
  component: CompanyLayout,
});

function CompanyLayout() {
  const data = Route.useLoaderData();
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Entreprise introuvable</h1>
        <Link to="/companies" className="mt-4 inline-block text-primary">
          Toutes les entreprises
        </Link>
      </div>
    );
  }
  const hired = data.proofs.hires.reduce((n, h) => n + h.hired, 0);
  return (
    <CompanyShell
      company={data.company}
      jobsCount={data.jobs.length}
      courseCount={data.academy?.courses.length ?? 0}
      articleCount={data.articles.length}
      hireCount={hired}
      slotCount={data.slots.length}
    >
      <Outlet />
    </CompanyShell>
  );
}
