export type BarrierId = "mobilite" | "garde" | "equipement" | "logement" | "horaires" | "numerique";

export type Barrier = {
  id: BarrierId;
  label: string;
  candidate: string;
  house: string;
};

export const BARRIERS: Barrier[] = [
  {
    id: "mobilite",
    label: "Mobilité",
    candidate: "Pas de permis, pas de voiture, ou plus de 45 min de trajet.",
    house: "Navette, permis financé, ou poste desservi. Écrit, pas un « on verra ».",
  },
  {
    id: "garde",
    label: "Garde d’enfants",
    candidate: "Créneau incompatible avec une crèche standard.",
    house: "Partenaire garde / horaires 9h–16h possibles / relais nommé.",
  },
  {
    id: "equipement",
    label: "Équipement",
    candidate: "Pas de chaussures de sécu, pas d’EPI, pas d’outillage.",
    house: "Chèque équipement J1, ou dotation complète. Montant écrit.",
  },
  {
    id: "logement",
    label: "Logement transitoire",
    candidate: "Pas de toit à moins de 40 km du site les 30 premiers jours.",
    house: "Foyer / hôtel / coloc partenaire, durée et reste-à-charge écrits.",
  },
  {
    id: "horaires",
    label: "Horaires",
    candidate: "Pas de 3×8, pas d’astreinte non annoncée.",
    house: "Planning figé, pas de 3×8, ou aménagement senior / RSA nommé.",
  },
  {
    id: "numerique",
    label: "Numérique",
    candidate: "Pas de PC, connexion instable, démarches en ligne dures.",
    house: "Dossier papier accepté, créneau accompagné, pas uniquement l’espace candidat.",
  },
];

export type TryBuy = {
  days: number;
  dailyPay: number;
  supervisor: string;
  startNote: string;
};

export function barrierOf(id: string): Barrier | undefined {
  return BARRIERS.find((b) => b.id === id);
}

export function coveredOf(ids: string[]): Barrier[] {
  return BARRIERS.filter((b) => ids.includes(b.id));
}

export function barrierFit(need: string[], cover: string[]): { covered: string[]; open: string[]; score: number } {
  const coverSet = new Set(cover);
  const covered = need.filter((id) => coverSet.has(id));
  const open = need.filter((id) => !coverSet.has(id));
  if (need.length === 0) return { covered, open, score: 100 };
  return { covered, open, score: Math.round((covered.length / need.length) * 100) };
}
