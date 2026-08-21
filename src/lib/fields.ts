export type FieldKind = "scale" | "choice" | "bool" | "text";

export type FieldDef = {
  id: string;
  label: string;
  kind: FieldKind;
  weight: number;
  hint: string;
  options?: string[];
  min?: number;
  max?: number;
};

export type EvalGrid = {
  family: string;
  title: string;
  intro: string;
  fields: FieldDef[];
};

export const FAMILIES: { id: string; label: string }[] = [
  { id: "tech", label: "Produit / ingénierie" },
  { id: "terrain", label: "Chantier / maintenance" },
  { id: "soin", label: "Soin" },
  { id: "commercial", label: "Commercial Europe" },
  { id: "asie", label: "Commercial / BD Asie" },
  { id: "design", label: "Design / écriture" },
  { id: "finance", label: "Finance / risque" },
  { id: "staff", label: "Staff & lead" },
];

const GRIDS: Record<string, EvalGrid> = {
  asie: {
    family: "asie",
    title: "Grille Asie — ce que l’entreprise mesure vraiment",
    intro:
      "Pas un CV « 10 ans d’Asie ». Mandarin réel, guanxi nommé, style de négo, fuseau. Le scoring est public.",
    fields: [
      {
        id: "mandarin",
        label: "Maîtrise du mandarin",
        kind: "choice",
        weight: 24,
        hint: "Hors « notions ». On veut le niveau de négo.",
        options: ["Aucun", "HSK 3 — social", "HSK 5 — négo simple", "Natif / négo complexe"],
      },
      {
        id: "guanxi",
        label: "Guanxi et réseau nommé",
        kind: "text",
        weight: 22,
        hint: "Trois portes que vous ouvrez, pas « un fort réseau en Chine ».",
      },
      {
        id: "nego",
        label: "Style de négociation",
        kind: "choice",
        weight: 18,
        hint: "Ce que vous faites quand le « yes » veut dire « j’ai entendu ».",
        options: [
          "Push western jusqu’à la signature",
          "Silence et recul, puis reformulation",
          "Intermédiaire local qui porte la face",
          "Je n’ai jamais négocié en Asie",
        ],
      },
      {
        id: "corridor",
        label: "Années de corridor Asie–Europe",
        kind: "scale",
        weight: 16,
        min: 0,
        max: 5,
        hint: "0 = jamais. 5 = vous avez déjà perdu un deal à Shanghai et vous savez pourquoi.",
      },
      {
        id: "fuseau",
        label: "Fuseaux (CET ↔ SGT / JST / CST)",
        kind: "bool",
        weight: 10,
        hint: "Appels 7 h ou 21 h, tenus, pas « on verra ».",
      },
      {
        id: "face",
        label: "Gestion de la face",
        kind: "choice",
        weight: 10,
        options: [
          "Je recadre en public si c’est vrai",
          "Je recadre en privé, toujours",
          "Je laisse l’intermédiaire",
          "Je ne sais pas ce que ça veut dire",
        ],
        hint: "Un seul « no » public peut tuer six mois.",
      },
    ],
  },
  terrain: {
    family: "terrain",
    title: "Grille terrain",
    intro: "Habilitations, 3×8, outils. Pas « polyvalent et motivé ».",
    fields: [
      {
        id: "hab",
        label: "Habilitations en poche",
        kind: "text",
        weight: 28,
        hint: "BS, B2V, BR, CACES — numéros et dates, pas « à passer ».",
      },
      {
        id: "shifts",
        label: "3×8 / astreinte",
        kind: "choice",
        weight: 22,
        options: ["Impossible", "Astreinte ok, pas la nuit", "Nuit ok, planning figé exigé", "Tout, si c’est écrit"],
        hint: "On croit le contrat, pas le slogan.",
      },
      {
        id: "consigne",
        label: "Consignation — vous avez déjà arrêté une ligne",
        kind: "bool",
        weight: 20,
        hint: "Si non, on forme. Si vous mentez, ça se voit le premier lundi.",
      },
      {
        id: "outils",
        label: "Outils que vous refusez de bricoler",
        kind: "text",
        weight: 15,
        hint: "Ce que vous exigez (couple, cadenas perso…). Le contraire d’un « on fait avec ».",
      },
      {
        id: "francais",
        label: "Français de chantier / atelier",
        kind: "scale",
        weight: 15,
        min: 1,
        max: 5,
        hint: "1 = j’ai besoin d’un interprète. 5 = je tiens un arrêt avec la production.",
      },
    ],
  },
  soin: {
    family: "soin",
    title: "Grille soin",
    intro: "Le dos, les familles, le plafond de tournée. Pas la vocation.",
    fields: [
      {
        id: "deaes",
        label: "Diplôme / années",
        kind: "choice",
        weight: 22,
        options: ["En formation", "DEAES ou équivalent", "3 ans et plus", "Infirmier·ère"],
        hint: "On forme. On ne fait pas semblant.",
      },
      {
        id: "tournee",
        label: "Tournée tenable selon vous",
        kind: "choice",
        weight: 24,
        options: ["8–10 personnes", "6–7", "5, pas plus", "Moins, cas lourds"],
        hint: "Chez Lise le plafond est 5. Si vous en voulez 9, ce n’est pas l’entreprise.",
      },
      {
        id: "refus",
        label: "Refus de soin",
        kind: "choice",
        weight: 22,
        options: ["J’insiste, le plan est payé", "Je pars et je note non-coopérant", "Je nomme le refus, j’offre une porte"],
        hint: "La grille copie l’épreuve.",
      },
      {
        id: "dos",
        label: "Manutention — lève-personne demandé",
        kind: "bool",
        weight: 16,
        hint: "Oui = vous savez le réclamer avant l’arrêt maladie.",
      },
      {
        id: "langue",
        label: "Langues à domicile",
        kind: "text",
        weight: 16,
        hint: "Français + ce que les personnes parlent vraiment.",
      },
    ],
  },
  tech: {
    family: "tech",
    title: "Grille ingénierie",
    intro: "Preuves, pas des frameworks. L’écriture compte autant que le repo.",
    fields: [
      {
        id: "preuve",
        label: "Une preuve récente (chiffre)",
        kind: "text",
        weight: 28,
        hint: "Coût, p99, adoption — pas « passionné de code ». ",
      },
      {
        id: "async",
        label: "Async / écriture",
        kind: "scale",
        weight: 20,
        min: 1,
        max: 5,
        hint: "1 = je pense en réunion. 5 = RFC d’abord.",
      },
      {
        id: "oncall",
        label: "On-call",
        kind: "choice",
        weight: 16,
        options: ["Non", "Rare et payé", "Semaine type, runbook exigé"],
        hint: "Sable : rare, payé.",
      },
      {
        id: "langue",
        label: "Langue de travail",
        kind: "choice",
        weight: 18,
        options: ["Français seulement", "Anglais lu, français parlé", "Anglais écrit de RFC"],
        hint: "Remote Europe = anglais d’arbitrage.",
      },
      {
        id: "stack",
        label: "Stack réellement tenue 12 mois",
        kind: "text",
        weight: 18,
        hint: "Ce que vous avez cassé en prod, pas ce que vous avez survolé.",
      },
    ],
  },
  commercial: {
    family: "commercial",
    title: "Grille commercial",
    intro: "Comptes nommés, cycles, pertes. Pas un quota magique.",
    fields: [
      {
        id: "comptes",
        label: "Comptes que vous avez ouverts",
        kind: "text",
        weight: 26,
        hint: "Noms, pas « grand compte public ».",
      },
      {
        id: "cycle",
        label: "Cycle de vente tenu",
        kind: "choice",
        weight: 20,
        options: ["< 30 j", "1–3 mois", "Marché public / 6–18 mois", "Partenariat multi-années"],
        hint: "Un closer inbound n’est pas un BD collectivités.",
      },
      {
        id: "perte",
        label: "Un deal perdu, et pourquoi",
        kind: "text",
        weight: 24,
        hint: "On embauche ceux qui ont déjà perdu.",
      },
      {
        id: "langue",
        label: "Langues de négo",
        kind: "text",
        weight: 16,
        hint: "Celle de la commission, pas du LinkedIn.",
      },
      {
        id: "deplace",
        label: "Déplacements",
        kind: "choice",
        weight: 14,
        options: ["Sédentaire", "Région", "National", "International mensuel"],
        hint: "Écrit, pas « mobilité ».",
      },
    ],
  },
  design: {
    family: "design",
    title: "Grille design",
    intro: "Système, critique, écriture. Pas Dribbble.",
    fields: [
      {
        id: "systeme",
        label: "Un système en production",
        kind: "bool",
        weight: 28,
        hint: "Tokens, pas une landing.",
      },
      {
        id: "critique",
        label: "Fréquence de critique que vous voulez",
        kind: "choice",
        weight: 22,
        options: ["Mensuelle", "Hebdo", "Quotidienne, orale", "Écrite, quotidienne"],
        hint: "Atelier Nord = quotidienne.",
      },
      {
        id: "ecrit",
        label: "Écriture (FR / EN)",
        kind: "scale",
        weight: 20,
        min: 1,
        max: 5,
        hint: "Les règles, pas seulement Figma.",
      },
      {
        id: "metier",
        label: "Outil métier déjà dessiné",
        kind: "text",
        weight: 30,
        hint: "Qui s’en sert, quel temps gagné.",
      },
    ],
  },
  finance: {
    family: "finance",
    title: "Grille finance / risque",
    intro: "Invariants, audits, erreurs publiées. Pas le scoring magique.",
    fields: [
      {
        id: "regul",
        label: "Régulateur déjà essuyé",
        kind: "choice",
        weight: 26,
        options: ["Aucun", "ACPR / AMF", "FCA / CSSF", "Multi-pays"],
        hint: "Helios n’embauche pas le théâtre.",
      },
      {
        id: "erreur",
        label: "Taux d’erreur que vous avez publié",
        kind: "text",
        weight: 24,
        hint: "Un chiffre, une période.",
      },
      {
        id: "sql",
        label: "SQL / règles tenues",
        kind: "scale",
        weight: 20,
        min: 1,
        max: 5,
        hint: "1 = Excel. 5 = moteur de règles en prod.",
      },
      {
        id: "langue",
        label: "Langue des procédures",
        kind: "choice",
        weight: 15,
        options: ["Français", "Anglais", "Les deux, rédactionnel"],
        hint: "AML Londres = anglais rédactionnel.",
      },
      {
        id: "astreinte",
        label: "Astreinte fraude",
        kind: "bool",
        weight: 15,
        hint: "Payée, ou ce n’est pas une astreinte.",
      },
    ],
  },
  staff: {
    family: "staff",
    title: "Grille staff / lead",
    intro: "Arbitrage, pas le titre. Combien de non vous avez tenus.",
    fields: [
      {
        id: "non",
        label: "Un non coûteux que vous avez tenu",
        kind: "text",
        weight: 30,
        hint: "Feature, agence, embauche — avec le prix.",
      },
      {
        id: "equipe",
        label: "Personnes dont vous étiez responsable",
        kind: "choice",
        weight: 20,
        options: ["0 — staff IC", "2–5", "6–12", "12+ et je veux moins"],
        hint: "Lead chez Orbital = responsabilité, pas un bureau.",
      },
      {
        id: "ecrit",
        label: "Décisions écrites",
        kind: "scale",
        weight: 22,
        min: 1,
        max: 5,
        hint: "1 = je décide en réunion. 5 = RFC publique.",
      },
      {
        id: "langue",
        label: "Langue d’arbitrage",
        kind: "choice",
        weight: 14,
        options: ["Français", "Anglais", "Les deux"],
        hint: "Remote staff = anglais.",
      },
      {
        id: "scope",
        label: "Périmètre que vous refusez",
        kind: "text",
        weight: 14,
        hint: "Le contraire du « je m’adapte ».",
      },
    ],
  },
};

const JOB_FAMILY: Record<string, string> = {
  "technicien-maintenance-releve": "terrain",
  "electricien-ombrieres-kora": "terrain",
  "chef-projet-solaire-kora": "terrain",
  "aide-domicile-lise": "soin",
  "infirmier-produit-mireille": "soin",
  "frontend-sable-remote": "tech",
  "staff-backend-sable": "staff",
  "security-engineer-sable": "tech",
  "full-stack-kora": "tech",
  "backend-kotlin-helios": "tech",
  "product-designer-lumina-paris": "design",
  "designer-systeme-atelier-nord": "design",
  "designer-produit-helios": "design",
  "ux-writer-vale": "design",
  "account-public-lumina": "commercial",
  "alternance-commercial-kora": "commercial",
  "business-developer-asie-northline": "asie",
  "risk-analyst-helios": "finance",
  "freelance-aml-helios": "finance",
  "directeur-digital-vale": "staff",
  "tech-lead-embarque-orbital": "staff",
};

export function familyOf(job: { slug: string; collection: string | null; title: string; companyIndustry?: string }): string {
  if (JOB_FAMILY[job.slug]) return JOB_FAMILY[job.slug]!;
  const t = job.title.toLowerCase();
  if (t.includes("asie") || t.includes("asia") || t.includes("china")) return "asie";
  if (job.collection === "terrain") return "terrain";
  if (job.collection === "sante" || t.includes("soin") || t.includes("infirm")) return "soin";
  if (job.collection === "design") return "design";
  if (job.collection === "staff") return "staff";
  if (job.collection === "finance" || t.includes("risk") || t.includes("aml")) return "finance";
  if (t.includes("account") || t.includes("commercial") || t.includes("vente")) return "commercial";
  return "tech";
}

export function gridByFamily(id: string): EvalGrid {
  return GRIDS[id] ?? GRIDS.tech!;
}

export function gridFor(job: { slug: string; collection: string | null; title: string }): EvalGrid {
  return gridByFamily(familyOf(job));
}

export type GridAnswers = Record<string, string | number | boolean>;

export function scoreGrid(grid: EvalGrid, answers: GridAnswers): { score: number; breakdown: { id: string; pts: number; max: number }[] } {
  let total = 0;
  let max = 0;
  const breakdown: { id: string; pts: number; max: number }[] = [];
  for (const f of grid.fields) {
    max += f.weight;
    const raw = answers[f.id];
    let ratio = 0;
    if (f.kind === "bool") ratio = raw === true || raw === "true" || raw === "oui" ? 1 : 0;
    else if (f.kind === "scale") {
      const n = Number(raw);
      const lo = f.min ?? 1;
      const hi = f.max ?? 5;
      ratio = Number.isFinite(n) ? Math.max(0, Math.min(1, (n - lo) / Math.max(1, hi - lo))) : 0;
    } else if (f.kind === "choice") {
      const opts = f.options ?? [];
      const idx = opts.indexOf(String(raw ?? ""));
      ratio = idx < 0 ? 0 : idx / Math.max(1, opts.length - 1);
    } else {
      const t = String(raw ?? "").trim();
      ratio = t.length >= 40 ? 1 : t.length >= 12 ? 0.6 : t.length > 0 ? 0.25 : 0;
    }
    const pts = Math.round(f.weight * ratio);
    total += pts;
    breakdown.push({ id: f.id, pts, max: f.weight });
  }
  return { score: max ? Math.round((total / max) * 100) : 0, breakdown };
}

export function mergeCustom(base: EvalGrid, extra: FieldDef[]): EvalGrid {
  if (!extra.length) return base;
  return { ...base, fields: [...base.fields, ...extra] };
}

export function parseStoredGrid(raw: string | null | undefined): { family?: string; extra: FieldDef[] } {
  if (!raw) return { extra: [] };
  try {
    const v = JSON.parse(raw) as { family?: unknown; extra?: unknown };
    const family = typeof v.family === "string" && v.family ? v.family : undefined;
    const extra: FieldDef[] = Array.isArray(v.extra)
      ? v.extra.flatMap((item) => {
          if (!item || typeof item !== "object") return [];
          const r = item as Partial<FieldDef>;
          if (!r.id || !r.label) return [];
          const kind: FieldKind =
            r.kind === "scale" || r.kind === "choice" || r.kind === "bool" || r.kind === "text" ? r.kind : "text";
          return [
            {
              id: String(r.id),
              label: String(r.label),
              kind,
              weight: Number(r.weight) || 10,
              hint: String(r.hint ?? ""),
              options: Array.isArray(r.options) ? r.options.map(String) : undefined,
              min: typeof r.min === "number" ? r.min : undefined,
              max: typeof r.max === "number" ? r.max : undefined,
            },
          ];
        })
      : [];
    return { family, extra };
  } catch {
    return { extra: [] };
  }
}
