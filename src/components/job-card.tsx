import { Link } from "@tanstack/react-router";
import { CompanyMark } from "@/components/company-mark";
import { GhostMeter } from "@/components/ghost-meter";
import { Badge } from "@/components/ui/badge";
import { formatPosted, formatSalary } from "@/lib/format";
import { honorCaption, honorTone } from "@/lib/pact";
import { formatHours } from "@/lib/process";
import { FULL_OFFER_SLUGS } from "@/lib/offer";
import { scarcityOf } from "@/lib/scarcity";
import { CONTRACT_LABEL, REMOTE_LABEL, SENIORITY_LABEL, type JobListItem } from "@/lib/types";
import { vivierByPool } from "@/lib/viviers";

export function JobCard({ job }: { job: JobListItem }) {
  const pass = job.ghostRisk === "high" || job.company.honorScore < 65;
  const scarcity = scarcityOf(job);
  const rare = scarcity.band === "penurie" || scarcity.band === "rare";
  const vivier = vivierByPool(job.pool);
  return (
    <Link
      to="/jobs/$slug"
      params={{ slug: job.slug }}
      className="group block rounded-xl border border-border bg-surface p-5 shadow-soft transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        <CompanyMark name={job.company.name} slug={job.company.slug} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-medium text-ink">{job.company.name}</span>
            <span>·</span>
            <span>{job.company.industry}</span>
          </div>
          <h3 className="mt-1 font-serif text-2xl leading-tight text-ink group-hover:text-primary">
            {job.title}
          </h3>
          <p className="mt-2 text-sm text-muted">
            {job.location} · {REMOTE_LABEL[job.remoteType]} · {CONTRACT_LABEL[job.contract]} ·{" "}
            {SENIORITY_LABEL[job.seniority]}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-serif text-lg tabular-nums text-ink">
              {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
            </span>
            {job.equity && <Badge>Equity</Badge>}
            <GhostMeter risk={job.ghostRisk} postedAt={job.postedAt} velocity={job.company.hiringVelocity} />
            {FULL_OFFER_SLUGS.has(job.slug) && <Badge tone="primary">Offre lue · épreuve</Badge>}
            {vivier && <Badge>{vivier.name}</Badge>}
            {rare && (
              <Badge tone="primary">
                {scarcity.label} {scarcity.score}
              </Badge>
            )}
            {pass ? (
              <Badge tone="bad">Passez</Badge>
            ) : (
              <Badge tone={honorTone(job.company.honorScore)}>
                {honorCaption(job.company.honorScore, 1)} · {job.company.responseSlaDays} j
              </Badge>
            )}
          </div>
          <p className="mt-2 text-xs text-subtle">{formatHours(job.processHours)} de process publié</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </div>
        <div className="hidden shrink-0 flex-col items-end sm:flex">
          {job.match != null ? (
            <>
              <span className="font-serif text-3xl tabular-nums leading-none text-primary">{job.match}</span>
              <span className="mt-1 text-xs text-muted">signal</span>
            </>
          ) : (
            <span className="text-xs text-subtle">{formatPosted(job.postedAt)}</span>
          )}
          <span className="mt-3 text-xs text-subtle">{formatPosted(job.postedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
