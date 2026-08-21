export type Service = {
  slug: string;
  title: string;
  vendor: string;
  kind: "coaching" | "assessment" | "formation" | "audit";
  price: string;
  blurb: string;
  forHouses: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "coaching-interculturel-asie",
    title: "Coaching interculturel Asie — 4 séances",
    vendor: "Atelier Face",
    kind: "coaching",
    price: "1 800 €",
    blurb: "Mandarin de négo, guanxi, silence. Pour BD et managers qui arrivent sur un corridor.",
    forHouses: ["northline", "helios", "lumina"],
  },
  {
    slug: "assessment-consignation",
    title: "Assessment consignation / habilitations",
    vendor: "Relève Formation",
    kind: "assessment",
    price: "640 € / candidat",
    blurb: "Mise en situation atelier, 90 min. Score aligné sur la grille terrain Vera.",
    forHouses: ["releve", "kora", "orbital"],
  },
  {
    slug: "supervision-soin",
    title: "Supervision d’équipe à domicile",
    vendor: "Maison Lise",
    kind: "coaching",
    price: "220 € / mois / personne",
    blurb: "La psychologue déjà en place chez Lise, ouverte aux entreprises qui plafonnent leurs tournées.",
    forHouses: ["lise", "mireille"],
  },
  {
    slug: "audit-honneur",
    title: "Audit de pacte — 30 dossiers",
    vendor: "Vera",
    kind: "audit",
    price: "2 400 €",
    blurb: "On lit vos délais réels. Si l’honneur affiché ment, on le dit. Les entreprises sérieuses paient pour ça.",
    forHouses: [],
  },
  {
    slug: "brief-atelier",
    title: "Atelier brief — une page, pas un CV",
    vendor: "Vera",
    kind: "formation",
    price: "90 €",
    blurb: "Candidats : livré, refusé, suite. 2 h, remote, français.",
    forHouses: [],
  },
  {
    slug: "formation-b2v",
    title: "Habilitation B2V / BR — temps de travail",
    vendor: "Kora Académie",
    kind: "formation",
    price: "sur devis",
    blurb: "Pour les entreprises qui promettent « habilitation payée » et tiennent. Places ouvertes hors Kora.",
    forHouses: ["kora", "releve"],
  },
];

export function servicesFor(house: string): Service[] {
  return SERVICES.filter((s) => s.forHouses.includes(house) || s.kind === "audit");
}
