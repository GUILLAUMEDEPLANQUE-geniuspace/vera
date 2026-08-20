import type { SeedCompany, SeedJob } from "./seed-data";
import { slugify } from "./format";

type Row = {
  slug: string;
  name: string;
  city: string;
  industry: string;
  tag: string;
  about: string;
  metier: MetierKey;
  second?: MetierKey;
  pool?: string;
  barriers?: string[];
  tryBuy?: boolean;
  slots?: boolean;
};

type MetierKey =
  | "maintenance"
  | "elec"
  | "plomb"
  | "soin"
  | "couvreur"
  | "route"
  | "aide"
  | "nucl"
  | "fractional"
  | "binome"
  | "reprise";

const METIER: Record<
  MetierKey,
  {
    title: string;
    team: string;
    collection: string;
    skills: string[];
    salary: [number, number];
    seniority: SeedJob["seniority"];
    resp: string[];
    req: string[];
    benefits: string[];
    blurb: string;
  }
> = {
  maintenance: {
    title: "Technicien de maintenance",
    team: "Atelier",
    collection: "terrain",
    skills: ["Mécanique", "Hydraulique", "Consignation", "GMAO"],
    salary: [31000, 39000],
    seniority: "mid",
    resp: ["Rondes et pannes", "Consignation", "Kits atelier"],
    req: ["CACES ou à passer", "Lecture de plans", "Permis B"],
    benefits: ["Habilitations maison", "Astreinte écrite", "Outillage perso"],
    blurb: "Presse, consignation, pacte. Pas un pool jetable.",
  },
  elec: {
    title: "Électricien chantier",
    team: "Mise en service",
    collection: "terrain",
    skills: ["Électricité", "Habilitation", "Onduleurs", "Schéma"],
    salary: [32000, 40000],
    seniority: "mid",
    resp: ["Câblage", "Mise en service", "SAV 48 h"],
    req: ["B2V ou à passer 90 j", "Hauteur", "Permis B"],
    benefits: ["B2V payé", "Prime chaleur écrite", "Véhicule"],
    blurb: "Schéma avant le devis. Août à 13 h si c’est écrit.",
  },
  plomb: {
    title: "Plombier-chauffagiste",
    team: "PAC",
    collection: "terrain",
    skills: ["PAC", "Plomberie", "Fluides", "Devis"],
    salary: [30000, 38000],
    seniority: "mid",
    resp: ["Entretien PAC", "Dépannage", "Devis honnête"],
    req: ["CAP/BP", "Permis B", "Lecture de schéma fluide"],
    benefits: ["Astreinte 1/6 écrite", "Véhicule", "Tutorat"],
    blurb: "Mesurer avant de tourner. Le détendeur n’est pas un totem.",
  },
  soin: {
    title: "Aide-soignant·e",
    team: "Étage",
    collection: "sante",
    skills: ["Soin", "Toilette", "Transmissions", "SST"],
    salary: [22000, 27000],
    seniority: "mid",
    resp: ["Toilettes", "Transmissions", "Alertes"],
    req: ["DEAS ou équivalent", "Dos tenu", "Écriture lisible"],
    benefits: ["Prime dimanche écrite", "Ratio nommé", "Try & Buy si RSA"],
    blurb: "Un soignant nommé, un ratio. Pas un pool.",
  },
  couvreur: {
    title: "Couvreur-zingueur",
    team: "Toiture",
    collection: "terrain",
    skills: ["Couverture", "Zinc", "Hauteur", "Étanchéité"],
    salary: [28000, 36000],
    seniority: "mid",
    resp: ["Ardoises / zinc", "Étanchéité", "Chantier pluie"],
    req: ["Harnais, CACES nacelle un plus", "Permis B", "Ténue en hauteur"],
    benefits: ["Harnais neuf", "Jours pluie payés", "Reprise possible"],
    blurb: "La hauteur s’écrit. Un planning n’annule pas l’ancrage.",
  },
  route: {
    title: "Ouvrier voirie",
    team: "Équipe nuit",
    collection: "terrain",
    skills: ["Voirie", "Signalisation", "CACES", "Enrobé"],
    salary: [24000, 31000],
    seniority: "junior",
    resp: ["Pose", "Signalisation", "Nuits écrites"],
    req: ["CACES ou à passer", "Travail de nuit annoncé", "Permis B"],
    benefits: ["Nuits majorées", "Planning 4 semaines", "EPI complet J1"],
    blurb: "Nuit écrite, majorée. Pas un SMS à 16 h.",
  },
  aide: {
    title: "Auxiliaire de vie",
    team: "Tournée",
    collection: "sante",
    skills: ["Aide à domicile", "Toilette", "Trajets", "Familles"],
    salary: [21000, 25000],
    seniority: "mid",
    resp: ["Tournée plafond 5", "Transmissions", "Alertes"],
    req: ["Permis B ou mobilité maison", "Écriture", "Dos"],
    benefits: ["Trajets payés", "Plafond 5", "Coordinatrice nommée"],
    blurb: "Cinq personnes, pas neuf. Les trajets sont payés.",
  },
  nucl: {
    title: "Technicien habilité",
    team: "CNPE",
    collection: "terrain",
    skills: ["Habilitation", "Consignation", "Nucléaire", "Astreinte"],
    salary: [36000, 48000],
    seniority: "senior",
    resp: ["Rondes", "Consignation", "Astreinte 1/6"],
    req: ["Habilitation ou à passer maison", "Casier vierge", "Astreinte écrite"],
    benefits: ["Habilitation maison", "Cantine", "Astreinte 1/6"],
    blurb: "Habilitation, pas un slogan. L’allemand de consigne est un plus.",
  },
  fractional: {
    title: "Senior fractional — créneau atelier",
    team: "Expertise volante",
    collection: "terrain",
    skills: ["Maintenance", "Tutorat", "Consignation", "Planning"],
    salary: [48000, 62000],
    seniority: "senior",
    resp: ["Créneau 8 h", "Revue de ligne", "Binôme junior"],
    req: ["15 ans de geste", "Pas de 3×8", "Jours figés"],
    benefits: ["4–12 h / sem", "Tarif écrit", "Pas d’astreinte"],
    blurb: "Mardi atelier, tarif écrit, pas un CDD déguisé.",
  },
  binome: {
    title: "Binôme senior + junior méthodes",
    team: "Duo",
    collection: "terrain",
    skills: ["Geste", "Méthodes", "Tutorat", "GMAO"],
    salary: [34000, 52000],
    seniority: "mid",
    resp: ["Deux contrats, une offre", "Épreuve partagée", "Transmission"],
    req: ["Un des deux profils, l’autre se cherche", "Pacte commun"],
    benefits: ["Deux salaires", "Épreuve duo", "Tutorat payé"],
    blurb: "On n’embauche pas l’un sans l’autre.",
  },
  reprise: {
    title: "Salarié-repreneur — 18 mois",
    team: "Transmission",
    collection: "terrain",
    skills: ["Gestion", "Geste", "Clientèle", "Compta de chantier"],
    salary: [32000, 42000],
    seniority: "senior",
    resp: ["Tenir le chantier", "Suivre le cédant", "Option à 18 mois"],
    req: ["Connaître le geste", "Apport ou accompagnement écrit"],
    benefits: ["Tutorat cédant", "Chiffre réel", "Accompagnement"],
    blurb: "Le cédant a un âge. Le chiffre est dans l’offre.",
  },
};

const ROWS: Row[] = [
  { slug: "artois-maint", name: "Artois Maintenance", city: "Lens", industry: "Industrie", tag: "Ligne, pas pool.", about: "Atelier Lens / Béthune. Presses, consignation, junior en binôme.", metier: "maintenance", second: "binome" },
  { slug: "scarpe-lignes", name: "Scarpe Lignes", city: "Valenciennes", industry: "Industrie", tag: "Ferroviaire technique.", about: "Maintenance ferroviaire. Astreinte écrite.", metier: "maintenance", second: "fractional", slots: true, pool: "senior-fractional" },
  { slug: "estuaire-tech", name: "Estuaire Tech", city: "Le Havre", industry: "Industrie", tag: "Portuaire, graisse, pacte.", about: "Maintenance portuaire. 3×8 seulement s’il est nommé.", metier: "maintenance" },
  { slug: "meuse-rondes", name: "Meuse Rondes", city: "Metz", industry: "Industrie", tag: "Transfrontalier.", about: "Rondes, allemand de consigne bienvenu.", metier: "maintenance", second: "nucl" },
  { slug: "belfort-energie", name: "Belfort Énergie", city: "Belfort", industry: "Énergie", tag: "Ferroviaire et énergie.", about: "Atelier Belfort. Habilitations maison.", metier: "nucl", second: "maintenance" },
  { slug: "dunkerque-quai", name: "Dunkerque Quai", city: "Dunkerque", industry: "Industrie", tag: "Quai, vent, pacte.", about: "Maintenance quai. Prime vent écrite.", metier: "maintenance", pool: "rsa", barriers: ["mobilite", "equipement"], tryBuy: true },
  { slug: "azur-volt", name: "Azur Volt", city: "Nice", industry: "Énergie", tag: "PV littoral.", about: "Ombrières 06. Prime chaleur.", metier: "elec" },
  { slug: "herault-soleil", name: "Hérault Soleil", city: "Montpellier", industry: "Énergie", tag: "Toitures PV.", about: "Résidentiel et ombrières 34.", metier: "elec", second: "plomb" },
  { slug: "garonne-pv", name: "Garonne PV", city: "Toulouse", industry: "Énergie", tag: "Aéro + solaire.", about: "Chantiers 31. B2V maison.", metier: "elec" },
  { slug: "rhone-fils", name: "Rhône Fils", city: "Lyon", industry: "Énergie", tag: "Câble et consignation.", about: "Élec tertiaire Lyon. Fractional mardi.", metier: "elec", second: "fractional", slots: true, pool: "senior-fractional" },
  { slug: "dijon-courant", name: "Dijon Courant", city: "Dijon", industry: "Énergie", tag: "Réseau, pas slides.", about: "Chantier 21. Habilitation.", metier: "elec" },
  { slug: "loire-fils", name: "Loire Fils", city: "Tours", industry: "Énergie", tag: "Résidentiel Loiret-Touraine.", about: "Élec et SAV.", metier: "elec", second: "plomb" },
  { slug: "maine-pac", name: "Maine PAC", city: "Angers", industry: "Bâtiment", tag: "PAC, pas devis magique.", about: "Chauffage 49.", metier: "plomb" },
  { slug: "calvados-chaud", name: "Calvados Chaud", city: "Caen", industry: "Bâtiment", tag: "Chaudières, fluides.", about: "SAV 14. Astreinte 1/6.", metier: "plomb", pool: "slasher" },
  { slug: "somme-soin", name: "Somme Soin", city: "Amiens", industry: "Santé", tag: "Ratio nommé.", about: "Ehpad et domicile 80.", metier: "soin", second: "aide", pool: "rsa", barriers: ["garde", "mobilite", "equipement"], tryBuy: true },
  { slug: "roubaix-domicile", name: "Roubaix Domicile", city: "Roubaix", industry: "Santé", tag: "Tournées tenables.", about: "Plafond 5, trajets payés.", metier: "aide", pool: "rsa", barriers: ["mobilite", "garde", "numerique"], tryBuy: true },
  { slug: "forez-soin", name: "Forez Soin", city: "Saint-Étienne", industry: "Santé", tag: "Étage, pas pool.", about: "CHU / Ehpad 42.", metier: "soin" },
  { slug: "puy-soin", name: "Puy Soin", city: "Clermont-Ferrand", industry: "Santé", tag: "Ratio, prime dimanche.", about: "Soin 63.", metier: "soin", second: "aide" },
  { slug: "vienne-soin", name: "Vienne Soin", city: "Limoges", industry: "Santé", tag: "Rural, plafond tenu.", about: "Domicile 87. Mobilité maison.", metier: "aide", pool: "rsa", barriers: ["mobilite", "equipement"], tryBuy: true },
  { slug: "catalan-soin", name: "Catalan Soin", city: "Perpignan", industry: "Santé", tag: "Saison, ratio d’été écrit.", about: "Soin 66.", metier: "soin" },
  { slug: "rhone-toits", name: "Rhône Toits", city: "Avignon", industry: "Bâtiment", tag: "Tuiles, chaleur.", about: "Couverture 84.", metier: "couvreur" },
  { slug: "finistere-soin", name: "Iroise Soin", city: "Brest", industry: "Santé", tag: "Garde partenaire.", about: "Domicile 29.", metier: "aide", pool: "rsa", barriers: ["garde", "mobilite"], tryBuy: true },
  { slug: "var-toits", name: "Var Toits", city: "Toulon", industry: "Bâtiment", tag: "Zinc et vent.", about: "Couverture 83.", metier: "couvreur", second: "reprise", pool: "reprise" },
  { slug: "isere-hauteur", name: "Isère Hauteur", city: "Grenoble", industry: "Bâtiment", tag: "Ancrage avant planning.", about: "Toitures 38.", metier: "couvreur" },
  { slug: "annecy-zinc", name: "Annecy Zinc", city: "Annecy", industry: "Bâtiment", tag: "Transfrontalier possible.", about: "Zinguerie 74.", metier: "couvreur", pool: "slasher" },
  { slug: "bearn-toits", name: "Béarn Toits", city: "Pau", industry: "Bâtiment", tag: "Ardoise, pluie payée.", about: "Couverture 64.", metier: "couvreur", second: "reprise" },
  { slug: "marne-voirie", name: "Marne Voirie", city: "Reims", industry: "Bâtiment", tag: "Nuits majorées.", about: "Voirie 51.", metier: "route", pool: "rsa", barriers: ["equipement", "horaires", "mobilite"], tryBuy: true },
  { slug: "loiret-voirie", name: "Loiret Voirie", city: "Orléans", industry: "Bâtiment", tag: "Planning 4 semaines.", about: "Voirie 45.", metier: "route" },
  { slug: "sarthe-enrobe", name: "Sarthe Enrobé", city: "Le Mans", industry: "Bâtiment", tag: "Nuit écrite.", about: "Voirie 72.", metier: "route" },
  { slug: "calais-levier", name: "Calais Levier", city: "Calais", industry: "Logistique", tag: "Try & Buy payé.", about: "Quai et préparation. Freins cochés.", metier: "maintenance", pool: "rsa", barriers: ["mobilite", "equipement", "numerique", "logement"], tryBuy: true },
  { slug: "plaine-levier", name: "Plaine Levier", city: "Saint-Denis", industry: "Logistique", tag: "93, pas un slogan insertion.", about: "Quai 93. Navette et chèque chaussures.", metier: "route", pool: "rsa", barriers: ["mobilite", "equipement", "garde"], tryBuy: true },
  { slug: "oise-levier", name: "Oise Levier", city: "Beauvais", industry: "Logistique", tag: "Aéroport, immersion payée.", about: "Préparation 60.", metier: "route", pool: "rsa", barriers: ["mobilite", "horaires"], tryBuy: true },
  { slug: "rhin-levier", name: "Rhin Levier", city: "Mulhouse", industry: "Industrie", tag: "Transfrontalier, RSA.", about: "Atelier 68. Try & Buy.", metier: "maintenance", pool: "rsa", barriers: ["mobilite", "equipement"], tryBuy: true },
  { slug: "agen-reprise", name: "Agen Atelier", city: "Agen", industry: "Bâtiment", tag: "Cédant 62 ans.", about: "Plomberie 47, parcours 18 mois.", metier: "reprise", second: "plomb", pool: "reprise" },
  { slug: "aveyron-reprise", name: "Aveyron Geste", city: "Rodez", industry: "Industrie", tag: "Chiffre réel.", about: "Atelier 12. Reprise tutorée.", metier: "reprise", second: "maintenance", pool: "reprise" },
  { slug: "creuse-reprise", name: "Creuse Atelier", city: "Guéret", industry: "Bâtiment", tag: "Bassin étroit, honnête.", about: "Couverture 23.", metier: "reprise", second: "couvreur", pool: "reprise" },
  { slug: "cantal-reprise", name: "Cantal Chaud", city: "Aurillac", industry: "Bâtiment", tag: "PAC de montagne.", about: "Chauffage 15.", metier: "reprise", second: "plomb", pool: "reprise" },
  { slug: "gironde-slash", name: "Gironde Slash", city: "Bordeaux", industry: "Énergie", tag: "Mi-temps + auto-entreprise.", about: "Élec 33, jeudi-vendredi indépendant OK.", metier: "elec", pool: "slasher" },
  { slug: "nantes-slash", name: "Nantes Slash", city: "Nantes", industry: "Bâtiment", tag: "Planning tenu.", about: "Plomberie 44, jours écrits.", metier: "plomb", pool: "slasher" },
  { slug: "lille-slash", name: "Lille Slash", city: "Lille", industry: "Industrie", tag: "3 j salarié, 2 j AE.", about: "Maintenance 59.", metier: "maintenance", pool: "slasher" },
  { slug: "paris-fractional", name: "Seine Fractional", city: "Paris", industry: "Industrie", tag: "Créneaux IDF.", about: "Seniors 4–12 h, multi-maisons.", metier: "fractional", slots: true, pool: "senior-fractional" },
  { slug: "marseille-fractional", name: "Fos Fractional", city: "Fos-sur-Mer", industry: "Industrie", tag: "Mardi Fos.", about: "Créneau Relève-compatible.", metier: "fractional", slots: true, pool: "senior-fractional" },
  { slug: "cherbourg-nucl", name: "Cotentin Atome", city: "Cherbourg-en-Cotentin", industry: "Énergie", tag: "Flamanville, pas un slide.", about: "Habilitation, astreinte 1/6.", metier: "nucl" },
  { slug: "albi-toits", name: "Albi Toits", city: "Albi", industry: "Bâtiment", tag: "Tuile, chaleur.", about: "Couverture 81.", metier: "couvreur" },
  { slug: "quimper-naval", name: "Cornouaille Naval", city: "Quimper", industry: "Industrie", tag: "Naval, graisse.", about: "Maintenance 29.", metier: "maintenance", second: "elec" },
  { slug: "bayonne-pac", name: "Adour PAC", city: "Bayonne", industry: "Bâtiment", tag: "Littoral, humidité.", about: "PAC 64.", metier: "plomb" },
  { slug: "troyes-log", name: "Aube Log", city: "Troyes", industry: "Logistique", tag: "Quai, planning.", about: "Préparation 10.", metier: "route", pool: "rsa", barriers: ["equipement", "horaires"], tryBuy: true },
  { slug: "strasbourg-fils", name: "Rhin Fils", city: "Strasbourg", industry: "Énergie", tag: "Transfrontalier, allemand de consigne.", about: "Élec tertiaire 67. Habilitation maison.", metier: "elec", second: "fractional", slots: true, pool: "senior-fractional" },
  { slug: "nancy-rondes", name: "Meurthe Rondes", city: "Nancy", industry: "Industrie", tag: "Atelier, pas pool.", about: "Maintenance 54. Binôme junior.", metier: "maintenance", second: "binome" },
  { slug: "poitiers-pac", name: "Vienne PAC", city: "Poitiers", industry: "Bâtiment", tag: "Mesurer avant de tourner.", about: "Chauffage 86.", metier: "plomb", pool: "slasher" },
  { slug: "larochelle-naval", name: "Aunis Naval", city: "La Rochelle", industry: "Industrie", tag: "Naval, graisse, pacte.", about: "Maintenance 17. Astreinte 1/6.", metier: "maintenance", second: "elec" },
  { slug: "lorient-naval", name: "Scorff Naval", city: "Lorient", industry: "Industrie", tag: "Base, pas slide.", about: "Maintenance 56.", metier: "maintenance", pool: "rsa", barriers: ["mobilite", "equipement"], tryBuy: true },
  { slug: "chartres-levier", name: "Eure Levier", city: "Chartres", industry: "Logistique", tag: "Try & Buy, navette.", about: "Quai 28. Chèque chaussures J1.", metier: "route", pool: "rsa", barriers: ["mobilite", "equipement", "numerique"], tryBuy: true },
  { slug: "bourges-voirie", name: "Berry Voirie", city: "Bourges", industry: "Bâtiment", tag: "Nuits majorées.", about: "Voirie 18.", metier: "route" },
  { slug: "niort-soin", name: "Sèvre Soin", city: "Niort", industry: "Santé", tag: "Garde partenaire.", about: "Domicile 79. Plafond 5.", metier: "aide", pool: "rsa", barriers: ["garde", "mobilite"], tryBuy: true },
  { slug: "tarbes-toits", name: "Bigorre Toits", city: "Tarbes", industry: "Bâtiment", tag: "Ardoise, pluie payée.", about: "Couverture 65.", metier: "couvreur", second: "reprise" },
  { slug: "ajaccio-soin", name: "Liamone Soin", city: "Ajaccio", industry: "Santé", tag: "Île, ratio d’été écrit.", about: "Soin 2A. Logement transitoire saison.", metier: "soin", pool: "rsa", barriers: ["logement", "garde"], tryBuy: true },
  { slug: "colmar-fils", name: "Ill Fils", city: "Colmar", industry: "Énergie", tag: "Vignoble, PV et tertiaire.", about: "Élec 68.", metier: "elec" },
  { slug: "besancon-rondes", name: "Doubs Rondes", city: "Besançon", industry: "Industrie", tag: "Horloger, consignation.", about: "Maintenance 25. Fractional mercredi.", metier: "maintenance", second: "fractional", slots: true, pool: "senior-fractional" },
];

function jobOf(house: Row, key: MetierKey, i: number): SeedJob {
  const m = METIER[key];
  const pool = i === 0 ? house.pool : key === "fractional" ? "senior-fractional" : key === "binome" ? "binome" : key === "reprise" ? "reprise" : undefined;
  const slug = slugify(`${m.title}-${house.city}-${house.slug}-${i}`) || `${house.slug}-poste-${i}`;
  return {
    companySlug: house.slug,
    slug,
    title: `${m.title} · ${house.city}`,
    team: m.team,
    city: house.city,
    country: "France",
    remoteType: "onsite",
    contract: "cdi",
    seniority: m.seniority,
    salaryMin: m.salary[0],
    salaryMax: m.salary[1],
    equity: false,
    description: `${m.title} chez ${house.name}, ${house.city}. ${house.about} ${m.blurb} Salaire publié ${m.salary[0]}–${m.salary[1]} €. Épreuve métier dans l’offre, pacte visible. ${house.tryBuy ? "Try & Buy 5 jours payés, freins cochés J1." : house.slots ? "Créneaux weekday : une maison par jour." : "Pas un pool jetable."}`,
    responsibilities: m.resp,
    requirements: m.req,
    nice: [],
    benefits: m.benefits,
    skills: m.skills,
    daysAgo: 2 + ((house.slug.length + i) % 18),
    applicants: 3 + ((house.name.length + i) % 14),
    views: 40 + ((house.slug.length * 7 + i) % 200),
    ghostRisk: "low",
    collection: m.collection,
    pool,
    barriers: i === 0 ? house.barriers : undefined,
    tryBuy: i === 0 && house.tryBuy
      ? { days: 5, dailyPay: 85, supervisor: "Référent terrain nommé", startNote: "J1 : chèque équipement, planning, qui encadre." }
      : undefined,
    slots: house.slots || key === "fractional"
      ? [
          { weekday: 2, startHour: 8, hours: 8, city: house.city, seats: 1 },
          { weekday: 4, startHour: 8, hours: 8, city: house.city, seats: 1 },
        ]
      : undefined,
  };
}

export const VOLUME_COMPANIES: SeedCompany[] = ROWS.map((r) => ({
  slug: r.slug,
  name: r.name,
  tagline: r.tag,
  about: r.about,
  industry: r.industry,
  sizeBand: "12–80",
  hqCity: r.city,
  hqCountry: "France",
  website: `https://${r.slug}.example`,
  foundedYear: 1994 + (r.slug.length % 25),
  cultureScore: 74 + (r.slug.length % 16),
  hiringVelocity: "steady",
  values: ["Salaire publié", "Pacte", r.tag],
}));

export const VOLUME_JOBS: SeedJob[] = ROWS.flatMap((r) => {
  const keys: MetierKey[] = [r.metier];
  if (r.second) keys.push(r.second);
  return keys.map((k, i) => jobOf(r, k, i));
});

export const VOLUME_PACT: Record<string, { slaDays: number; honorScore: number; honorAnswered: number; honorDue: number }> =
  Object.fromEntries(
    ROWS.map((r) => {
      const due = 8 + (r.slug.length % 20);
      const answered = Math.max(4, due - (r.slug.length % 4));
      const honorScore = Math.round((answered / due) * 100);
      return [r.slug, { slaDays: 7 + (r.slug.length % 5), honorScore, honorAnswered: answered, honorDue: due }];
    }),
  );
