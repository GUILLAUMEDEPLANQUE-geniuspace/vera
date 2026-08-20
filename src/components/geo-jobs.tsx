import { Link } from "@tanstack/react-router";
import { JobCard } from "@/components/job-card";
import type { JobListItem } from "@/lib/types";

export function GeoJobs({
  local,
  bassin,
  remote,
  bassinLabel = "Bassin",
}: {
  local: JobListItem[];
  bassin?: JobListItem[];
  remote?: JobListItem[];
  bassinLabel?: string;
}) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-serif text-2xl">Offres ici</h2>
        <div className="mt-5 grid gap-4">
          {local.length === 0 && <p className="text-muted">Aucune offre locale indexée — le bassin et le remote restent lisibles.</p>}
          {local.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
      {bassin && bassin.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl">{bassinLabel}</h2>
          <div className="mt-5 grid gap-4">
            {bassin.slice(0, 8).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}
      {remote && remote.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl">Remote, salaire publié</h2>
          <div className="mt-5 grid gap-4">
            {remote.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}
      <p className="text-sm text-muted">
        <Link to="/jobs" className="text-primary">
          Toutes les offres
        </Link>
        {" · "}
        <Link to="/tension" className="text-primary">
          Carte de tension
        </Link>
      </p>
    </div>
  );
}
