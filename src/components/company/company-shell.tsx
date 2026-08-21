import { Link, useRouterState } from "@tanstack/react-router";
import {
  Briefcase,
  Building2,
  Calendar,
  GraduationCap,
  Images,
  Newspaper,
  Play,
  ShieldCheck,
  Users,
} from "lucide-react";
import { CompanyMark } from "@/components/company-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mediaOf } from "@/lib/company-media";
import { honorCaption, honorTone } from "@/lib/pact";
import { cityOfSlug, citySlug } from "@/lib/sem";
import type { Company } from "@/lib/types";
import { cn } from "@/lib/utils";

export type HouseChrome = Pick<
  Company,
  "slug" | "name" | "tagline" | "industry" | "hqCity" | "honorScore"
> &
  Partial<
    Pick<
      Company,
      | "sizeBand"
      | "hqCountry"
      | "foundedYear"
      | "honorDue"
      | "honorAnswered"
      | "responseSlaDays"
      | "values"
      | "about"
    >
  >;

type TabKey =
  | "presentation"
  | "offres"
  | "formations"
  | "journal"
  | "preuves"
  | "equipes"
  | "medias"
  | "rdv";

const TABS: {
  key: TabKey;
  label: string;
  short: string;
  to:
    | "/companies/$slug"
    | "/companies/$slug/offres"
    | "/companies/$slug/academie"
    | "/companies/$slug/journal"
    | "/companies/$slug/preuves"
    | "/companies/$slug/equipes"
    | "/companies/$slug/medias"
    | "/companies/$slug/rdv";
  icon: typeof Building2;
}[] = [
  { key: "presentation", label: "Présentation", short: "Maison", to: "/companies/$slug", icon: Building2 },
  { key: "offres", label: "Offres", short: "Offres", to: "/companies/$slug/offres", icon: Briefcase },
  { key: "formations", label: "Formations", short: "Académie", to: "/companies/$slug/academie", icon: GraduationCap },
  { key: "journal", label: "Journal", short: "Blog", to: "/companies/$slug/journal", icon: Newspaper },
  { key: "preuves", label: "Preuves", short: "Preuves", to: "/companies/$slug/preuves", icon: ShieldCheck },
  { key: "equipes", label: "Équipes", short: "Gens", to: "/companies/$slug/equipes", icon: Users },
  { key: "medias", label: "Médias", short: "Média", to: "/companies/$slug/medias", icon: Images },
  { key: "rdv", label: "Rendez-vous", short: "RDV", to: "/companies/$slug/rdv", icon: Calendar },
];

function activeTab(pathname: string, slug: string): TabKey {
  const base = `/companies/${slug}`;
  if (pathname.startsWith(`${base}/academie`)) return "formations";
  if (pathname.startsWith(`${base}/offres`)) return "offres";
  if (pathname.startsWith(`${base}/journal`)) return "journal";
  if (pathname.startsWith(`${base}/preuves`)) return "preuves";
  if (pathname.startsWith(`${base}/equipes`)) return "equipes";
  if (pathname.startsWith(`${base}/medias`)) return "medias";
  if (pathname.startsWith(`${base}/rdv`)) return "rdv";
  return "presentation";
}

export function CompanyShell({
  company,
  jobsCount,
  courseCount,
  articleCount = 0,
  hireCount = 0,
  slotCount = 0,
  compact = false,
  children,
}: {
  company: HouseChrome;
  jobsCount: number;
  courseCount: number;
  articleCount?: number;
  hireCount?: number;
  slotCount?: number;
  compact?: boolean;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = activeTab(pathname, company.slug);
  const media = mediaOf(company.slug, company.industry);
  const city = cityOfSlug(citySlug(company.hqCity));
  const counts: Partial<Record<TabKey, number>> = {
    offres: jobsCount,
    formations: courseCount,
    journal: articleCount,
    preuves: hireCount,
    rdv: slotCount,
  };

  return (
    <div>
      <nav className="mx-auto max-w-6xl px-4 py-3 text-xs text-muted sm:px-6">
        <Link to="/" className="hover:text-ink">
          Vera
        </Link>
        {" · "}
        <Link to="/companies" className="hover:text-ink">
          Entreprises
        </Link>
        {city && (
          <>
            {" · "}
            <Link to="/lieux/$city" params={{ city: city.slug }} className="hover:text-ink">
              {city.name}
            </Link>
          </>
        )}
        {" · "}
        <span className="text-ink">{company.name}</span>
      </nav>

      <div className={cn("relative overflow-hidden", compact ? "h-40 sm:h-52" : "h-56 sm:h-80 lg:h-96")}>
        <img
          src={media.cover}
          alt={`${company.name} — ${company.industry}`}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/25" />
        {media.video && !compact && (
          <Link
            to="/companies/$slug/medias"
            params={{ slug: company.slug }}
            className="absolute right-4 bottom-4 inline-flex h-11 items-center gap-2 rounded-full bg-surface/95 px-4 text-sm font-medium text-ink shadow-soft sm:right-8"
          >
            <Play className="size-4" />
            Vidéo de la maison
          </Link>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className={cn("flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between", compact ? "-mt-8" : "-mt-12 sm:-mt-14")}>
          <div className="flex min-w-0 items-end gap-4">
            <CompanyMark
              name={company.name}
              slug={company.slug}
              className={cn(
                "shrink-0 ring-4 ring-bg",
                compact ? "size-16 text-xl" : "size-20 text-2xl sm:size-24 sm:text-3xl",
              )}
            />
            <div className="min-w-0 pb-1">
              <p className="text-xs tracking-wide text-muted uppercase">{company.industry}</p>
              <h1 className={cn("font-serif tracking-tight text-ink", compact ? "text-3xl" : "text-4xl sm:text-5xl")}>
                {company.name}
              </h1>
              {!compact && <p className="mt-1 max-w-xl text-base text-muted sm:text-lg">{company.tagline}</p>}
            </div>
          </div>
          {!compact && (
            <div className="flex flex-wrap gap-2 pb-1">
              <Button asChild>
                <Link to="/companies/$slug/offres" params={{ slug: company.slug }}>
                  Voir les offres
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/companies/$slug/rdv" params={{ slug: company.slug }}>
                  Prendre rendez-vous
                </Link>
              </Button>
            </div>
          )}
        </div>

        {!compact && (
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat k="Siège" v={`${company.hqCity}${company.hqCountry ? `, ${company.hqCountry}` : ""}`} />
            <Stat k="Taille" v={company.sizeBand ?? "—"} />
            <Stat k="Fondée" v={company.foundedYear ? String(company.foundedYear) : "—"} />
            <Stat
              k="Honneur"
              v={String(company.honorScore)}
              hint={honorCaption(company.honorScore, company.honorDue ?? 1)}
              tone={honorTone(company.honorScore)}
            />
          </dl>
        )}
      </div>

      <div className="sticky top-16 z-20 mt-8 border-y border-border bg-bg/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-6xl gap-0 overflow-x-auto px-2 sm:px-4" aria-label="Sections de la fiche">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const on = current === tab.key;
            const n = counts[tab.key];
            return (
              <Link
                key={tab.key}
                to={tab.to}
                params={{ slug: company.slug }}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "inline-flex h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors",
                  on ? "border-primary text-ink" : "border-transparent text-muted hover:text-ink",
                )}
              >
                <Icon className="size-4" />
                <span className="sm:hidden">{tab.short}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {n != null && n > 0 && (
                  <span className="tabular-nums text-xs text-subtle">{n}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}

function Stat({
  k,
  v,
  hint,
  tone,
}: {
  k: string;
  v: string;
  hint?: string;
  tone?: "good" | "warn" | "bad" | "primary" | "default";
}) {
  return (
    <div className="border-t border-border pt-3">
      <dt className="text-xs tracking-wide text-muted uppercase">{k}</dt>
      <dd className="mt-1 font-serif text-xl tabular-nums">{v}</dd>
      {hint && (
        <Badge tone={tone ?? "default"} className="mt-1">
          {hint}
        </Badge>
      )}
    </div>
  );
}
