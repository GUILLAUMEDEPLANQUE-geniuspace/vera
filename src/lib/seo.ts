import { formatSalary } from "./format";
import { placeOfCity } from "./geo";
import { BRAND_HOST } from "./origin";
import { ppqcPrice } from "./ppqc";
import { CONTRACT_LABEL, REMOTE_LABEL, SENIORITY_LABEL, type Company, type JobDetail, type JobListItem } from "./types";
import type { Scarcity } from "./scarcity";
import type { CultureProfile } from "./culture";
import type { EvalGrid } from "./fields";

export function jobTitleTag(job: {
  title: string;
  city: string;
  company: { name: string };
  contract: keyof typeof CONTRACT_LABEL;
}): string {
  return `${job.title} ${job.city} (${CONTRACT_LABEL[job.contract]}) — ${job.company.name} | Vera`;
}

export function jobDescriptionTag(job: JobDetail): string {
  const pay = formatSalary(job.salaryMin, job.salaryMax, job.currency);
  const remote = REMOTE_LABEL[job.remoteType];
  return `${job.title} chez ${job.company.name} à ${job.city}. ${pay}, ${remote}, pacte ${job.company.responseSlaDays} j, honneur ${job.company.honorScore}. Salaire publié, process ${job.processHours} h. Pas de ghost caché.`;
}

export function companyTitleTag(c: Company): string {
  return `${c.name} — emplois ${c.industry.toLowerCase()} à ${c.hqCity} | Vera`;
}

export function companyDescriptionTag(c: Company, jobCount: number): string {
  return `${c.name}, ${c.industry.toLowerCase()} à ${c.hqCity}. ${c.tagline} ${jobCount} offre${jobCount > 1 ? "s" : ""} ouverte${jobCount > 1 ? "s" : ""}. Honneur ${c.honorScore}, réponse sous ${c.responseSlaDays} jours. Culture, management, grilles publiques.`;
}

export function jobFaqs(job: JobDetail, scarcity: Scarcity): { q: string; a: string }[] {
  const pay = formatSalary(job.salaryMin, job.salaryMax, job.currency);
  return [
    {
      q: `Quel est le salaire pour ${job.title} chez ${job.company.name} à ${job.city} ?`,
      a: `Le salaire est publié : ${pay} brut annuel. Vera refuse les « selon profil ». La médiane de marché affichée sur la fiche sert à situer l’offre, pas à la négocier dans le flou.`,
    },
    {
      q: `${job.company.name} répond-elle vraiment aux candidatures ?`,
      a: `Pacte public : réponse sous ${job.company.responseSlaDays} jours. Honneur ${job.company.honorScore}/100 (${job.companyFull.honorAnswered} dossiers à l’heure sur ${job.companyFull.honorDue}). Un retard baisse le score, visible par tous.`,
    },
    {
      q: `Combien de temps dure le recrutement pour ${job.title} ?`,
      a: `Process publié : ${job.processHours} heures de votre côté, décision visée en ${job.decisionDays} jours. Les étapes sont nommées (qui, combien d’heures). Pas de tour fantôme.`,
    },
    {
      q: `Le poste ${job.title} est-il ${REMOTE_LABEL[job.remoteType].toLowerCase()} ?`,
      a: `Oui : ${REMOTE_LABEL[job.remoteType]}, ${SENIORITY_LABEL[job.seniority]}, ${CONTRACT_LABEL[job.contract]}. ${job.location}.`,
    },
    {
      q: `Ce profil est-il rare en 2026 ?`,
      a: `Talent Scarcity Score ${scarcity.score}/100 — ${scarcity.label}. ${scarcity.why}`,
    },
  ];
}

export function jobLongform(job: JobDetail, culture: CultureProfile, grid: EvalGrid): string {
  const pay = formatSalary(job.salaryMin, job.salaryMax, job.currency);
  return [
    `${job.title} chez ${job.company.name} à ${job.city} n’est pas une fiche Indeed. C’est une offre Vera : salaire ${pay}, ${REMOTE_LABEL[job.remoteType]}, ${CONTRACT_LABEL[job.contract]}, séniorité ${SENIORITY_LABEL[job.seniority]}.`,
    job.description,
    `Le pacte de ${job.company.name} engage une réponse sous ${job.company.responseSlaDays} jours. L’honneur public est à ${job.company.honorScore}. Les ghost jobs n’ont pas d’intérêt à rester ici — Vera les signale.`,
    `Culture : ${culture.essay} Management : ${culture.management} Semaine : ${culture.weekStyle} Langues : ${culture.languages.join(", ")}. Score interculturel ${culture.intercultural}/100.`,
    `Les candidats sont évalués sur une grille publique « ${grid.title} » — ${grid.intro} Ce n’est pas un ATS opaque. Vous voyez les critères avant d’écrire.`,
    job.offer.honesty
      ? `Le difficile : ${job.offer.honesty.hard} Le bon : ${job.offer.honesty.good} L’exceptionnel : ${job.offer.honesty.exceptional}`
      : "",
    `Page indexée, Schema JobPosting, version machine-readable pour agents et ATS. Dernière mise à jour sur le salaire et le process : offre active ${job.postedAt.slice(0, 10)}.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function jobJsonLd(
  job: JobDetail,
  origin: string,
  faqs: { q: string; a: string }[],
): Record<string, unknown>[] {
  const url = `${origin}/jobs/${job.slug}`;
  const validThrough = new Date(new Date(job.postedAt).getTime() + 60 * 86_400_000).toISOString();
  const jobPosting: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: { "@type": "PropertyValue", name: "Vera", value: job.slug },
    datePosted: job.postedAt,
    validThrough,
    employmentType: job.contract === "freelance" ? "CONTRACTOR" : job.contract === "stage" ? "INTERN" : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.name,
      sameAs: job.companyFull.website ?? undefined,
      url: `${origin}/companies/${job.company.slug}`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressCountry: job.country,
      },
    },
    jobLocationType: job.remoteType === "remote" ? "TELECOMMUTE" : undefined,
    directApply: true,
    url,
    industry: job.company.industry,
    skills: job.skills.join(", "),
    experienceRequirements: SENIORITY_LABEL[job.seniority],
    occupationalCategory: job.collection ?? job.title,
  };
  const place = placeOfCity(job.city);
  if (place) {
    const addr = jobPosting.jobLocation as { address: Record<string, string> };
    addr.address.addressRegion = place.region.name;
    addr.address.postalCode = place.dept.code;
  }
  const quote = ppqcPrice(job);
  jobPosting.additionalProperty = [
    { "@type": "PropertyValue", name: "geoTension", value: quote.tension },
    { "@type": "PropertyValue", name: "ppqcEuros", value: quote.euros },
    { "@type": "PropertyValue", name: "honorScore", value: job.company.honorScore },
    { "@type": "PropertyValue", name: "responseSlaDays", value: job.company.responseSlaDays },
    ...(job.pool ? [{ "@type": "PropertyValue", name: "vivier", value: job.pool }] : []),
  ];
  if (job.salaryMin && job.salaryMax) {
    jobPosting.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.currency,
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: "YEAR",
      },
    };
  }
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Vera", item: origin },
      { "@type": "ListItem", position: 2, name: "Emplois", item: `${origin}/jobs` },
      { "@type": "ListItem", position: 3, name: job.company.name, item: `${origin}/companies/${job.company.slug}` },
      { "@type": "ListItem", position: 4, name: job.title, item: url },
    ],
  };
  return [jobPosting, faq, crumbs];
}

export function companyJsonLd(
  c: Company,
  origin: string,
  jobs: Pick<JobListItem, "slug" | "title">[],
  culture: CultureProfile,
): Record<string, unknown>[] {
  const url = `${origin}/companies/${c.slug}`;
  const faqs = companyFaqs(c, jobs.length, culture);
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: c.name,
      description: c.about,
      url,
      sameAs: c.website ?? undefined,
      foundingDate: c.foundedYear ? String(c.foundedYear) : undefined,
      address: {
        "@type": "PostalAddress",
        addressLocality: c.hqCity,
        addressCountry: c.hqCountry,
      },
      numberOfEmployees: { "@type": "QuantitativeValue", value: c.sizeBand },
      knowsAbout: c.industry,
      knowsLanguage: culture.languages,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: (c.honorScore / 20).toFixed(1),
        bestRating: "5",
        worstRating: "1",
        ratingCount: Math.max(1, c.honorDue),
        reviewCount: Math.max(1, c.honorDue),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Emplois chez ${c.name}`,
      url,
      about: { "@type": "Organization", name: c.name, url },
      numberOfItems: jobs.length,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Vera", item: origin },
        { "@type": "ListItem", position: 2, name: "Maisons", item: `${origin}/companies` },
        { "@type": "ListItem", position: 3, name: c.name, item: url },
      ],
    },
    itemListJsonLd(
      `Offres ${c.name}`,
      jobs.map((j) => ({ name: j.title, url: `${origin}/jobs/${j.slug}` })),
    ),
  ];
}

export function websiteJsonLd(origin = BRAND_HOST): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vera",
    url: origin,
    inLanguage: "fr-FR",
    description: "L’emploi, enfin lisible. Verdict, pacte, brief, offres augmentées.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${origin}/jobs?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function companyFaqs(
  c: Company,
  jobCount: number,
  culture: CultureProfile,
): { q: string; a: string }[] {
  return [
    {
      q: `${c.name} embauche-t-elle en ce moment ?`,
      a: `${jobCount} offre${jobCount > 1 ? "s" : ""} ouverte${jobCount > 1 ? "s" : ""} sur Vera. Pacte de réponse ${c.responseSlaDays} jours, honneur ${c.honorScore}/100. Les ghost jobs n’ont pas d’intérêt à rester ici.`,
    },
    {
      q: `Quelle est la culture de ${c.name} ?`,
      a: `${culture.essay} Management : ${culture.management} Semaine : ${culture.weekStyle} Langues : ${culture.languages.join(", ")}. Score interculturel ${culture.intercultural}/100.`,
    },
    {
      q: `${c.name} répond-elle vraiment aux candidatures ?`,
      a: `Pacte public : réponse sous ${c.responseSlaDays} jours. Honneur ${c.honorScore}/100 (${c.honorAnswered} dossiers à l’heure sur ${c.honorDue}). Un retard baisse le score, visible par tous.`,
    },
    {
      q: `Où travaille-t-on chez ${c.name} ?`,
      a: `Siège ${c.hqCity}, ${c.hqCountry}. ${culture.weekStyle} Taille ${c.sizeBand}${c.foundedYear ? `, fondée en ${c.foundedYear}` : ""}.`,
    },
    {
      q: `Quelles langues parle-t-on chez ${c.name} ?`,
      a: `${culture.languages.join(", ")}. Le matching Vera pèse le recouvrement linguistique, pas un « English-speaking HQ » de brochure.`,
    },
    {
      q: `Comment ${c.name} manage-t-elle ?`,
      a: culture.management,
    },
  ];
}

export function companyLongform(c: Company, culture: CultureProfile, jobCount: number): string {
  return [
    `${c.name} n’est pas une page carrière. C’est une maison Vera : honneur ${c.honorScore}/100, pacte ${c.responseSlaDays} jours, ${jobCount} offre${jobCount > 1 ? "s" : ""} à salaire publié à ${c.hqCity}.`,
    c.about,
    culture.essay,
    `Management : ${culture.management} Semaine : ${culture.weekStyle} Langues : ${culture.languages.join(", ")}. Score interculturel ${culture.intercultural}/100. Les axes (parole, hiérarchie, tempo, écrit, risque) sont publics — le matching les ajoute au score compétences.`,
    `Les ghost jobs n’ont pas d’intérêt à rester ici. Un retard de réponse baisse l’honneur, visible par tous. Version machine-readable pour agents et ATS.`,
  ].join("\n\n");
}

export function itemListJsonLd(
  name: string,
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

export function ldScript(data: unknown) {
  return { type: "application/ld+json" as const, children: JSON.stringify(data) };
}

export function articleJsonLd(
  article: {
    title: string;
    excerpt: string;
    body: string;
    authorName: string;
    updatedAt: string;
    skillTags: string[];
    minutes: number;
  },
  url: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["Article", "LearningResource"],
    headline: article.title,
    description: article.excerpt,
    url,
    dateModified: article.updatedAt,
    timeRequired: `PT${article.minutes}M`,
    inLanguage: "fr-FR",
    author: { "@type": "Person", name: article.authorName },
    publisher: { "@type": "Organization", name: "Vera" },
    about: article.skillTags,
    educationalUse: "professional training",
    isAccessibleForFree: true,
  };
}
