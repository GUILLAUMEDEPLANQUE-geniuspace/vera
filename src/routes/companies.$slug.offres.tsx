import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { JobCard } from "@/components/job-card";

const companyRoute = getRouteApi("/companies/$slug");

export const Route = createFileRoute("/companies/$slug/offres")({
  component: OffresTab,
});

function OffresTab() {
  const data = companyRoute.useLoaderData();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const fields = (data?.cckFields ?? []).filter((f) => f.filterable);
  const jobs = useMemo(() => {
    if (!data) return [];
    const active = Object.entries(filters).filter(([, v]) => v);
    if (!active.length) return data.jobs;
    return data.jobs.filter((job) => {
      const vals = data.cckByJob[job.id] ?? [];
      return active.every(([name, want]) => {
        const hit = vals.find((v) => v.name === name);
        if (!hit) return false;
        return hit.value === want || hit.value.toLowerCase().includes(want.toLowerCase());
      });
    });
  }, [data, filters]);

  if (!data) return null;

  return (
    <div>
      <h2 className="font-serif text-3xl">Offres ouvertes</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Chaque offre est un type CCK : champs publics, filtrables, visibles sur la carte. Pas un dump ATS.
      </p>

      {fields.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {fields.map((f) => {
            const options =
              f.kind === "bool"
                ? ["oui"]
                : f.options.filter(Boolean);
            if (!options.length) return null;
            return (
              <label key={f.name} className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm">
                <span className="text-muted">{f.label}</span>
                <select
                  className="bg-transparent text-ink"
                  value={filters[f.name] ?? ""}
                  onChange={(e) =>
                    setFilters((prev) => {
                      const next = { ...prev };
                      if (e.target.value) next[f.name] = e.target.value;
                      else delete next[f.name];
                      return next;
                    })
                  }
                >
                  <option value="">Tous</option>
                  {options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-subtle">
        {jobs.length} offre{jobs.length > 1 ? "s" : ""}
        {Object.keys(filters).length > 0 ? " · filtre CCK" : ""}
      </p>

      <div className="mt-6 grid gap-4">
        {jobs.length === 0 && <p className="text-muted">Aucune offre ne correspond.</p>}
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} cck={data.cckByJob[job.id]} />
        ))}
      </div>
    </div>
  );
}
