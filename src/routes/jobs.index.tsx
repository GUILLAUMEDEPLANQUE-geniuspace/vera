import { createFileRoute, Link } from "@tanstack/react-router";
import { JobCard } from "@/components/job-card";
import { SearchBar } from "@/components/search-bar";
import { Badge } from "@/components/ui/badge";
import { COLLECTIONS } from "@/lib/constants";
import { listJobs } from "@/lib/jobs-fn";
import { BRAND_HOST } from "@/lib/origin";
import { itemListJsonLd, ldScript } from "@/lib/seo";
import type { ContractType, JobFilters, RemoteType, Seniority } from "@/lib/types";
import { CONTRACT_LABEL, REMOTE_LABEL, SENIORITY_LABEL } from "@/lib/types";
import { VIVIERS } from "@/lib/viviers";

type JobsSearch = {
  q?: string;
  remote?: RemoteType;
  contract?: ContractType;
  seniority?: Seniority;
  collection?: string;
  pacte?: "solide";
  pool?: string;
  sort?: JobFilters["sort"];
};

export const Route = createFileRoute("/jobs/")({
  validateSearch: (raw: Record<string, unknown>): JobsSearch => ({
    q: typeof raw.q === "string" ? raw.q : undefined,
    remote: isRemote(raw.remote) ? raw.remote : undefined,
    contract: isContract(raw.contract) ? raw.contract : undefined,
    seniority: isSeniority(raw.seniority) ? raw.seniority : undefined,
    collection: typeof raw.collection === "string" ? raw.collection : undefined,
    pacte: raw.pacte === "solide" ? "solide" : undefined,
    pool: typeof raw.pool === "string" ? raw.pool : undefined,
    sort:
      raw.sort === "recent" || raw.sort === "salary" || raw.sort === "signal" || raw.sort === "honneur"
        ? raw.sort
        : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const filters: JobFilters = {
      q: deps.q,
      remote: deps.remote ?? "",
      contract: deps.contract ?? "",
      seniority: deps.seniority ?? "",
      collection: deps.collection,
      pacte: deps.pacte ?? "",
      pool: deps.pool,
      sort: deps.sort ?? "signal",
    };
    return listJobs({ data: filters });
  },
  head: ({ loaderData, match }) => {
    const collection = COLLECTIONS.find((c) => c.slug === match.search.collection);
    const title = collection
      ? `${collection.label} — offres d’emploi 2026 | Vera`
      : "Offres d’emploi à salaire publié | Vera";
    const description = collection
      ? `${collection.blurb} ${loaderData?.length ?? 0} offres. Salaire, pacte, grille publique.`
      : "Toutes les offres Vera : salaire publié, pacte de réponse, scarcity score, Schema JobPosting. Classées par signal, jamais par budget pub.";
    const jobs = loaderData ?? [];
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 170) },
        { name: "robots", content: "index,follow" },
      ],
      links: [{ rel: "canonical", href: `${BRAND_HOST}/jobs` }],
      scripts: [
        ldScript(
          itemListJsonLd(
            title,
            jobs.slice(0, 30).map((j) => ({ name: `${j.title} — ${j.company.name}`, url: `${BRAND_HOST}/jobs/${j.slug}` })),
          ),
        ),
      ],
    };
  },
  component: JobsPage,
});

function isRemote(v: unknown): v is RemoteType {
  return v === "remote" || v === "hybrid" || v === "onsite";
}
function isContract(v: unknown): v is ContractType {
  return v === "cdi" || v === "cdd" || v === "freelance" || v === "stage" || v === "alternance";
}
function isSeniority(v: unknown): v is Seniority {
  return v === "junior" || v === "mid" || v === "senior" || v === "staff" || v === "lead";
}

function JobsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const jobs = Route.useLoaderData();

  function patch(next: Partial<JobsSearch>) {
    void navigate({
      search: (prev) => {
        const merged = { ...prev, ...next };
        return Object.fromEntries(Object.entries(merged).filter(([, v]) => v != null && v !== "")) as JobsSearch;
      },
    });
  }

  const collection = COLLECTIONS.find((c) => c.slug === search.collection);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl sm:text-5xl">{collection ? collection.label : "Toutes les offres"}</h1>
        <p className="mt-2 text-muted">
          {collection
            ? collection.blurb
            : "Classées par signal — adéquation, honneur, radar ghost. Jamais par budget pub."}
        </p>
      </div>
      <div className="mt-8 max-w-2xl">
        <SearchBar initial={search.q ?? ""} size="md" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterSelect
          label="Lieu"
          value={search.remote ?? ""}
          onChange={(v) => patch({ remote: (v || undefined) as RemoteType | undefined })}
          options={Object.entries(REMOTE_LABEL).map(([k, l]) => ({ value: k, label: l }))}
        />
        <FilterSelect
          label="Contrat"
          value={search.contract ?? ""}
          onChange={(v) => patch({ contract: (v || undefined) as ContractType | undefined })}
          options={Object.entries(CONTRACT_LABEL).map(([k, l]) => ({ value: k, label: l }))}
        />
        <FilterSelect
          label="Niveau"
          value={search.seniority ?? ""}
          onChange={(v) => patch({ seniority: (v || undefined) as Seniority | undefined })}
          options={Object.entries(SENIORITY_LABEL).map(([k, l]) => ({ value: k, label: l }))}
        />
        <FilterSelect
          label="Tri"
          value={search.sort ?? "signal"}
          onChange={(v) => patch({ sort: (v as JobsSearch["sort"]) ?? "signal" })}
          options={[
            { value: "signal", label: "Signal" },
            { value: "honneur", label: "Honneur" },
            { value: "recent", label: "Récent" },
            { value: "salary", label: "Salaire" },
          ]}
          allowEmpty={false}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => patch({ pacte: search.pacte === "solide" ? undefined : "solide" })}>
          <Badge tone={search.pacte === "solide" ? "primary" : "default"}>Pacte solide</Badge>
        </button>
        {COLLECTIONS.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => patch({ collection: c.slug === search.collection ? undefined : c.slug })}
          >
            <Badge tone={c.slug === search.collection ? "primary" : "default"}>{c.label}</Badge>
          </button>
        ))}
        {VIVIERS.map((v) => (
          <button
            key={v.slug}
            type="button"
            onClick={() => patch({ pool: v.pool === search.pool ? undefined : v.pool })}
          >
            <Badge tone={v.pool === search.pool ? "primary" : "default"}>{v.name}</Badge>
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-baseline justify-between">
        <p className="text-sm text-muted">{`${jobs.length} offre${jobs.length > 1 ? "s" : ""}`}</p>
        <Link to="/me" className="text-sm text-primary">
          Activer le signal → profil
        </Link>
      </div>

      <div className="mt-4 grid gap-4">
        {jobs.length === 0 && (
          <p className="rounded-xl border border-border bg-surface p-8 text-muted">
            Aucune offre pour ce filtre. Élargissez, ou{" "}
            <Link to="/jobs" className="text-primary">
              tout voir
            </Link>
            .
          </p>
        )}
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allowEmpty = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  allowEmpty?: boolean;
}) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm">
      <span className="text-subtle">{label}</span>
      <select
        className="bg-transparent text-ink focus-visible:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {allowEmpty && <option value="">Tous</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
