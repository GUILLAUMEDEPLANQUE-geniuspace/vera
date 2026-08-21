export type CultureAxis = {
  id: "directness" | "hierarchy" | "tempo" | "writing" | "risk";
  label: string;
  low: string;
  high: string;
};

export const CULTURE_AXES: CultureAxis[] = [
  { id: "directness", label: "Parole", low: "Harmonie", high: "Franc" },
  { id: "hierarchy", label: "Hiérarchie", low: "Plate", high: "Serrée" },
  { id: "tempo", label: "Tempo", low: "Lent", high: "Serré" },
  { id: "writing", label: "Canal", low: "Réunions", high: "Écrit" },
  { id: "risk", label: "Risque", low: "Prudent", high: "Expérimental" },
];

export type CultureProfile = {
  axes: Record<CultureAxis["id"], number>;
  languages: string[];
  management: string;
  weekStyle: string;
  intercultural: number;
  essay: string;
};

export const HOUSE_CULTURE: Record<string, CultureProfile> = {
  lumina: {
    axes: { directness: 78, hierarchy: 42, tempo: 62, writing: 70, risk: 68 },
    languages: ["Français", "Anglais"],
    management: "Binômes PM + métier. Les élus clients tranchent plus que le N+1.",
    weekStyle: "4,5 jours. Terrain métropole un jour par quinzaine.",
    intercultural: 74,
    essay:
      "Lumina embauche des gens qui savent parler à une DSI de métropole sans jargon climat. Le français d’abord, l’anglais de travail. On n’y survit pas si on a besoin d’un slide pour dire non.",
  },
  sable: {
    axes: { directness: 88, hierarchy: 22, tempo: 55, writing: 94, risk: 60 },
    languages: ["Anglais", "Français", "Portugais"],
    management: "Async, fuseau ±2 h, mercredi mort. Le titre ne crée pas d’autorité — l’écriture, si.",
    weekStyle: "Remote Europe. On-call rare, payé.",
    intercultural: 91,
    essay:
      "Sable est une entreprise écrite. Lisbonne est un fuseau, pas un siège. Un Français, un Portugais et un Allemand peuvent tenir une RFC sans se voir. Ceux qui ont besoin de « sentir l’équipe » s’ennuient.",
  },
  mireille: {
    axes: { directness: 64, hierarchy: 58, tempo: 48, writing: 66, risk: 38 },
    languages: ["Français"],
    management: "Cliniciens dans la room. Le produit ne passe pas sans un soignant nommé.",
    weekStyle: "Hybride Lyon, 2 j remote. Un jour de service pour les profils issus du soin.",
    intercultural: 52,
    essay:
      "Mireille est française, hospitalière, lente volontairement. Un accent n’est pas un problème. Un flou dans une prescription, si. On n’y vient pas pour « disrupter la santé ».",
  },
  orbital: {
    axes: { directness: 72, hierarchy: 70, tempo: 58, writing: 80, risk: 28 },
    languages: ["Français", "Anglais"],
    management: "Revue par les pairs, habilitation, cantine qui ferme à 19 h. Le lead signifie responsabilité, pas un bureau.",
    weekStyle: "Site Toulouse. Hybride limité.",
    intercultural: 61,
    essay:
      "Orbital recrute des systèmes, pas des « space enthusiasts ». L’anglais de revue est exigé. La culture est d’ingénierie dure, peu théâtrale, peu internationale hors Europe.",
  },
  "atelier-nord": {
    axes: { directness: 90, hierarchy: 30, tempo: 44, writing: 72, risk: 55 },
    languages: ["Anglais", "Danois", "Français"],
    management: "Critique quotidienne. Pas de junior jetable. Une semaine Paris par mois.",
    weekStyle: "37 h, 32 h en août. Relogement d’essai.",
    intercultural: 86,
    essay:
      "Copenhague pense à voix haute. La critique n’est pas une agression — c’est le métier. Un profil français habitué aux non-dits souffre la première semaine, puis s’en souvient comme d’un luxe.",
  },
  helios: {
    axes: { directness: 70, hierarchy: 55, tempo: 66, writing: 60, risk: 42 },
    languages: ["Français", "Anglais"],
    management: "Compliance réelle, bonus écrits, astreinte payée double. Pas de titre gonflé.",
    weekStyle: "Hybride Paris / Londres. 2 j remote.",
    intercultural: 77,
    essay:
      "Helios parle argent sans théâtre. Un commercial Asie y entre si le guanxi sert un agrément, pas un afterwork. La culture est européenne, régulée, un peu sèche.",
  },
  "maison-vale": {
    axes: { directness: 48, hierarchy: 82, tempo: 50, writing: 40, risk: 22 },
    languages: ["Français", "Italien", "Anglais"],
    management: "Entreprise familiale. Les saisons commandent. Le digital rentre après dix ans d’agences.",
    weekStyle: "Présentiel Paris. Semaines de collection protégées.",
    intercultural: 58,
    essay:
      "Vale n’est pas un scale-up. On y parle matière et saison. Un profil anglo-saxon « radical candor » se casse les dents. Un Italien de l’entreprise, non. Le mépris du savoir-faire est le seul vrai interdit.",
  },
  northline: {
    axes: { directness: 75, hierarchy: 48, tempo: 80, writing: 58, risk: 50 },
    languages: ["Anglais", "Néerlandais", "Allemand", "Français"],
    management: "Ops dans le produit. Les grèves et les marées battent le stand-up.",
    weekStyle: "Hybride Amsterdam, remote Europe pour le produit.",
    intercultural: 88,
    essay:
      "Northline est un corridor. Rotterdam, Anvers, Bâle — et maintenant l’Asie. Un business developer qui n’a jamais mangé un silence japonais ou un « maybe » singapourien n’y fera rien. Le néerlandais est facultatif. Le fuseau, non.",
  },
  kora: {
    axes: { directness: 80, hierarchy: 45, tempo: 72, writing: 48, risk: 64 },
    languages: ["Français"],
    management: "Le chantier a raison sur le slide. Dire un retard le jour même.",
    weekStyle: "Terrain PACA. Août : stop 13 h, reprise 16 h.",
    intercultural: 49,
    essay:
      "Kora embauche des gens qui montent sur un toit. Le français de chantier est la langue. Un profil international s’y plaît s’il accepte la chaleur, pas s’il veut un English-speaking HQ.",
  },
  relais: {
    axes: { directness: 85, hierarchy: 35, tempo: 40, writing: 88, risk: 35 },
    languages: ["Français", "Anglais", "Néerlandais"],
    management: "Indépendance éditoriale. Salaires publiés. Gel des embauches au printemps.",
    weekStyle: "Hybride Bruxelles — quand il y a du budget.",
    intercultural: 70,
    essay:
      "Relais écrit vrai et paie quand elle embauche. Aujourd’hui le pacte est rompu. La culture n’efface pas un gel.",
  },
  releve: {
    axes: { directness: 84, hierarchy: 52, tempo: 60, writing: 35, risk: 40 },
    languages: ["Français", "Arabe dialectal"],
    management: "Le chef d’équipe est sur la ligne, pas dans un open space. Consignation non négociable.",
    weekStyle: "3×8 possibles. Planning figé 4 semaines. Astreinte 1/6.",
    intercultural: 63,
    essay:
      "Relève est un atelier Fos. On y parle français de maintenance, parfois darija. Un ingénieur de bureau qui ne veut pas se salir n’y a rien à faire. Un technicien formé au Maghreb, si — pourvu que la consigne soit tenue.",
  },
  lise: {
    axes: { directness: 60, hierarchy: 40, tempo: 42, writing: 55, risk: 30 },
    languages: ["Français"],
    management: "Coordinatrice nommée. Plafond de tournée. Supervision mensuelle.",
    weekStyle: "Domicile Lyon. Trajets payés. 5 personnes / jour.",
    intercultural: 57,
    essay:
      "Maison Lise recrute le calme. Les familles en colère, les deuils, les immeubles sans ascenseur. Un accent, une origine, ce n’est pas le sujet. La tournée qui déborde, si.",
  },
};

export function cultureOf(slug: string): CultureProfile {
  return (
    HOUSE_CULTURE[slug] ?? {
      axes: { directness: 60, hierarchy: 50, tempo: 55, writing: 55, risk: 50 },
      languages: ["Français"],
      management: "Non renseigné.",
      weekStyle: "Selon l’offre.",
      intercultural: 50,
      essay: "Culture non encore cartographiée. Le pacte et le salaire parlent déjà.",
    }
  );
}

export function cultureFit(
  house: CultureProfile,
  prefs: Partial<Record<CultureAxis["id"], number>> | null,
): number | null {
  if (!prefs || Object.keys(prefs).length === 0) return null;
  let n = 0;
  let acc = 0;
  for (const axis of CULTURE_AXES) {
    const want = prefs[axis.id];
    if (want == null) continue;
    const delta = Math.abs(house.axes[axis.id] - want);
    acc += Math.max(0, 100 - delta * 1.4);
    n += 1;
  }
  if (!n) return null;
  return Math.round(acc / n);
}
