export const COLLECTIONS = [
  {
    slug: "remote",
    label: "Remote Europe",
    blurb: "Fuseau ±2h. Salaire publié. Pas de « remote » qui veut dire open space à 8h.",
  },
  {
    slug: "climat",
    label: "Climat & énergie",
    blurb: "Des kilowatts, pas des slides RSE.",
  },
  {
    slug: "premier",
    label: "Premier poste",
    blurb: "Stages et alternances avec un vrai encadrement.",
  },
  {
    slug: "staff",
    label: "Staff & lead",
    blurb: "La responsabilité, pas le titre.",
  },
  {
    slug: "design",
    label: "Design",
    blurb: "Systèmes, écriture, critique. Pas de Dribbble décoratif.",
  },
  {
    slug: "terrain",
    label: "Métiers de terrain",
    blurb: "Atelier, chantier, domicile. Offre lue : salaire, semaine, épreuve. Pas une fiche Pôle emploi.",
  },
  {
    slug: "sante",
    label: "Soin",
    blurb: "Tournées tenables, primes écrites. Pas la vocation en slide.",
  },
] as const;

export const PRESETS = {
  designer: {
    headline: "Product designer",
    location: "Paris",
    remotePref: "hybrid",
    seniority: "mid",
    skills: ["Figma", "Design system", "Recherche utilisateur", "Produit B2B", "Accessibilité"],
    languages: ["Français", "Anglais"],
    bio: "Designer produit, outils métier. Je cherche une équipe qui critique le travail, pas le statut.",
    salaryMin: 52000,
    salaryMax: 72000,
    roleTargets: ["Product designer", "Designer système"],
  },
  engineer: {
    headline: "Ingénieur backend",
    location: "Europe",
    remotePref: "remote",
    seniority: "senior",
    skills: ["Go", "TypeScript", "Postgres", "Kafka", "Systèmes distribués"],
    languages: ["Français", "Anglais"],
    bio: "Backend, systèmes, écriture. Remote Europe. Je ne candidate pas aux ghost jobs.",
    salaryMin: 70000,
    salaryMax: 100000,
    roleTargets: ["Staff backend", "Backend senior"],
  },
  junior: {
    headline: "En recherche de premier poste",
    location: "Lyon",
    remotePref: "hybrid",
    seniority: "junior",
    skills: ["SQL", "Produit", "Recherche utilisateur", "Écriture", "Figma"],
    languages: ["Français", "Anglais"],
    bio: "Fin d’études, stage sérieux visé. J’apprends vite si on me dit quand c’est mauvais.",
    salaryMin: 14000,
    salaryMax: 28000,
    roleTargets: ["Stage produit", "Alternance"],
  },
} as const;

export const BRIEF_PRESETS = {
  designer: {
    shipped: [
      {
        title: "Système d’interface d’un outil métier B2B",
        impact: "Adoption interne 78 % en six mois, temps de formation divisé par deux.",
        year: "2024",
      },
      {
        title: "Refonte du parcours de souscription",
        impact: "Taux de complétion +19 pts sans ajouter une étape marketing.",
        year: "2023",
      },
      {
        title: "Recherche terrain auprès de 22 opérateurs",
        impact: "Trois chantiers tués avant d’être construits. Le plus utile.",
        year: "2023",
      },
    ],
    refuse: [
      "Les titres sans responsabilité",
      "Les sprints qui servent une revue, pas un usager",
      "Le « on verra le salaire plus tard »",
    ],
    nextChapter:
      "Tenir un système dans une équipe qui critique le travail. Outil métier, pas une landing. Hybride Paris ou remote Europe.",
    workingStyle:
      "J’écris avant de figer. Critique quotidienne, peu de slides. Je préfère un mauvais premier jet partagé à une révélation le vendredi.",
  },
  engineer: {
    shipped: [
      {
        title: "Ingestion d’événements (Go + Kafka)",
        impact: "Coût unitaire ÷ 3, p99 sous 80 ms à 40 k evt/s.",
        year: "2025",
      },
      {
        title: "Migration Postgres sans downtime",
        impact: "12 To déplacés, zéro incident client, runbook publié.",
        year: "2024",
      },
      {
        title: "Garde-fous de rétention",
        impact: "Facture cloud −28 % sans perdre l’investigation.",
        year: "2024",
      },
    ],
    refuse: [
      "Les ghost jobs et les process à six tours",
      "Le présentiel théâtral pour un travail asynchrone",
      "Les titres staff sans arbitrage réel",
    ],
    nextChapter:
      "Un runtime à rendre ennuyeux. Remote Europe, fuseau ±2 h. Écriture d’abord, réunions rares.",
    workingStyle:
      "Spec courte, PR petite, on-call rare et payé. Je dis non tôt. Je documente ce que je casse.",
  },
  junior: {
    shipped: [
      {
        title: "Stage : tableau de charge d’un service",
        impact: "Les chefs de pôle ont arrêté le tableur orphelin du lundi.",
        year: "2025",
      },
      {
        title: "Enquête usagers (14 entretiens)",
        impact: "Deux hypothèses abandonnées avant le prototype.",
        year: "2025",
      },
      {
        title: "Mémoire : mesure d’un temps soignant",
        impact: "Méthode reprise par l’équipe data de l’établissement.",
        year: "2024",
      },
    ],
    refuse: [
      "Les stages sans encadrant nommé",
      "Faire le café et les maquettes jetables",
    ],
    nextChapter:
      "Un premier poste ou un stage long avec un vrai binôme. Lyon ou hybride. J’apprends si on me dit quand c’est mauvais.",
    workingStyle:
      "Je prends des notes, je pose des questions précises, je livre la semaine dite. Pas de théâtre.",
  },
} as const;
