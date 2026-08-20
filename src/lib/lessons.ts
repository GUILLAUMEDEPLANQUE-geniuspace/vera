export type Lesson = {
  slug: string;
  title: string;
  kicker: string;
  miss: string;
  minutes: number;
  body: string[];
  drill: string;
};

export const LESSONS: Lesson[] = [
  {
    slug: "consignation-cadenas",
    title: "Consignation : le cadenas avant la clé",
    kicker: "Maintenance",
    miss: "lock-order",
    minutes: 8,
    body: [
      "Une ligne qui « a l’air à l’arrêt » n’est pas consignataire. L’énergie restante (air, ressort, condensateur) tue autant que le 400 V.",
      "Ordre Vera : identifier les énergies → séparer → cadenas perso → essai de remise en marche → mesure à zéro. Inverser deux étapes, c’est un accident, pas une coquille.",
    ],
    drill: "Refaites l’épreuve lockout. Score attendu ≥ 80. Un cadenas partagé = 0.",
  },
  {
    slug: "neutre-coupe",
    title: "Le neutre ouvert n’est pas un disjoncteur",
    kicker: "Électricité",
    miss: "wrong-diag",
    minutes: 6,
    body: [
      "Phase présente, pas de retour, disjoncteur fermé, prises OK : c’est un neutre de dérivation, pas un fusible « à changer ».",
      "On sonde deux points dont le bornier. Diagnostiquer sans sonde, c’est de la chance. Vera note la chance à 55, pas à 100.",
    ],
    drill: "Épreuve circuit : sondez disjoncteur + bornier avant de parler.",
  },
  {
    slug: "mesure-avant-cle",
    title: "Mesurer avant de tourner",
    kicker: "PAC / plomberie",
    miss: "skip-measure",
    minutes: 7,
    body: [
      "Une PAC qui « ne chauffe plus » n’est pas une vanne à ouvrir au hasard. Pression, sondes, tarif heures creuses : trois lectures, puis un geste.",
      "Le mauvais ordre casse un détendeur. Le bon ordre tient 8 minutes.",
    ],
    drill: "Épreuve machine : pression → sonde → client. Pas l’inverse.",
  },
  {
    slug: "plafond-tournée",
    title: "Cinq personnes, pas neuf",
    kicker: "Soin",
    miss: "overload",
    minutes: 5,
    body: [
      "Accepter une sixième personne « pour dépanner », c’est signer l’arrêt à six mois. Le plafond s’écrit, il se tient.",
      "Le geste : dire le nombre, proposer un report, alerter la coordinatrice. Pas « on verra ce soir ».",
    ],
    drill: "Épreuve soin : tenez le plafond au beat 2. Un oui de trop = score < 55.",
  },
  {
    slug: "harnais-avant-vitesse",
    title: "Harnais avant le planning",
    kicker: "Hauteur",
    miss: "skip-ppe",
    minutes: 5,
    body: [
      "Un chef qui dit « on grimpe, on n’a pas le temps » n’est pas un chef. Le harnais contrôlé, le point d’ancrage, puis le geste.",
      "Vera refuse les offres où la hauteur n’est pas écrite. L’épreuve aussi.",
    ],
    drill: "Épreuve lockout/hauteur : EPI avant isolation.",
  },
  {
    slug: "grille-publique",
    title: "Lire la grille avant d’écrire",
    kicker: "Candidature",
    miss: "grid-low",
    minutes: 4,
    body: [
      "Un 40/100 sur la grille n’est pas un mystère ATS. Les critères sont sur l’offre. Relisez, entraînez le geste, renvoyez.",
      "Les maisons voient le score. Mentir sur un critère booléen baisse plus que l’avouer.",
    ],
    drill: "Reprenez la grille de l’offre. Un critère < 3/5 → leçon métier liée.",
  },
  {
    slug: "try-buy-tenir",
    title: "Try & Buy : 5 jours, pas un stage fantôme",
    kicker: "RSA",
    miss: "immersion",
    minutes: 6,
    body: [
      "L’immersion Vera est payée, encadrée, avec chèque équipement le jour 1. Une PMSMP gratuite n’entre pas.",
      "Le frein non levé (trajet, garde) se dit avant J1. Après, c’est un abandon, pas un échec métier.",
    ],
    drill: "Cochez vos freins au profil. Candidatez seulement si la maison les couvre.",
  },
  {
    slug: "creneau-tenir",
    title: "Un créneau fractional n’est pas un CDD",
    kicker: "Senior",
    miss: "slot-clash",
    minutes: 5,
    body: [
      "Mardi Fos 8 h et jeudi Lyon 8 h, ça tient si le train existe. Deux mardis, non.",
      "Vous tenez le créneau ou vous le rendez 7 jours avant. Le pacte s’applique aux heures, pas seulement aux dossiers.",
    ],
    drill: "Ouvrez le calendrier. Un overlap = 0. Deux maisons, deux jours distincts.",
  },
];

export function lessonOf(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function lessonsForMisses(misses: string[], reasons: string[] = []): Lesson[] {
  const keys = new Set([...misses, ...reasons]);
  const hit = LESSONS.filter((l) => keys.has(l.miss) || keys.has(l.slug));
  if (hit.length) return hit.slice(0, 3);
  return [LESSONS.find((l) => l.slug === "grille-publique")!];
}

export const REJECT_REASONS: { id: string; label: string }[] = [
  { id: "lock-order", label: "Geste de consignation / ordre" },
  { id: "wrong-diag", label: "Diagnostic électrique" },
  { id: "skip-measure", label: "Mesure sautée (PAC, fluide)" },
  { id: "overload", label: "Plafond de tournée / charge" },
  { id: "skip-ppe", label: "EPI / hauteur" },
  { id: "grid-low", label: "Grille publique trop basse" },
  { id: "immersion", label: "Immersion / freins non levés" },
  { id: "slot-clash", label: "Créneau fractional impossible" },
  { id: "autre", label: "Autre, noté" },
];
