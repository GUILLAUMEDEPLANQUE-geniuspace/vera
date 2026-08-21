import type { Sql } from "./db";
import { GLOSSARY } from "./glossary";

type Cat = {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  sort: number;
  seoTitle: string;
  seoDescription: string;
  fields: { key: string; label: string; type: string; options?: string[]; required?: boolean }[];
};

const CATS: Cat[] = [
  {
    slug: "marche",
    title: "Marché de l’emploi",
    kicker: "Observatoire",
    description:
      "Tension, salaires, pénurie réelle. Les entreprises et les candidats écrivent ce que le marché fait, pas ce que LinkedIn raconte.",
    sort: 10,
    seoTitle: "Marché de l’emploi 2026 — tension, salaires, pénurie | Vera",
    seoDescription:
      "Fiches marché : tension territoriale, pénurie commerciale, salaires publiés. Liées aux offres Vera.",
    fields: [
      { key: "bassin", label: "Bassin", type: "text", required: true },
      { key: "horizon", label: "Horizon", type: "select", options: ["2026", "2027", "structurel"] },
    ],
  },
  {
    slug: "metiers",
    title: "Métiers & gestes",
    kicker: "Geste",
    description: "Le geste avant le titre. Consignation, tournée, négo, automate. Chaque fiche ouvre des offres.",
    sort: 20,
    seoTitle: "Métiers et gestes — fiches liées aux offres | Vera",
    seoDescription: "Fiches métier Vera : consignation, soin, commercial, robotique. Préformer avant de postuler.",
    fields: [
      { key: "famille", label: "Famille", type: "select", options: ["terrain", "soin", "commercial", "industrie", "bureau"] },
      { key: "risque", label: "Risque si mal tenu", type: "text" },
    ],
  },
  {
    slug: "robotique",
    title: "Robotique & industrie",
    kicker: "Module",
    description:
      "Automates, cellules, consignations robot. Si l’offre demande un geste que vous n’avez pas encore, la fiche est le chemin — pas un silence.",
    sort: 30,
    seoTitle: "Robotique industrielle — module avant l’offre | Vera",
    seoDescription:
      "Module robotique : cellules, consignation, GMAO. Liée aux offres maintenance et industrie.",
    fields: [
      { key: "cellule", label: "Type de cellule", type: "select", options: ["pick & place", "soudage", "palletisation", "AGV", "autre"] },
      { key: "norme", label: "Norme / consigne", type: "text" },
    ],
  },
  {
    slug: "droit",
    title: "Droit du travail",
    kicker: "Cadre",
    description: "CDI, CDD, freelance, essai, non-concurrence, CSE. Écrit pour tenir, pas pour faire peur.",
    sort: 40,
    seoTitle: "Droit du travail pour candidats et entreprises | Vera",
    seoDescription: "CDI, essai, freelance, non-concurrence. Fiches liées aux contrats des offres Vera.",
    fields: [{ key: "texte", label: "Texte / article", type: "text" }],
  },
  {
    slug: "compta",
    title: "Compta & paie",
    kicker: "Chiffre",
    description: "Lire un brut, charges, bulletins, seuil. Pour décider, pas pour souffrir Excel.",
    sort: 50,
    seoTitle: "Compta et paie — lire un salaire publié | Vera",
    seoDescription: "Brut, net, charges, bulletins. Pour lire les salaires Vera, pas pour un cours d’expert-comptable.",
    fields: [{ key: "poste", label: "Poste du bulletin", type: "text" }],
  },
  {
    slug: "creation",
    title: "Création d’entreprise",
    kicker: "Création",
    description: "SASU pendant un CDI, portage, micro, premières factures. Le slasher et le fractional commencent ici.",
    sort: 60,
    seoTitle: "Créer une activité pendant l’emploi | Vera",
    seoDescription: "SASU, micro, portage. Pour les slashers et les seniors fractional Vera.",
    fields: [{ key: "forme", label: "Forme", type: "select", options: ["SASU", "micro", "portage", "EURL", "autre"] }],
  },
  {
    slug: "interculturel",
    title: "Fit culturel",
    kicker: "Codes",
    description: "Guanxi, nemawashi, comité français. Le fit n’est pas un test de personnalité : c’est un code de preuve.",
    sort: 70,
    seoTitle: "Fit culturel France / Chine / Japon | Vera",
    seoDescription: "Codes de décision et de preuve. Lié aux offres internationales Vera.",
    fields: [{ key: "zone", label: "Zone", type: "select", options: ["France", "Chine", "Japon", "USA", "mixte"] }],
  },
  {
    slug: "terrain",
    title: "Métiers de terrain",
    kicker: "Chantier",
    description: "PAC, ombrières, tournée, domicile. Les fiches que Indeed ne peut pas vendre : trop précises.",
    sort: 80,
    seoTitle: "Métiers de terrain — fiches opératoires | Vera",
    seoDescription: "Consignation, PAC, tournée, domicile. Préformer un geste de terrain avant l’épreuve Vera.",
    fields: [{ key: "energie", label: "Énergie / lieu", type: "text" }],
  },
];

type Art = {
  slug: string;
  cat: string;
  title: string;
  excerpt: string;
  body: string[];
  skills: string[];
  jobs: string[];
  role: "house" | "candidate" | "operator";
  author: string;
  proof: number;
  minutes: number;
  fields: Record<string, string>;
};

const ARTS: Art[] = [
  {
    slug: "tension-commerciale-2026",
    cat: "marche",
    title: "Pénurie commerciale Europe 2026 : le titre ne dit rien",
    excerpt: "Les entreprises paient des vues. Les tenus ne postulent plus. La tension est un geste, pas un intitulé.",
    body: [
      "Les jobboards vendent du volume. Un « business developer » à Paris et un « chef de secteur » à Arras n’ont pas le même geste, ni la même pénurie. Vera affiche la tension par bassin et le Talent Scarcity Score sur l’offre.",
      "Si le salaire publié est sous la médiane du lieu, le Verdict dit Passez. Ce n’est pas de l’arrogance : c’est le marché. Les entreprises qui tiennent le pacte (réponse sous N jours) voient arriver les tenus. Les autres restent sur Indeed.",
      "Pour un candidat : lisez la tension, le pacte, la grille. Pour une entreprise : publiez le salaire et le geste, pas un slogan. Le PPQC monte avec la tension — recruter à Fos n’est pas recruter à Boulogne.",
    ],
    skills: ["Vente", "Négociation", "CRM"],
    jobs: ["business-developer-asie-northline"],
    role: "operator",
    author: "Observatoire Vera",
    proof: 82,
    minutes: 7,
    fields: { bassin: "Europe / Hauts-de-France", horizon: "2026" },
  },
  {
    slug: "consignation-avant-la-cle",
    cat: "metiers",
    title: "Consignation : le cadenas avant la clé",
    excerpt: "Une ligne qui « a l’air à l’arrêt » n’est pas consignataire. L’énergie restante tue autant que le 400 V.",
    body: [
      "Ordre Vera : identifier les énergies → séparer → cadenas perso → essai de remise en marche → mesure à zéro. Inverser deux étapes, c’est un accident, pas une coquille.",
      "Les offres maintenance Relève (Fos) et électricien Kora demandent ce geste. Si vous n’avez jamais cadenassé, lisez ceci, regardez la visite Drive, puis tenez l’épreuve lockout. Un 55 ouvre Apprendre. Un 80 ouvre le dossier.",
      "Entreprise : écrivez l’ordre dans l’offre. Candidat : un cadenas partagé = 0. Ce n’est pas un détail RH.",
    ],
    skills: ["Consignation", "Mécanique", "Hydraulique", "GMAO", "Électricité"],
    jobs: ["technicien-maintenance-releve", "electricien-ombrieres-kora"],
    role: "house",
    author: "Relève Fos",
    proof: 91,
    minutes: 8,
    fields: { famille: "industrie", risque: "énergie résiduelle, accident mortel" },
  },
  {
    slug: "cellule-robot-premier-geste",
    cat: "robotique",
    title: "Cellule robot : le premier geste n’est pas le teach pendantant",
    excerpt: "Postuler en robotique sans avoir tenu une cellule : 12 minutes ici, puis l’épreuve. Pas un silence.",
    body: [
      "Une cellule pick & place n’est pas un jouet. Avant le teach : zone, barrières, mode manuel, consignation de l’armoire, validation du POUVOIR. Le pendantant n’excuse pas un oubli de LOTO.",
      "Si l’offre Relève ou un poste automate vous demande « robotique » et que vous venez de la mécanique générale : cette fiche est le chemin. Vous apprenez le vocabulaire (cellule, enseigner, vitesse collabo, GMAO) puis vous tenez l’épreuve machine.",
      "Entreprise : attachez au Drive le mode opératoire et une visite de 40 s. Candidat : après lecture, rejouez l’épreuve. Le score de preuve de cette fiche est haut parce que l’ordre est écrit, pas raconté.",
    ],
    skills: ["Consignation", "GMAO", "Mécanique", "Embarqué", "C"],
    jobs: ["technicien-maintenance-releve"],
    role: "house",
    author: "Cellule Relève",
    proof: 88,
    minutes: 12,
    fields: { cellule: "pick & place", norme: "ISO 10218 / consignation armoire" },
  },
  {
    slug: "essai-cdi-ce-qui-est-ecrit",
    cat: "droit",
    title: "Période d’essai : ce qui est écrit, ce qui n’est pas un Try & Buy",
    excerpt: "L’essai n’est pas une période d’observation gratuite. Le Try & Buy Vera est payé, nommé, borné.",
    body: [
      "Code du travail : l’essai se renouvelle dans les conditions du contrat. Le silence n’est pas un accord. Un Try & Buy Vera (jours × tarif, superviseur) n’est pas un essai : c’est une mission courte payée, avant CDI.",
      "Candidat : si l’entreprise propose un essai de 4 mois « pour voir » sans pacte de réponse, le Verdict baisse. Entreprise : nommez l’essai, le renouvellement, le Try & Buy. Les ghost jobs vivent du flou.",
    ],
    skills: ["Conformité", "Procédures"],
    jobs: [],
    role: "operator",
    author: "Vera Droit",
    proof: 76,
    minutes: 6,
    fields: { texte: "C. trav. essai / renouvellement" },
  },
  {
    slug: "lire-un-brut-vera",
    cat: "compta",
    title: "Lire un brut Vera : médiane, charges, ce qui reste",
    excerpt: "Un salaire publié n’est pas un net. Voici comment le poser contre la médiane du lieu.",
    body: [
      "Vera refuse les « selon profil ». Le brut annuel est sur la fiche, la médiane du secteur aussi. Charges salariales ≈ 22 %, patronales davantage : le coût employeur n’est pas votre net.",
      "Si le brut est sous la médiane du bassin et que la tension est haute, le Verdict dit Demandez ou Passez. Entreprise : un brut honnête coûte moins cher qu’un ghost. Candidat : le PPQC n’est pas pris sur votre salaire.",
    ],
    skills: ["SQL", "Finance"],
    jobs: [],
    role: "operator",
    author: "Observatoire Vera",
    proof: 74,
    minutes: 5,
    fields: { poste: "salaire brut annuel" },
  },
  {
    slug: "sasu-pendant-cdi",
    cat: "creation",
    title: "SASU pendant un CDI : le slasher écrit, pas le clandestin",
    excerpt: "Clause d’exclusivité, déontologie, premières factures. Le fractional commence par un cadre.",
    body: [
      "Beaucoup de seniors tiennent un jour ailleurs. Sans cadre, c’est un licenciement. Avec une SASU, une clause lue, un créneau Vera : c’est un format.",
      "Lisez le contrat. L’exclusivité n’est pas toujours là. Le créneau (mardi 9–17, une entreprise) rend le temps lisible. Entreprise : achetez un jour, pas un ETP fantôme.",
    ],
    skills: ["Leadership", "Product operations"],
    jobs: [],
    role: "candidate",
    author: "Un slasher Fos",
    proof: 71,
    minutes: 9,
    fields: { forme: "SASU" },
  },
  {
    slug: "guanxi-n-est-pas-un-crm",
    cat: "interculturel",
    title: "Guanxi n’est pas un CRM",
    excerpt: "La relation précède la preuve en Chine. En France, la preuve précède la relation. Nommez le code.",
    body: [
      "L’offre Northline (Asie) demande du mandarin de négo et un guanxi nommé. Ce n’est pas un test de personnalité. C’est l’ordre de la confiance : dîner, introduction, puis chiffre.",
      "Un commercial français qui envoie le deck en premier se fait ignorer. Un commercial chinois qui n’écrit jamais le pacte se fait ghost. Vera affiche le Cultural Fit à côté de l’épreuve — le geste reste le geste.",
    ],
    skills: ["Mandarin", "Guanxi", "Négociation", "Freight", "Incoterms"],
    jobs: ["business-developer-asie-northline"],
    role: "house",
    author: "Northline",
    proof: 84,
    minutes: 8,
    fields: { zone: "Chine" },
  },
  {
    slug: "cinq-personnes-pas-neuf",
    cat: "terrain",
    title: "Tournée domicile : cinq personnes, pas neuf",
    excerpt: "Accepter une sixième « pour dépanner », c’est signer l’arrêt à six mois. Le plafond s’écrit.",
    body: [
      "L’offre Maison Lise (Lyon) tient un plafond. Le geste : dire le nombre, proposer un report, alerter la coordinatrice. Pas « on verra ce soir ».",
      "Si l’épreuve soin vous met sous 55, le module Apprendre est 5 min. Cette fiche est le pourquoi. Entreprise : un plafond écrit attire les tenus. Un « on s’adapte » attire le turnover.",
    ],
    skills: ["Soin", "Présence", "Transmission", "Manutention"],
    jobs: ["aide-domicile-lise"],
    role: "house",
    author: "Maison Lise",
    proof: 90,
    minutes: 5,
    fields: { energie: "domicile / tournée" },
  },
  {
    slug: "neutre-ouvert",
    cat: "terrain",
    title: "Le neutre ouvert n’est pas un disjoncteur",
    excerpt: "Phase présente, pas de retour, disjoncteur fermé : dérivation, pas un fusible à changer.",
    body: [
      "On sonde deux points dont le bornier. Diagnostiquer sans sonde, c’est de la chance. Vera note la chance à 55, pas à 100.",
      "Fiche liée à l’offre Kora (ombrières). Préparez le diagnostic, puis tenez l’épreuve circuit. Entreprise : attachez le schéma au Drive. Candidat : la visite vidéo ne remplace pas la sonde.",
    ],
    skills: ["Électricité", "Onduleurs", "Chantier", "Habilitation"],
    jobs: ["electricien-ombrieres-kora"],
    role: "house",
    author: "Kora",
    proof: 87,
    minutes: 6,
    fields: { energie: "BT / ombrières" },
  },
  {
    slug: "pac-mesurer-avant-cle",
    cat: "metiers",
    title: "PAC : mesurer avant de tourner",
    excerpt: "Une PAC qui « ne chauffe plus » n’est pas une vanne au hasard. Trois lectures, puis un geste.",
    body: [
      "Pression, sondes, tarif heures creuses. Le mauvais ordre casse un détendeur. Le bon ordre tient 8 minutes.",
      "Si l’épreuve machine rate sur skip-measure, cette fiche + le module Apprendre. Entreprise : le mode opératoire va dans le Drive, pas dans un PDF perdu.",
    ],
    skills: ["Mécanique", "Hydraulique", "GMAO"],
    jobs: ["technicien-maintenance-releve"],
    role: "house",
    author: "Relève",
    proof: 85,
    minutes: 7,
    fields: { famille: "terrain", risque: "détendeur / fluide" },
  },
];

const DRIVE: {
  title: string;
  slug: string;
  filename: string;
  mime: string;
  type: string;
  entityType: string;
  entityKey: string;
  sourceUrl?: string;
  transcript?: string;
  text?: string;
  chunkSize: number;
}[] = [
  {
    title: "Visite Relève — consignation presse",
    slug: "visite-releve-consignation",
    filename: "karim.mp4",
    mime: "video/mp4",
    type: "video",
    entityType: "job",
    entityKey: "technicien-maintenance-releve",
    sourceUrl: "/offer/v/karim.mp4",
    transcript: "Karim, chef d’équipe Relève : consignation, cadenas perso, essai de remise. Le teach robot vient après.",
    chunkSize: 262144,
  },
  {
    title: "Chantier Kora — ombrières",
    slug: "visite-kora-ombrieres",
    filename: "camille.mp4",
    mime: "video/mp4",
    type: "video",
    entityType: "job",
    entityKey: "electricien-ombrieres-kora",
    sourceUrl: "/offer/v/camille.mp4",
    transcript: "Camille : schéma, neutre, août stop 13h. La sonde avant la parole.",
    chunkSize: 262144,
  },
  {
    title: "Mode opératoire cellule robot — Relève",
    slug: "mo-cellule-robot",
    filename: "mo-cellule-robot.md",
    mime: "text/markdown",
    type: "text",
    entityType: "knowledge",
    entityKey: "cellule-robot-premier-geste",
    text: `# Cellule pick & place — mode opératoire Relève

1. Zone et barrières fermées.
2. Mode manuel, vitesse collabo.
3. Consignation armoire (cadenas perso).
4. Essai de remise : ne doit pas partir.
5. Teach uniquement après LOTO tenu.
6. GMAO : ticket ouvert avant, clos après mesure.

Preuve : photo cadenas + horodatage. Proof Score bas si photo absente.`,
    chunkSize: 180,
  },
  {
    title: "Schéma bornier ombrières — Kora",
    slug: "schema-bornier-kora",
    filename: "schema-bornier.md",
    mime: "text/markdown",
    type: "text",
    entityType: "knowledge",
    entityKey: "neutre-ouvert",
    text: `# Bornier ombrières

- Disjoncteur fermé n’est pas un diagnostic.
- Sonder phase et neutre au bornier.
- Neutre ouvert : prises « mortes », phase présente.
- Ne pas « changer le fusible » sans ces deux points.

Fiche liée : Le neutre ouvert n’est pas un disjoncteur.`,
    chunkSize: 160,
  },
];

const REPLIES: { art: string; name: string; role: string; body: string }[] = [
  {
    art: "cellule-robot-premier-geste",
    name: "Malik",
    role: "candidate",
    body: "J’arrive de la mécanique générale. La fiche m’a évité de poser le teach en premier. Épreuve machine à 78 ensuite.",
  },
  {
    art: "consignation-avant-la-cle",
    name: "Relève Fos",
    role: "house",
    body: "On a retiré deux offres Indeed qui ne citaient pas le LOTO. Ici, le geste est la porte.",
  },
  {
    art: "cinq-personnes-pas-neuf",
    name: "Nadia",
    role: "candidate",
    body: "Le plafond écrit m’a fait postuler. Ailleurs on dit « on s’adapte » et on casse les gens.",
  },
];

function chunkText(text: string, size: number): string[] {
  const bytes = Buffer.from(text, "utf8");
  const out: string[] = [];
  for (let i = 0; i < bytes.length; i += size) {
    out.push(bytes.subarray(i, i + size).toString("base64"));
  }
  return out.length ? out : [Buffer.from("").toString("base64")];
}

export async function seedHub(sql: Sql): Promise<void> {
  await sql.query(`
    create table if not exists knowledge_categories (
      id serial primary key,
      slug text unique not null,
      title text not null,
      kicker text not null default '',
      description text not null,
      sort_order int not null default 100,
      seo_title text,
      seo_description text,
      created_at timestamptz not null default now()
    )
  `);
  await sql.query(`
    create table if not exists knowledge_fields (
      id serial primary key,
      category_id int not null references knowledge_categories(id) on delete cascade,
      field_key text not null,
      label text not null,
      field_type text not null default 'text',
      options_json text not null default '[]',
      required boolean not null default false,
      sort_order int not null default 100,
      unique (category_id, field_key)
    )
  `);
  await sql.query(`
    create table if not exists knowledge_articles (
      id serial primary key,
      slug text unique not null,
      category_id int not null references knowledge_categories(id) on delete restrict,
      title text not null,
      excerpt text not null,
      body text not null,
      skill_tags_json text not null default '[]',
      job_slugs_json text not null default '[]',
      fields_json text not null default '{}',
      author_role text not null default 'house',
      author_name text not null,
      proof_score int not null default 70,
      minutes int not null default 8,
      published boolean not null default true,
      user_id text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await sql.query(`create index if not exists knowledge_articles_cat_idx on knowledge_articles (category_id, published)`);
  await sql.query(`
    create table if not exists knowledge_replies (
      id serial primary key,
      article_id int not null references knowledge_articles(id) on delete cascade,
      user_id text not null,
      author_name text not null,
      author_role text not null default 'candidate',
      body text not null,
      created_at timestamptz not null default now()
    )
  `);
  await sql.query(`
    create table if not exists glossary_terms (
      term_key text primary key,
      label text not null,
      definition text not null,
      candidate_use text not null,
      company_use text not null
    )
  `);
  await sql.query(`
    create table if not exists drive_assets (
      id serial primary key,
      title text not null,
      slug text unique not null,
      filename text not null,
      mime text not null,
      asset_type text not null default 'file',
      chunk_size int not null default 262144,
      byte_size int not null default 0,
      source_url text,
      entity_type text,
      entity_key text,
      visibility text not null default 'public',
      transcript text,
      user_id text,
      created_at timestamptz not null default now()
    )
  `);
  await sql.query(`
    create table if not exists drive_chunks (
      asset_id int not null references drive_assets(id) on delete cascade,
      idx int not null,
      body_b64 text not null,
      primary key (asset_id, idx)
    )
  `);
  await sql.query(`create index if not exists drive_assets_entity_idx on drive_assets (entity_type, entity_key)`);

  for (const t of GLOSSARY) {
    await sql`
      insert into glossary_terms (term_key, label, definition, candidate_use, company_use)
      values (${t.key}, ${t.label}, ${t.definition}, ${t.candidate}, ${t.house})
      on conflict (term_key) do update set
        label = excluded.label,
        definition = excluded.definition,
        candidate_use = excluded.candidate_use,
        company_use = excluded.company_use
    `;
  }

  const [{ cn }] = await sql<{ cn: number }>`select count(*)::int as cn from knowledge_categories`;
  if (cn === 0) {
    for (const c of CATS) {
      await sql`
        insert into knowledge_categories (slug, title, kicker, description, sort_order, seo_title, seo_description)
        values (${c.slug}, ${c.title}, ${c.kicker}, ${c.description}, ${c.sort}, ${c.seoTitle}, ${c.seoDescription})
      `;
    }
  } else {
    for (const c of CATS) {
      await sql`
        update knowledge_categories
        set kicker = ${c.kicker}, description = ${c.description}, seo_title = ${c.seoTitle}, seo_description = ${c.seoDescription}
        where slug = ${c.slug}
      `;
    }
  }

  const cats = await sql<{ id: number; slug: string }>`select id, slug from knowledge_categories`;
  const catId = new Map(cats.map((r) => [r.slug, r.id]));

  const [{ fn }] = await sql<{ fn: number }>`select count(*)::int as fn from knowledge_fields`;
  if (fn === 0) {
    for (const c of CATS) {
      const id = catId.get(c.slug);
      if (!id) continue;
      let order = 10;
      for (const f of c.fields) {
        await sql`
          insert into knowledge_fields (category_id, field_key, label, field_type, options_json, required, sort_order)
          values (${id}, ${f.key}, ${f.label}, ${f.type}, ${JSON.stringify(f.options ?? [])}, ${Boolean(f.required)}, ${order})
        `;
        order += 10;
      }
    }
  }

  const [{ an }] = await sql<{ an: number }>`select count(*)::int as an from knowledge_articles`;
  if (an === 0) {
    for (const a of ARTS) {
      const id = catId.get(a.cat);
      if (!id) continue;
      await sql`
        insert into knowledge_articles (
          slug, category_id, title, excerpt, body, skill_tags_json, job_slugs_json,
          fields_json, author_role, author_name, proof_score, minutes, published
        ) values (
          ${a.slug}, ${id}, ${a.title}, ${a.excerpt}, ${a.body.join("\n\n")},
          ${JSON.stringify(a.skills)}, ${JSON.stringify(a.jobs)}, ${JSON.stringify(a.fields)},
          ${a.role}, ${a.author}, ${a.proof}, ${a.minutes}, ${true}
        )
      `;
    }
  } else {
    for (const a of ARTS) {
      await sql`
        update knowledge_articles
        set excerpt = ${a.excerpt}, body = ${a.body.join("\n\n")}
        where slug = ${a.slug}
      `;
    }
  }

  const [{ rn }] = await sql<{ rn: number }>`select count(*)::int as rn from knowledge_replies`;
  if (rn === 0) {
    const arts = await sql<{ id: number; slug: string }>`select id, slug from knowledge_articles`;
    const artId = new Map(arts.map((r) => [r.slug, r.id]));
    for (const r of REPLIES) {
      const id = artId.get(r.art);
      if (!id) continue;
      await sql`
        insert into knowledge_replies (article_id, user_id, author_name, author_role, body)
        values (${id}, ${"seed"}, ${r.name}, ${r.role}, ${r.body})
      `;
    }
  }

  const [{ dn }] = await sql<{ dn: number }>`select count(*)::int as dn from drive_assets`;
  if (dn === 0) {
    for (const d of DRIVE) {
      const chunks = d.text ? chunkText(d.text, d.chunkSize) : [];
      const byteSize = d.text ? Buffer.byteLength(d.text, "utf8") : 0;
      const rows = await sql<{ id: number }>`
        insert into drive_assets (
          title, slug, filename, mime, asset_type, chunk_size, byte_size,
          source_url, entity_type, entity_key, visibility, transcript
        ) values (
          ${d.title}, ${d.slug}, ${d.filename}, ${d.mime}, ${d.type}, ${d.chunkSize}, ${byteSize},
          ${d.sourceUrl ?? null}, ${d.entityType}, ${d.entityKey}, ${"public"}, ${d.transcript ?? null}
        )
        returning id
      `;
      const assetId = rows[0]?.id;
      if (!assetId || !chunks.length) continue;
      for (let i = 0; i < chunks.length; i += 1) {
        await sql`
          insert into drive_chunks (asset_id, idx, body_b64)
          values (${assetId}, ${i}, ${chunks[i]})
        `;
      }
    }
  }
}
