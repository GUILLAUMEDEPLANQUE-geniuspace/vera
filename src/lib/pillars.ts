export type RankedRole = {
  rank: number;
  title: string;
  why: string;
  family: string;
  jobSlug?: string;
  metierSlug?: string;
  citySlug?: string;
  companySlug?: string;
};

export type Pillar = {
  slug: string;
  title: string;
  kicker: string;
  excerpt: string;
  updated: string;
  relatedJobs: string[];
  relatedCompanies: string[];
  sections: { h: string; p: string[] }[];
  ranking?: RankedRole[];
};

export const HARD_COMMERCIAL_2026: RankedRole[] = [
  {
    rank: 1,
    title: "Business developer Asie — mandarin de négociation",
    why: "HSK cocktail ne suffit plus. Il faut trois portes guanxi nommées, un yes qui veut dire j’ai entendu, et le fuseau CET–SGT tenu. Northline ouvre le corridor. La grille publique pèse le mandarin à 24.",
    family: "asie",
    jobSlug: "business-developer-asie-northline",
    metierSlug: "business-developer-asie",
    citySlug: "amsterdam",
    companySlug: "northline",
  },
  {
    rank: 2,
    title: "Account public / B2G climat",
    why: "Quelqu’un qui a déjà perdu un appel d’offres et sait pourquoi. Cycle 9–18 mois. Lumina ne veut pas un closer inbound. Les élus tranchent plus que le N+1.",
    family: "commercial",
    jobSlug: "account-public-lumina",
    citySlug: "paris",
    companySlug: "lumina",
  },
  {
    rank: 3,
    title: "Closer ENR collectivités",
    why: "Vendre une ombrière à une mairie n’est pas un ARR. Permis, riverains, août à 38 °C. Kora le dit dans le difficile. Un quota mensuel tue le poste.",
    family: "commercial",
    jobSlug: "alternance-commercial-kora",
    metierSlug: "chef-de-projet-solaire",
    citySlug: "marseille",
    companySlug: "kora",
  },
  {
    rank: 4,
    title: "KAM hospitalier — DSI de CHU",
    why: "Le cycle est clinique, pas SaaS. Un soignant nommé dans la room, FHIR, marchés publics de santé. Le vivier tient dans une salle.",
    family: "commercial",
    companySlug: "mireille",
    citySlug: "lyon",
  },
  {
    rank: 5,
    title: "Commercial défense — habilitation secret",
    why: "Le délai d’habilitation filtre plus que le salaire. On ne poste pas ça sur LinkedIn. Vera indexe le process, pas le secret.",
    family: "commercial",
  },
  {
    rank: 6,
    title: "Sales engineer embarqué / GNC",
    why: "Il faut parler lois de guidage sans slide. Toulouse, anglais de revue, rareté GNC. Orbital n’embauche pas des « space enthusiasts ».",
    family: "staff",
    metierSlug: "staff-engineer",
    citySlug: "toulouse",
    companySlug: "orbital",
  },
  {
    rank: 7,
    title: "Head of partnerships climat",
    why: "Métropoles, syndicats d’énergie, pas un listing d’intégrateurs. Le réseau est nommé ou il n’existe pas.",
    family: "commercial",
    companySlug: "lumina",
    citySlug: "paris",
  },
  {
    rank: 8,
    title: "Revenue / sales AML fintech",
    why: "Vendre de la conformité à des banques. ACPR, FCA, pas un pitch growth. Helios publie le TJM freelance — le CDI aussi doit le faire.",
    family: "finance",
    metierSlug: "risk-analyste",
    companySlug: "helios",
    citySlug: "paris",
  },
  {
    rank: 9,
    title: "Export Maghreb–Afrique industrie",
    why: "Darija ou arabe de chantier, consignation, pièces. Relève forme. Les entreprises qui cherchent « Afrique » sans langue restent vides.",
    family: "terrain",
    companySlug: "releve",
    citySlug: "fos-sur-mer",
  },
  {
    rank: 10,
    title: "Directeur commercial PMI industrielle",
    why: "Un carnet, pas un CRM théâtre. 40–80 personnes, le directeur vend encore. Salaire publié ou ce n’est pas Vera.",
    family: "commercial",
  },
  {
    rank: 11,
    title: "Commercial nucléaire / grand carénage",
    why: "Habilitations, sites, calendrier EDF. Le vivier a 50 ans. On ne le trouve pas avec un ATS.",
    family: "commercial",
  },
  {
    rank: 12,
    title: "SDR mandarin — inbound corridor Asie",
    why: "Le premier filtre vocal. HSK 5 min. Un SDR français « notions » brûle les leads. Grille asie, poids langue.",
    family: "asie",
    metierSlug: "business-developer-asie",
  },
  {
    rank: 13,
    title: "Partnerships logistique portuaire",
    why: "Rotterdam, Anvers, Fos. Grèves et marées battent le stand-up. Northline recrute des ops qui vendent.",
    family: "commercial",
    companySlug: "northline",
    citySlug: "amsterdam",
  },
  {
    rank: 14,
    title: "Sales public health / dossier patient",
    why: "FHIR, HL7, CNIL, un médecin qui dit non. Mireille connaît le tempo. Un AE SaaS US se casse les dents.",
    family: "commercial",
    companySlug: "mireille",
    citySlug: "lyon",
  },
  {
    rank: 15,
    title: "Channel manager DACH",
    why: "Allemand de négo, pas un anglais de salon. Le silence germanique n’est pas un maybe. Score interculturel exigé.",
    family: "commercial",
  },
  {
    rank: 16,
    title: "Enterprise AE cloud souverain",
    why: "SecNumCloud, ministères, 18 mois. Le closer US qui parle ARR se tait. La grille demande une perte racontée.",
    family: "commercial",
  },
  {
    rank: 17,
    title: "Commercial agro — coopératives",
    why: "Saison, CA, conseil d’administration. Pas un sequence Lemlist. On embauche ceux qui ont déjà attendu une AG.",
    family: "commercial",
  },
  {
    rank: 18,
    title: "KAM grande distribution alimentaire",
    why: "Référencement, marges, centrales. Un quota inbound n’y survit pas. Cycle long, face à tenir.",
    family: "commercial",
  },
  {
    rank: 19,
    title: "Business developer Golfe / Qatar",
    why: "Face, intermédiaire, ramadan, anglais de contrat. Adjacent à l’Asie. Les entreprises le postent « international » et collectent du bruit.",
    family: "asie",
  },
  {
    rank: 20,
    title: "Commercial habilitations B2V / CACES",
    why: "Vendre de la formation à des ateliers qui n’ont plus de monde. Kora Académie ouvre des places. Le vendeur doit avoir monté sur un toit.",
    family: "terrain",
    companySlug: "kora",
    citySlug: "marseille",
  },
  {
    rank: 21,
    title: "Account energy trading",
    why: "Desks, anglais, risque écrit. Helios-adjacent. Le théâtre « appetite for risk » est un critère à zéro.",
    family: "finance",
    companySlug: "helios",
  },
  {
    rank: 22,
    title: "Partnerships open source",
    why: "20 % OSS chez Sable : pas un slogan. Le partenaire est un maintainer, pas un logo. Écriture d’arbitrage.",
    family: "staff",
    companySlug: "sable",
    citySlug: "lisbonne",
    metierSlug: "staff-engineer",
  },
  {
    rank: 23,
    title: "Commercial luxe Asie — entreprise familiale",
    why: "Vale : matière, saison, pas radical candor. Un profil anglo-saxon se casse les dents. Italien de l’entreprise, mandarin de salon — deux métiers.",
    family: "asie",
    companySlug: "maison-vale",
    citySlug: "paris",
  },
  {
    rank: 24,
    title: "Inside sales destiné aux soignants",
    why: "Vendre un outil à des infirmiers qui n’ont pas le temps. Un jour de service, ou c’est du marketing santé. Mireille refuse l’ambassadeur.",
    family: "soin",
    metierSlug: "infirmier",
    companySlug: "mireille",
    citySlug: "lyon",
  },
  {
    rank: 25,
    title: "Sales solaire B2B parkings",
    why: "Bailleurs, copropriétés, ombrières. Cousin du closer collectivités, vivier encore plus étroit. Schéma dans la page.",
    family: "commercial",
    metierSlug: "chef-de-projet-solaire",
    citySlug: "marseille",
    companySlug: "kora",
  },
  {
    rank: 26,
    title: "Growth B2G SaaS",
    why: "Le mot growth et le mot B2G se haïssent. Lumina cherche des comptes nommés. Un PLG public est un oxymore — Vera le dit.",
    family: "commercial",
    companySlug: "lumina",
  },
  {
    rank: 27,
    title: "Commercial formation habilitations",
    why: "B2V, BR, CACES : vendre du temps de travail, pas une brochure Qualiopi. Relève et Kora savent. Les autres inventent un e-learning.",
    family: "terrain",
    companySlug: "releve",
  },
  {
    rank: 28,
    title: "Account executive industrie lourde Fos",
    why: "Sites Seveso, consignation, planning 4 semaines. Le commercial dîne avec le chef d’équipe, pas avec un VP. Pénurie locale.",
    family: "terrain",
    citySlug: "fos-sur-mer",
    companySlug: "releve",
    metierSlug: "technicien-de-maintenance",
  },
  {
    rank: 29,
    title: "Head of sales remote Europe",
    why: "Fuseau ±2 h, mercredi mort, RFC. Manager sans open space. Sable n’a pas de titre qui crée l’autorité — l’écriture, si.",
    family: "staff",
    companySlug: "sable",
    citySlug: "lisbonne",
  },
  {
    rank: 30,
    title: "Commercial data clinique",
    why: "Vendre de l’incertitude documentée, pas un Kaggle. CNIL, soignants, entrepôts. Le scarcity FHIR est haut. Le reste est du bruit.",
    family: "tech",
    metierSlug: "data-scientist",
    companySlug: "mireille",
    citySlug: "lyon",
  },
];

export const PILLARS: Pillar[] = [
  {
    slug: "postes-commerciaux-difficiles-2026",
    title: "Les 30 postes commerciaux les plus difficiles à recruter en 2026",
    kicker: "Pénurie réelle, pas un slogan LinkedIn",
    excerpt:
      "B2G, corridor Asie, ENR collectivités : les viviers sont étroits. Classement Vera — grilles publiques, scarcity score, offres liées. Pas un baromètre RH.",
    updated: "2026-08-20",
    relatedJobs: ["business-developer-asie-northline", "account-public-lumina", "alternance-commercial-kora"],
    relatedCompanies: ["northline", "lumina", "kora", "helios"],
    ranking: HARD_COMMERCIAL_2026,
    sections: [
      {
        h: "Ce n’est pas « on peine à recruter »",
        p: [
          "Les directions commerciales répètent la phrase depuis dix ans. En 2026, trois familles sont réellement rares sur Vera : le commercial qui a déjà perdu un marché public, le business developer Asie qui parle mandarin de négo — pas HSK de cocktail — et le closer ENR qui sait tenir une mairie.",
          "Le Talent Scarcity Score le montre sans théâtre. Un Account public Lumina convertit peu de vues en candidatures tenables. Un BD Asie Northline encore moins. Un commercial inbound SaaS, lui, noie la fiche. Traiter les trois avec le même ATS est une faute.",
        ],
      },
      {
        h: "Mandarin, guanxi, face — la grille qui change le sourcing",
        p: [
          "Le CV « 10 ans en Asie » ne veut rien dire. Vera impose une grille publique : niveau de mandarin de négociation, trois portes guanxi nommées, style quand le yes veut dire j’ai entendu, fuseau tenu. Les entreprises qui cachent ces critères collectent du bruit. Celles qui les publient voient arriver moins de dossiers, et les bons.",
          "Northline ouvre le corridor Asie–Europe. Ce n’est pas un afterwork Singapour. C’est un silence japonais, un maybe de Shanghai, un appel à 7 h CET. La page entreprise cartographie ça : score interculturel, langues, axes de culture. Google indexe la fiche. Les agents IA aussi, via le Markdown machine-readable.",
        ],
      },
      {
        h: "B2G et ENR : le cycle long, les pertes",
        p: [
          "Lumina cherche quelqu’un qui a déjà perdu un appel d’offres et qui sait pourquoi. Kora vend du solaire à des villes, pas à des slides. Le cycle fait 6 à 18 mois. Un closer qui vit au mois n’y survit pas. La grille demande des comptes nommés et une perte racontée.",
          "Les 30 postes ci-dessous ne sont pas un clickbait. Ils concentrent la pénurie française 2026 : public, export Asie, industrie de terrain, soin tenu, staff runtime. Le reste est un problème de marque ou de salaire sous médiane — Vera l’affiche.",
        ],
      },
      {
        h: "Comment on a classé",
        p: [
          "Rareté des compétences (mandarin de négo, habilitations, FHIR, GNC), conversion vues → candidatures tenables, géographie onsite, séniorité. Un inbound SaaS parisien n’entre pas. Un AE Fos qui dîne avec le chef d’équipe, si.",
          "Chaque ligne pointe vers une offre, une fiche métier ou une entreprise Vera quand elle existe. Le classement est une page pilier : titre, FAQ, ItemList schema, pas une porte dérobée de mots-clés.",
        ],
      },
    ],
  },
  {
    slug: "metiers-penurie-france-2026",
    title: "Métiers en pénurie en France, 2026 : ce que les données Vera montrent",
    kicker: "Observatoire, pas baromètre RH",
    excerpt:
      "Techniciens habilités, auxiliaires à tournée tenable, GNC, staff backend, BD Asie. La pénurie n’est pas uniforme. Le score de rareté la découpe.",
    updated: "2026-08-18",
    relatedJobs: [
      "technicien-maintenance-releve",
      "electricien-ombrieres-kora",
      "aide-domicile-lise",
      "ingenieur-guidage-orbital",
      "staff-backend-sable",
    ],
    relatedCompanies: ["releve", "kora", "lise", "orbital", "sable"],
    sections: [
      {
        h: "La pénurie a une adresse",
        p: [
          "Fos-sur-Mer, un technicien de maintenance avec CACES et consignation : rareté haute, conversion basse, salaire au-dessus du P50 PACA si l’entreprise n’est pas idiote. Relève paie 34–40 k€, prime bruit écrite, astreinte 1/6. Les fiches « 28 k€ selon profil » restent vides — et Vera les situe sous la médiane, en rouge.",
          "Lyon, auxiliaire de vie : le métier est abondant sur les CV, rare en tournées tenables. Maison Lise plafonne à cinq personnes par jour et paie les trajets. C’est ça la pénurie réelle — pas le volume Pôle emploi.",
        ],
      },
      {
        h: "Hardtech et runtime",
        p: [
          "Un ingénieur guidage à Toulouse, un staff Go/Kafka remote Europe : viviers étroits, anglais d’arbitrage, on-call rare. Orbital et Sable tiennent un honneur haut et un process court. Les entreprises qui ajoutent six tours perdent contre elles, pas contre « le marché ».",
        ],
      },
      {
        h: "Comment lire le Scarcity Score",
        p: [
          "Il combine compétences rares (GNC, FHIR, habilitations, mandarin de négo), séniorité, conversion vues → candidatures, et géographie onsite. Au-dessus de 78 : pénurie. 62–77 : rare. En dessous, vous avez un problème d’offre, pas de sourcing.",
        ],
      },
    ],
  },
  {
    slug: "entretien-interculturel",
    title: "L’entretien interculturel : ce que les entreprises européennes jugent vraiment",
    kicker: "Fit culturel, pas un test de nationalité",
    excerpt:
      "Directness danoise, écriture lisboète, face asiatique, hiérarchie de entreprise de luxe. Vera cartographie cinq axes et fait passer un simulateur avant l’appel.",
    updated: "2026-08-19",
    relatedJobs: ["designer-systeme-atelier-nord", "staff-backend-sable", "business-developer-asie-northline"],
    relatedCompanies: ["atelier-nord", "sable", "northline", "maison-vale"],
    sections: [
      {
        h: "Cinq axes, pas un « cultural fit » flou",
        p: [
          "Parole (harmonie → franc), hiérarchie, tempo, canal (réunion → écrit), risque. Atelier Nord critique tous les jours : un profil français de non-dits souffre huit jours, puis s’en souvient comme d’un luxe. Sable n’existe que par RFC. Vale se casse les dents sur le radical candor anglo-saxon.",
          "Le matching Vera ajoute cet écart au score compétences. Un 92 skills / 40 culture est un « Posez la question », pas un Allez-y. Les entreprises voient le détail. Les candidats aussi — la grille est publique.",
        ],
      },
      {
        h: "Le simulateur",
        p: [
          "Avant l’entretien, trois battements : un non en public, un silence asiatique, un mercredi sans réunion. Feedback immédiat, sans IA qui tourne à vide. L’assistant (Grok) n’intervient que si vous demandez une lettre ou une prep adaptée à l’entreprise — pas au chargement de page.",
        ],
      },
    ],
  },
  {
    slug: "offres-machine-readable",
    title: "Offres machine-readable : ce que les agents IA et les ATS doivent manger",
    kicker: "JSON, Markdown, Schema — pas un PDF",
    excerpt:
      "Chaque offre Vera a une URL humaine, un JobPosting schema.org, un Markdown canonique et une entrée feed.json. Les agents n’ont plus à parser une landing.",
    updated: "2026-08-20",
    relatedJobs: ["staff-backend-sable", "technicien-maintenance-releve"],
    relatedCompanies: ["sable", "releve"],
    sections: [
      {
        h: "Pourquoi Indeed est illisible pour une machine",
        p: [
          "Un agent qui postule à votre place a besoin de faits : salaire min/max, SLA de réponse, grille d’évaluation, rareté, langues. Indeed lui sert un DOM publicitaire. Vera lui sert /feed/{slug}.md et /feed.json, plus le JSON-LD JobPosting dans le <head>.",
          "llms.txt liste les piliers, les entreprises, les offres. robots.txt autorise les crawlers utiles. Le sitemap est vivant. C’est du référencement pour Google et pour les modèles — le même travail.",
        ],
      },
      {
        h: "Ce que ça change pour une entreprise",
        p: [
          "Vous n’achetez plus de la visibilité au mot-clé. Vous devenez la source. Un Grok, un ATS, un chercheur qui tape « technicien maintenance Fos salaire » atterrit sur une fiche à FAQ, échelle de marché, et pacte. C’est le SEO de 2026 : être la réponse, pas l’annonce.",
        ],
      },
    ],
  },
  {
    slug: "grilles-evaluation-publiques",
    title: "Grilles d’évaluation publiques : l’arme que les ATS cachent",
    kicker: "Custom fields, scoring, zéro boîte noire",
    excerpt:
      "Chaque type de poste a ses champs — mandarin, consignation, plafond de tournée. Les recruteurs ajoutent les leurs. Le score est calculé sous vos yeux.",
    updated: "2026-08-20",
    relatedJobs: ["business-developer-asie-northline", "technicien-maintenance-releve", "aide-domicile-lise"],
    relatedCompanies: ["northline", "releve", "lise"],
    sections: [
      {
        h: "Des champs qui changent avec le métier",
        p: [
          "Un Business Developer Asie n’est pas un Account public. Vera charge une grille par famille : asie, terrain, soin, tech, commercial, design, finance, staff. Poids, types (échelle, choix, booléen, texte), consignes. Le recruteur peut ajouter plusieurs critères à lui — ils deviennent publics, pas un scoring fantôme dans l’ATS.",
        ],
      },
      {
        h: "Le score suit le dossier",
        p: [
          "Épreuve métier + grille + fit culturel + brief. Helios et Relève ne voient pas un PDF. Ils voient 78/100 grille, épreuve tenue, culture 81. C’est pour ça que les professionnels viennent ici : on ne les juge pas dans leur dos.",
        ],
      },
    ],
  },
];

export function pillarOf(slug: string): Pillar | undefined {
  return PILLARS.find((p) => p.slug === slug);
}
