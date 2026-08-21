import { packForJob } from "./offer-data";
import type { Voice } from "./offer";
import { JOBS } from "./seed-data";

export type HouseMedia = {
  cover: string;
  video: string | null;
  gallery: { src: string; caption: string }[];
};

const BY_SLUG: Record<string, HouseMedia> = {
  releve: {
    cover: "/offer/releve-atelier.jpg",
    video: "/offer/v/karim.mp4",
    gallery: [
      { src: "/offer/releve-atelier.jpg", caption: "Atelier Fos — presse et bancs" },
      { src: "/offer/tool-consignation.jpg", caption: "Kit de consignation" },
      { src: "/offer/tool-couple.jpg", caption: "Clé dynamométrique" },
      { src: "/offer/karim.jpg", caption: "Équipe nuit" },
    ],
  },
  kora: {
    cover: "/offer/kora-chantier.jpg",
    video: "/offer/v/karim.mp4",
    gallery: [
      { src: "/offer/kora-chantier.jpg", caption: "Chantier PV" },
      { src: "/offer/tool-onduleur.jpg", caption: "Onduleur — épreuve" },
      { src: "/offer/nadia.jpg", caption: "Chef de chantier" },
    ],
  },
  lise: {
    cover: "/offer/lise-domicile.jpg",
    video: "/offer/v/camille.mp4",
    gallery: [
      { src: "/offer/lise-domicile.jpg", caption: "Tournée domicile" },
      { src: "/offer/helene.jpg", caption: "Auxiliaire" },
    ],
  },
  mireille: {
    cover: "/offer/mireille-unite.jpg",
    video: null,
    gallery: [{ src: "/offer/mireille-unite.jpg", caption: "Unité de soins" }],
  },
  sable: {
    cover: "/offer/sable-loft.jpg",
    video: "/offer/v/camille.mp4",
    gallery: [
      { src: "/offer/sable-loft.jpg", caption: "Loft écriture" },
      { src: "/offer/camille.jpg", caption: "Équipe produit" },
    ],
  },
  lumina: {
    cover: "/offer/sable-loft.jpg",
    video: "/offer/v/camille.mp4",
    gallery: [
      { src: "/offer/sable-loft.jpg", caption: "Bureau climat" },
      { src: "/offer/camille.jpg", caption: "Produit" },
    ],
  },
};

const INDUSTRY_COVER: { test: RegExp; media: HouseMedia }[] = [
  {
    test: /santé|sante|soin/,
    media: {
      cover: "/offer/lise-domicile.jpg",
      video: "/offer/v/camille.mp4",
      gallery: [{ src: "/offer/lise-domicile.jpg", caption: "Soin" }],
    },
  },
  {
    test: /industrie|énergie|energie|bâtiment|batiment/,
    media: {
      cover: "/offer/releve-atelier.jpg",
      video: "/offer/v/karim.mp4",
      gallery: [{ src: "/offer/releve-atelier.jpg", caption: "Atelier" }],
    },
  },
  {
    test: /outil|fintech|climat|média|media/,
    media: {
      cover: "/offer/sable-loft.jpg",
      video: "/offer/v/camille.mp4",
      gallery: [{ src: "/offer/sable-loft.jpg", caption: "Bureau" }],
    },
  },
];

const FALLBACK: HouseMedia = {
  cover: "/offer/sable-loft.jpg",
  video: null,
  gallery: [{ src: "/offer/sable-loft.jpg", caption: "Maison" }],
};

export function mediaOf(slug: string, industry: string): HouseMedia {
  const direct = BY_SLUG[slug];
  if (direct) return direct;
  const hit = INDUSTRY_COVER.find((r) => r.test.test(industry.toLowerCase()));
  return hit?.media ?? FALLBACK;
}

export function voicesOf(slug: string): Voice[] {
  const job = JOBS.find((j) => j.companySlug === slug);
  if (!job) return [];
  return packForJob(job).voices ?? [];
}
