import { slugify } from "./format";

export type SemCity = {
  slug: string;
  name: string;
  country: string;
  title: string;
  description: string;
  intro: string[];
  faqs: { q: string; a: string }[];
};

export type SemMetier = {
  slug: string;
  name: string;
  title: string;
  description: string;
  match: (title: string, skills: string[], collection: string | null) => boolean;
  intro: string[];
  faqs: { q: string; a: string }[];
  family: string;
};

export const SEM_CITIES: SemCity[] = [
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    title: "Emplois à Paris — salaires publiés, pacte de réponse | Vera",
    description:
      "Offres CDI, hybride et remote à Paris : salaire affiché, honneur public, grilles d’évaluation. Pas de selon profil. Jobboard Vera 2026.",
    intro: [
      "Paris n’a pas besoin de plus d’annonces. Elle a besoin d’annonces lisibles. Vera n’indexe une offre parisienne que si le salaire est public, le process nommé, et le pacte de réponse daté.",
      "Climat (Lumina), fintech (Helios), luxe (Maison Vale), design. Les ghost jobs du 8e restent sur LinkedIn.",
    ],
    faqs: [
      {
        q: "Quel salaire médian à Paris sur Vera ?",
        a: "Chaque fiche publie min/max et la médiane de marché. Pas de fourchette « selon profil ». Les rôles staff et lead tirent la médiane vers le haut.",
      },
      {
        q: "Les offres Paris sont-elles vraiment à Paris ?",
        a: "Hybride = jours de présence écrits. Remote déguisé en open space à 9h n’entre pas. Le champ remote_type est dans le Schema JobPosting.",
      },
    ],
  },
  {
    slug: "lyon",
    name: "Lyon",
    country: "France",
    title: "Emplois à Lyon — santé, soin, produit | Vera",
    description:
      "Offres Lyon : Mireille (hôpital), Maison Lise (aide à domicile). Salaires publiés, tournées tenables, pacte de réponse.",
    intro: [
      "Lyon, sur Vera, ce n’est pas « la tech qui débarque ». C’est le soin qui refuse de brûler les gens : plafond de tournée, un jour de service pour les infirmiers produit, supervision payée.",
      "Les fiches Pôle emploi à 12 personnes par jour n’ont pas d’URL ici.",
    ],
    faqs: [
      {
        q: "Peut-on trouver une auxiliaire de vie à Lyon sans se faire brûler ?",
        a: "Oui si l’entreprise plafonne. Maison Lise : 5 personnes/jour, trajets payés, 13e mois. La grille soin est publique.",
      },
    ],
  },
  {
    slug: "marseille",
    name: "Marseille",
    country: "France",
    title: "Emplois à Marseille — solaire, chantier, habilitations | Vera",
    description:
      "Offres Marseille et PACA : électricien ombrières, chef de projet solaire. Prime chaleur écrite, B2V payé. Vera.",
    intro: [
      "Marseille n’est pas un « hub climat » en slide. C’est un parking qui devient une ombrière, 38 °C en août, stop à 13 h — écrit chez Kora.",
      "Les habilitations sont un critère de grille, pas une ligne « à passer » oubliée.",
    ],
    faqs: [
      {
        q: "Les chantiers ENR à Marseille paient-ils la chaleur ?",
        a: "Kora : 200 € bruts/mois juin–septembre, véhicule, B2V/BR pris en charge. Vera refuse les primes « selon profil ».",
      },
    ],
  },
  {
    slug: "fos-sur-mer",
    name: "Fos-sur-Mer",
    country: "France",
    title: "Emplois à Fos-sur-Mer — maintenance industrielle | Vera",
    description:
      "Technicien de maintenance Fos / PACA : consignation, CACES, astreinte écrite, salaire au-dessus du P50. Relève sur Vera.",
    intro: [
      "Fos n’a pas d’open space. Relève tient trois sites, un parc d’outils neuf, une astreinte 1/6 majorée 100 %. Le Talent Scarcity Score y est en pénurie : peu de CV tenables, beaucoup de vues.",
      "La grille terrain demande les habilitations avec dates, pas « polyvalent et motivé ».",
    ],
    faqs: [
      {
        q: "Salaire technicien maintenance Fos-sur-Mer ?",
        a: "Relève publie 34–40 k€, prime bruit 180 €, formation 1 800 €/an. Médiane PACA affichée sur la fiche. Sous le P25, Vera le dit en rouge.",
      },
    ],
  },
  {
    slug: "toulouse",
    name: "Toulouse",
    country: "France",
    title: "Emplois à Toulouse — aérospatial, embarqué, GNC | Vera",
    description:
      "Offres Toulouse : guidage, qualité logiciel, tech lead embarqué chez Orbital. Process publié, habilitation, cantine 19 h.",
    intro: [
      "Toulouse sur Vera, c’est Orbital : lois de guidage, revues, pas de « space enthusiast ». L’anglais de revue est un critère. Le scarcity score GNC est haut.",
    ],
    faqs: [
      {
        q: "Les postes aéro à Toulouse sont-ils accessibles junior ?",
        a: "Alternance qualité logiciel, encadrement nommé. Pas un stagiaire qui forme le suivant. Grille staff/lead pour les autres rôles.",
      },
    ],
  },
  {
    slug: "lisbonne",
    name: "Lisbonne",
    country: "Portugal",
    title: "Emplois remote Europe depuis Lisbonne | Vera",
    description:
      "Sable, runtime, frontend, security. Remote fuseau ±2 h, mercredi mort, 20 % OSS. Salaires publiés.",
    intro: [
      "Lisbonne est un fuseau, pas un siège. Sable n’oblige personne à l’open space. L’écriture (RFC) est le management. Score interculturel 91.",
    ],
    faqs: [
      {
        q: "Faut-il parler portugais ?",
        a: "Non. Anglais d’arbitrage, français bienvenu. La grille tech note la langue de RFC, pas le café.",
      },
    ],
  },
  {
    slug: "amsterdam",
    name: "Amsterdam",
    country: "Pays-Bas",
    title: "Emplois à Amsterdam — logistique, corridor Asie | Vera",
    description:
      "Northline : operations research, product ops, business developer Asie. Mandarin de négo, visa NL, pacte 10 jours.",
    intro: [
      "Amsterdam, ici, ce n’est pas un campus. C’est le fret multimodal et un corridor Asie–Europe. Le BD Asie a une grille guanxi, pas un afterwork.",
    ],
    faqs: [
      {
        q: "Le business developer Asie à Amsterdam exige-t-il le mandarin ?",
        a: "Oui, de négociation (HSK 5 min. ou natif). La grille publique le pèse à 24. « Notions » = 0 point.",
      },
    ],
  },
  {
    slug: "copenhague",
    name: "Copenhague",
    country: "Danemark",
    title: "Emplois à Copenhague — design système, critique | Vera",
    description:
      "Atelier Nord : designer système, stage produit. 37 h, 32 h en août, critique quotidienne. Honneur 98.",
    intro: [
      "Copenhague pense à voix haute. Un profil français de non-dits souffre huit jours, puis s’en souvient. Score interculturel 86. Pacte 7 jours.",
    ],
    faqs: [
      {
        q: "Faut-il le danois ?",
        a: "Anglais courant exigé, danois un plus. La critique quotidienne n’est pas optionnelle.",
      },
    ],
  },
  {
    slug: "bruxelles",
    name: "Bruxelles",
    country: "Belgique",
    title: "Emplois à Bruxelles — médias, data, gel signalé | Vera",
    description:
      "Relais : journaliste data, développeur éditorial. Honneur 44 — Vera signale le gel. On ne vous laisse pas candidater à un fantôme.",
    intro: [
      "Bruxelles a une rédaction qui paie — quand elle embauche. Relais a gelé. Les fiches restent en ligne pour que vous ne perdiez pas trois tours. C’est le produit.",
    ],
    faqs: [
      {
        q: "Dois-je postuler chez Relais ?",
        a: "Non. Verdict Passez, pacte rompu, ghost probable. Vera le met en tête pour que vous partiez.",
      },
    ],
  },
  {
    slug: "londres",
    name: "Londres",
    country: "Royaume-Uni",
    title: "Emplois à Londres / remote UK — conformité, AML | Vera",
    description:
      "Helios : freelance AML, TJM publié 700–900 €. Remote, quelques jours Paris. Pacte écrit.",
    intro: [
      "Londres sur Vera, c’est surtout de la conformité qui se facture au vrai TJM. Pas un « competitive package ».",
    ],
    faqs: [
      {
        q: "Le TJM freelance est-il vraiment publié ?",
        a: "Oui. 152–196 k€ annualisés, annoncé, pas selon profil. Facturation 30 jours.",
      },
    ],
  },
];

export const SEM_METIERS: SemMetier[] = [
  {
    slug: "technicien-de-maintenance",
    name: "Technicien de maintenance",
    title: "Technicien de maintenance — offres 2026, salaire, habilitations | Vera",
    description:
      "Fiches technicien maintenance industrielle : salaire vs médiane PACA, CACES, consignation, astreinte écrite, épreuve machine. Relève et pairs.",
    family: "terrain",
    match: (t, s) =>
      t.includes("maintenance") || s.some((x) => /caces|hydraulique|consignation/i.test(x)),
    intro: [
      "Le mot « technicien de maintenance » sur Indeed ramène 4 000 fiches à 28 k€ selon profil. Sur Vera : une échelle de marché, une carte de carrière (chef d’équipe en 3–6 ans), une épreuve presse, une grille habilitations.",
      "Pénurie réelle à Fos. Les entreprises qui paient sous le P25 restent vides — et le Scarcity Score le dit.",
    ],
    faqs: [
      {
        q: "Quel salaire pour un technicien de maintenance en PACA ?",
        a: "Observatoire Vera : P50 autour de 34,5 k€. Relève publie 34–40 k€ + prime bruit. Sous le P25, l’offre est marquée en dessous du marché.",
      },
      {
        q: "Faut-il déjà le CACES ?",
        a: "Relève : CACES 3 ou à passer sous 90 jours, pris en charge. La grille demande les dates, pas un « à voir ».",
      },
    ],
  },
  {
    slug: "electricien",
    name: "Électricien",
    title: "Électricien chantier / ombrières — offres, B2V, salaire | Vera",
    description:
      "Électricien Marseille et PACA : ombrières solaires, B2V/BR payé, prime chaleur, diagnostic de schéma dans l’offre.",
    family: "terrain",
    match: (t, s) => t.includes("électric") || t.includes("electric") || s.some((x) => /onduleur|habilitation/i.test(x)),
    intro: [
      "Un électricien ne candidate pas sur un paragraphe RH. Il veut le matériel, l’habilitation, la chaleur écrite. Kora met le schéma dans la page.",
    ],
    faqs: [
      {
        q: "Les habilitations sont-elles payées ?",
        a: "Chez Kora : B2V, BR, hauteur, renouvellement, temps de travail. C’est dans les contreparties concrètes, pas dans « formation ».",
      },
    ],
  },
  {
    slug: "auxiliaire-de-vie",
    name: "Auxiliaire de vie",
    title: "Auxiliaire de vie à domicile — tournée tenable, salaire Lyon | Vera",
    description:
      "Aide à domicile Lyon : 5 personnes/jour, trajets payés, 13e mois. Scénario de soin dans l’offre. Maison Lise.",
    family: "soin",
    match: (t) => t.includes("auxiliaire") || t.includes("domicile") || t.includes("aide"),
    intro: [
      "Le métier est abondant sur les CV, rare en tournées tenables. Vera n’indexe pas les plans à 9 personnes. Lise plafonne à 5 et le dit dans la grille.",
    ],
    faqs: [
      {
        q: "Combien gagne une auxiliaire de vie à Lyon sur Vera ?",
        a: "26–30 k€ + 13e mois chez Lise, au-dessus de la médiane locale. Trajets payés. Mutuelle 80 % famille.",
      },
    ],
  },
  {
    slug: "business-developer-asie",
    name: "Business developer Asie",
    title: "Business developer Asie — mandarin, guanxi, offres 2026 | Vera",
    description:
      "BD Asie / corridor Europe : grille mandarin de négo, guanxi nommé, face, fuseau. Northline Amsterdam. Pénurie réelle.",
    family: "asie",
    match: (t, s) => t.includes("asie") || s.some((x) => /mandarin|guanxi/i.test(x)),
    intro: [
      "« 10 ans en Asie » ne veut rien dire. Vera pèse le mandarin de négociation (24), trois portes guanxi (22), le style quand le yes veut dire j’ai entendu (18). Les ATS cachent ça. La grille est dans la page, indexée.",
    ],
    faqs: [
      {
        q: "HSK 3 suffit-il ?",
        a: "Non. HSK 3 = social, score faible. Négo simple (HSK 5) ou natif. C’est écrit, public, Schema FAQ.",
      },
    ],
  },
  {
    slug: "product-designer",
    name: "Product designer",
    title: "Product designer — outils métier, salaires publiés | Vera",
    description:
      "Offres product designer Paris, Copenhague, hybride. Systèmes, pas Dribbble. Grille design publique. Vera.",
    family: "design",
    match: (t, s, c) => t.includes("design") || c === "design" || s.some((x) => /figma|typographie/i.test(x)),
    intro: [
      "Vera n’indexe pas les « UI/UX unicorns ». Un système en production, une critique, un salaire. Atelier Nord, Lumina, Helios.",
    ],
    faqs: [
      {
        q: "Remote designer Europe ?",
        a: "Atelier Nord : hybride Copenhague + une semaine Paris. Relogement d’essai. La grille design pèse la typographie réelle.",
      },
    ],
  },
  {
    slug: "staff-engineer",
    name: "Staff engineer",
    title: "Staff / lead engineer remote Europe — salaires, OSS | Vera",
    description:
      "Staff backend Go/Kafka, tech lead embarqué. Remote ±2 h, honneur 97, 20 % OSS. Scarcity haut.",
    family: "staff",
    match: (t, s, c) =>
      t.includes("staff") || t.includes("lead") || c === "staff" || s.some((x) => /kafka|embarqué|rtos/i.test(x)),
    intro: [
      "Un staff Vera rend un runtime ennuyeux. Pas un titre. Sable 90–120 k€, process 7 jours, mercredi mort. Orbital pour l’embarqué critique.",
    ],
    faqs: [
      {
        q: "Le 20 % open source est-il réel ?",
        a: "Sable : inscrit, pas un slogan. La grille staff pèse l’écriture d’arbitrage, pas le nombre de talks.",
      },
    ],
  },
  {
    slug: "data-scientist",
    name: "Data scientist",
    title: "Data scientist climat / clinique — offres à salaire publié | Vera",
    description:
      "Data climat Lumina, stage data Mireille, OR Northline. Incertitude documentée, pas un Kaggle.",
    family: "tech",
    match: (t, s) => t.includes("data") || s.some((x) => /python|postgis|sql|statistique/i.test(x)),
    intro: [
      "Les data scientists que Vera indexe documentent l’incertitude. Un modèle qui ignore le réel ne passe pas la revue — Lumina, Northline.",
    ],
    faqs: [
      {
        q: "Y a-t-il des stages data sérieux ?",
        a: "Mireille : six mois, encadrement réel, gratification haute fourchette. Collection Premier poste.",
      },
    ],
  },
  {
    slug: "chef-de-projet-solaire",
    name: "Chef de projet solaire",
    title: "Chef de projet solaire / ENR — chantiers, collectivités | Vera",
    description:
      "Chef de projet ombrières Marseille : 4–6 chantiers, permis, mairie. Prime chaleur, véhicule. Kora.",
    family: "terrain",
    match: (t) => t.includes("chef de projet") || t.includes("solaire"),
    intro: [
      "Le closer ENR qui vit au mois n’y survit pas. Cycle 6–18 mois, reports dits le jour même. Grille commercial + terrain.",
    ],
    faqs: [
      {
        q: "Permis B obligatoire ?",
        a: "Oui, chantier. Véhicule de fonction. Occitan facultatif.",
      },
    ],
  },
  {
    slug: "infirmier",
    name: "Infirmier·ère",
    title: "Infirmier produit / clinique — offres Lyon | Vera",
    description:
      "Infirmier·ère produit Mireille : 1 jour de service, 42–52 k€, primes dimanche. Pas un poste ambassadeur.",
    family: "soin",
    match: (t) => t.includes("infirm"),
    intro: [
      "Vous quittez une partie du soin. Mireille le dit dans le difficile. Un jour par semaine en service, non négociable.",
    ],
    faqs: [
      {
        q: "C’est un poste marketing santé ?",
        a: "Non. Observation de service, écriture de parcours, formation référents. La grille soin copie l’épreuve.",
      },
    ],
  },
  {
    slug: "risk-analyste",
    name: "Risk / conformité",
    title: "Risk analyst & AML — offres finance à TJM / salaire publié | Vera",
    description:
      "Helios : risk analyst, freelance AML. Règles de crédit, ACPR, TJM 700–900 €. Bonus écrits.",
    family: "finance",
    match: (t, s, c) => t.includes("risk") || t.includes("aml") || c === "finance" || s.some((x) => /aml|crédit|fraude/i.test(x)),
    intro: [
      "Moins de scoring magique, plus de cas. Helios publie le taux d’erreur en interne. La grille finance demande des revues ACPR, pas un « appetite for risk ».",
    ],
    faqs: [
      {
        q: "Freelance AML : le TJM est-il négociable dans le flou ?",
        a: "Non. Publié. 30 jours. Quelques jours Paris, remote le reste.",
      },
    ],
  },
];

export function citySlug(name: string): string {
  return slugify(name);
}

export function cityOfSlug(slug: string): SemCity | undefined {
  return SEM_CITIES.find((c) => c.slug === slug);
}

export function metierOfSlug(slug: string): SemMetier | undefined {
  return SEM_METIERS.find((m) => m.slug === slug);
}

export function metierForJob(
  title: string,
  skills: string[],
  collection: string | null,
): SemMetier | undefined {
  const t = title.toLowerCase();
  return SEM_METIERS.find((m) => m.match(t, skills, collection));
}
