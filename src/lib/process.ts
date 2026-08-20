export type ProcessStep = {
  name: string;
  hours: number;
  who: string;
};

const FLAGSHIP: Record<string, ProcessStep[]> = {
  "staff-backend-sable": [
    { name: "Note écrite asynchrone", hours: 0.75, who: "Vous" },
    { name: "Pairing runtime", hours: 1.5, who: "Staff" },
    { name: "Cas coût / rétention", hours: 3, who: "Vous" },
    { name: "Revue architecture", hours: 1.25, who: "CTO" },
  ],
  "directeur-digital-vale": [
    { name: "Brief avec la direction", hours: 1, who: "DG" },
    { name: "Cas : couper une agence", hours: 4, who: "Vous" },
    { name: "Panel création + retail", hours: 2, who: "Comité" },
    { name: "Références dirigées", hours: 1.5, who: "Talent" },
    { name: "Dîner de décision", hours: 2, who: "Famille" },
  ],
  "journaliste-data-relais": [
    { name: "Process fantôme — n’y allez pas", hours: 6, who: "Personne" },
  ],
  "dev-edito-relais": [
    { name: "Process fantôme — n’y allez pas", hours: 5, who: "Personne" },
  ],
  "stage-produit-lumina": [
    { name: "Échange encadrant", hours: 0.5, who: "PM" },
    { name: "Mini-cas écrit", hours: 2, who: "Vous" },
    { name: "Rencontre équipe", hours: 0.75, who: "Produit" },
  ],
  "freelance-aml-helios": [
    { name: "Appel de cadrage", hours: 0.5, who: "Compliance" },
    { name: "Revue de dossier", hours: 2, who: "Vous" },
    { name: "Go / no-go", hours: 0.5, who: "CRO" },
  ],
  "product-designer-lumina-paris": [
    { name: "Portfolio walkthrough", hours: 0.75, who: "Design" },
    { name: "Critique d’un flux métier", hours: 2.5, who: "Vous" },
    { name: "Binôme PM + front", hours: 1, who: "Produit" },
  ],
  "security-engineer-sable": [
    { name: "Plan 90 jours (écrit)", hours: 2, who: "Vous" },
    { name: "Revue AppSec", hours: 1.5, who: "Platform" },
    { name: "Call fondateurs", hours: 0.75, who: "CEO" },
  ],
  "chef-projet-solaire-kora": [
    { name: "Appel terrain", hours: 0.5, who: "Ops" },
    { name: "Cas planning réel", hours: 2, who: "Vous" },
    { name: "Visite de site", hours: 1.5, who: "Chef de projet" },
  ],
  "technicien-maintenance-releve": [
    { name: "Échange chef d’équipe", hours: 0.5, who: "Maintenance" },
    { name: "Épreuve machine", hours: 0.5, who: "Vous" },
    { name: "Visite atelier", hours: 1, who: "Binôme" },
  ],
  "electricien-ombrieres-kora": [
    { name: "Échange chantier", hours: 0.4, who: "Chef de projet" },
    { name: "Schéma à diagnostiquer", hours: 0.4, who: "Vous" },
    { name: "Demi-journée site", hours: 3, who: "Équipe" },
  ],
  "aide-domicile-lise": [
    { name: "Échange coordinatrice", hours: 0.5, who: "Coordination" },
    { name: "Scénario de soin", hours: 0.3, who: "Vous" },
    { name: "Binôme une matinée", hours: 3, who: "Auxiliaire" },
  ],
};

export function processForJob(job: {
  slug?: string;
  seniority: string;
  contract: string;
}): ProcessStep[] {
  if (job.slug && FLAGSHIP[job.slug]) return FLAGSHIP[job.slug]!;
  if (job.contract === "stage" || job.contract === "alternance") {
    return [
      { name: "Échange RH", hours: 0.5, who: "Talent" },
      { name: "Entretien métier", hours: 1, who: "Manager" },
      { name: "Cas court", hours: 2, who: "Vous" },
    ];
  }
  if (job.contract === "freelance") {
    return [
      { name: "Cadrage mission", hours: 0.5, who: "Manager" },
      { name: "Revue de preuves", hours: 1.5, who: "Vous" },
      { name: "Décision", hours: 0.5, who: "Budget" },
    ];
  }
  if (job.seniority === "staff" || job.seniority === "lead") {
    return [
      { name: "Screening", hours: 0.5, who: "Talent" },
      { name: "Deep dive métier", hours: 1.5, who: "Pairs" },
      { name: "Cas écrit", hours: 4, who: "Vous" },
      { name: "Panel leadership", hours: 1.5, who: "Dirigeants" },
      { name: "Références", hours: 1, who: "Talent" },
    ];
  }
  if (job.seniority === "senior") {
    return [
      { name: "Screening", hours: 0.5, who: "Talent" },
      { name: "Entretien métier", hours: 1.25, who: "Manager" },
      { name: "Cas", hours: 3, who: "Vous" },
      { name: "Équipe", hours: 1, who: "Pairs" },
    ];
  }
  if (job.seniority === "junior") {
    return [
      { name: "RH", hours: 0.5, who: "Talent" },
      { name: "Métier", hours: 1, who: "Manager" },
      { name: "Exercice", hours: 1.5, who: "Vous" },
    ];
  }
  return [
    { name: "Screening", hours: 0.5, who: "Talent" },
    { name: "Entretien métier", hours: 1, who: "Manager" },
    { name: "Cas", hours: 2.5, who: "Vous" },
    { name: "Fit équipe", hours: 0.75, who: "Pairs" },
  ];
}

export function hoursOf(steps: ProcessStep[]): number {
  return Math.round(steps.reduce((s, x) => s + x.hours, 0) * 10) / 10;
}

export function decisionDaysFor(job: { slug?: string; seniority: string; contract: string }): number {
  if (job.slug?.includes("relais")) return 45;
  if (job.contract === "freelance") return 7;
  if (job.contract === "stage" || job.contract === "alternance") return 10;
  if (job.seniority === "staff" || job.seniority === "lead") return 21;
  return 14;
}

export function parseProcess(raw: string | null | undefined): ProcessStep[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as { name?: unknown; hours?: unknown; who?: unknown };
      if (typeof row.name !== "string") return [];
      return [{ name: row.name, hours: Number(row.hours) || 0, who: String(row.who ?? "") }];
    });
  } catch {
    return [];
  }
}

export function formatHours(n: number): string {
  if (n < 1) return `${Math.round(n * 60)} min`;
  const rounded = Math.round(n * 10) / 10;
  return `${rounded.toString().replace(".", ",")} h`;
}
