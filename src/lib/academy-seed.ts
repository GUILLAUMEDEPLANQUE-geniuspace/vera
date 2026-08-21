import type { Sql } from "./db";

export type SeedQuiz = { q: string; choices: string[]; answer: number };

export type SeedModule = {
  slug: string;
  title: string;
  kicker: string;
  body: string[];
  kind: "lesson" | "quiz" | "drill";
  minutes: number;
  quiz?: SeedQuiz[];
};

export type SeedCourse = {
  slug: string;
  title: string;
  excerpt: string;
  audience: "employee" | "candidate" | "both";
  category: string;
  mandatory: boolean;
  sort: number;
  modules: SeedModule[];
};

function minutesOf(mods: SeedModule[]): number {
  return mods.reduce((n, m) => n + m.minutes, 0);
}

function onboarding(name: string): SeedCourse {
  const mods: SeedModule[] = [
    {
      slug: "pacte",
      title: `Le pacte de ${name}`,
      kicker: "Accueil",
      minutes: 6,
      kind: "lesson",
      body: [
        `${name} n’embauche pas dans le flou. Le pacte de réponse est public : un délai écrit, un honneur qui baisse si on le manque. Salarié, vous héritez de la même exigence : un créneau tenu, un geste nommé, pas un « on verra ».`,
        `Lisez la page entreprise avant le premier slack. Honneur, langues, management, semaine. Ce n’est pas de la com : c’est le contrat interne.`,
        `Si un manager vous demande d’inventer une urgence pour un candidat, vous refusez. Le pacte est plus fort que le N+1. C’est écrit ici.`,
      ],
    },
    {
      slug: "grille",
      title: "La grille est publique — y compris en interne",
      kicker: "Évaluation",
      minutes: 5,
      kind: "lesson",
      body: [
        `Les critères d’une offre Vera sont visibles par le candidat. En interne, la même règle : vous n’évaluez pas « au feeling » un collègue en période d’essai.`,
        `Un refus a un motif (consignation, charge, langue de négo). Un silence n’est pas un management. ${name} tient le même honneur envers les salariés qu’envers les dossiers.`,
      ],
    },
    {
      slug: "quiz-accueil",
      title: "Tenir l’accueil",
      kicker: "Quiz",
      minutes: 4,
      kind: "quiz",
      body: [`Trois questions. 70 % pour valider le parcours. Un hasard n’est pas un geste.`],
      quiz: [
        {
          q: "Que se passe-t-il si l’entreprise manque une date de réponse ?",
          choices: [
            "Rien — c’est interne",
            "L’honneur public baisse",
            "On envoie un mail automatique",
          ],
          answer: 1,
        },
        {
          q: "Un manager vous demande de ghoster un candidat « pas assez senior ». Vous :",
          choices: [
            "Obéissez, le volume prime",
            "Refusez : le pacte est public",
            "Proposez un « on garde le CV »",
          ],
          answer: 1,
        },
        {
          q: "La grille d’évaluation d’une offre Vera est :",
          choices: ["Cachée dans l’ATS", "Publique avant candidature", "Révélée en dernier tour"],
          answer: 1,
        },
      ],
    },
  ];
  return {
    slug: "accueil",
    title: `Accueil ${name}`,
    excerpt: `Pacte, grille, honneur. Ce que ${name} exige des candidats, elle l’exige des salariés.`,
    audience: "employee",
    category: "accueil",
    mandatory: true,
    sort: 10,
    modules: mods,
  };
}

function safetyPack(name: string): SeedCourse {
  const mods: SeedModule[] = [
    {
      slug: "loto",
      title: "Consignation : le cadenas avant la clé",
      kicker: "Sécurité",
      minutes: 8,
      kind: "lesson",
      body: [
        `Chez ${name}, une ligne « à l’arrêt » n’est pas consignataire. Identifier les énergies, séparer, cadenas perso, essai de remise, mesure à zéro. Inverser deux étapes, c’est un accident.`,
        `Un cadenas partagé = 0. Le chef qui dit « on n’a pas le temps » n’est pas un chef. L’accueil l’a déjà dit : le pacte interne vaut aussi pour la peau.`,
      ],
    },
    {
      slug: "epi",
      title: "EPI avant le planning",
      kicker: "Hauteur / chantier",
      minutes: 5,
      kind: "drill",
      body: [
        `Harnais contrôlé, point d’ancrage, puis le geste. ${name} refuse les offres où la hauteur n’est pas écrite. L’interne non plus.`,
        `Drill : photographiez le cadenas et l’EPI avant d’ouvrir le ticket GMAO. Pas de photo, pas de preuve.`,
      ],
    },
    {
      slug: "quiz-loto",
      title: "Ordre LOTO",
      kicker: "Quiz",
      minutes: 4,
      kind: "quiz",
      body: [`L’ordre n’est pas un slogan.`],
      quiz: [
        {
          q: "Quel est le bon ordre ?",
          choices: [
            "Mesure → cadenas → essai de remise",
            "Identifier → séparer → cadenas perso → essai → mesure à zéro",
            "Couper le disjoncteur et commencer",
          ],
          answer: 1,
        },
        {
          q: "Un cadenas partagé :",
          choices: ["Va si le chef le dit", "Score 0, accident en attente", "OK pour 10 minutes"],
          answer: 1,
        },
      ],
    },
  ];
  return {
    slug: "securite-geste",
    title: `Sécurité terrain — ${name}`,
    excerpt: "Consignation, EPI, preuve photo. Obligatoire avant le premier chantier.",
    audience: "employee",
    category: "securite",
    mandatory: true,
    sort: 20,
    modules: mods,
  };
}

function carePack(name: string): SeedCourse {
  const mods: SeedModule[] = [
    {
      slug: "plafond",
      title: "Cinq personnes, pas neuf",
      kicker: "Charge",
      minutes: 6,
      kind: "lesson",
      body: [
        `Chez ${name}, le plafond s’écrit. Accepter une sixième « pour dépanner », c’est signer l’arrêt à six mois.`,
        `Le geste : dire le nombre, proposer un report, alerter la coordinatrice. Pas « on verra ce soir ».`,
      ],
    },
    {
      slug: "transmission",
      title: "Transmettre sans brûler",
      kicker: "Relève",
      minutes: 5,
      kind: "lesson",
      body: [
        `Une relève soignante n’est pas un WhatsApp. Trois faits, un risque, un nom. ${name} note la transmission, pas le dévouement.`,
      ],
    },
    {
      slug: "quiz-soin",
      title: "Tenir le plafond",
      kicker: "Quiz",
      minutes: 3,
      kind: "quiz",
      body: [`Un oui de trop = score < 55.`],
      quiz: [
        {
          q: "Une sixième personne « en dépannage » :",
          choices: ["C’est l’esprit d’équipe", "C’est un non, avec report proposé", "On verra ce soir"],
          answer: 1,
        },
      ],
    },
  ];
  return {
    slug: "soin-tenu",
    title: `Soin tenu — ${name}`,
    excerpt: "Plafond de tournée, transmission, pas la vocation en slide.",
    audience: "employee",
    category: "metier",
    mandatory: true,
    sort: 20,
    modules: mods,
  };
}

function writingPack(name: string): SeedCourse {
  const mods: SeedModule[] = [
    {
      slug: "rfc",
      title: "Écrire avant de réunir",
      kicker: "Async",
      minutes: 7,
      kind: "lesson",
      body: [
        `${name} n’existe pas par stand-up. Une RFC de deux pages, un arbitrage nommé, un mercredi mort s’il est écrit.`,
        `Un meeting pour « aligner » sans document est un coût. Vous le refusez comme un ghost job.`,
      ],
    },
    {
      slug: "garde-fous",
      title: "Guardrails before the demo",
      kicker: "Agents",
      minutes: 8,
      kind: "lesson",
      body: [
        `Un agent qui « envoie juste le mail client » sans allow-list n’est pas un produit. C’est un incident.`,
        `Ordre ${name} : allow-list → traces (nom, args, résultat, policy) → golden set → confirm humain au-dessus du risque.`,
      ],
    },
    {
      slug: "quiz-async",
      title: "Async tenu",
      kicker: "Quiz",
      minutes: 3,
      kind: "quiz",
      body: [`Le prompt n’est pas un contrôle.`],
      quiz: [
        {
          q: "Un agent sans allow-list :",
          choices: ["Ship, on verra", "Incident en attente", "OK en staging"],
          answer: 1,
        },
        {
          q: "Une réunion sans RFC :",
          choices: ["Culture d’équipe", "Coût que l’on refuse", "Décision plus rapide"],
          answer: 1,
        },
      ],
    },
  ];
  return {
    slug: "ecriture-async",
    title: `Écriture & agents — ${name}`,
    excerpt: "RFC avant réunion. Guardrails avant démo. Pas un prompt magique.",
    audience: "employee",
    category: "metier",
    mandatory: false,
    sort: 20,
    modules: mods,
  };
}

function salesPack(name: string): SeedCourse {
  const mods: SeedModule[] = [
    {
      slug: "cycle",
      title: "Le cycle n’est pas un quota mensuel",
      kicker: "B2G / ENR",
      minutes: 6,
      kind: "lesson",
      body: [
        `Chez ${name}, un closer qui vit au mois se casse les dents. 6 à 18 mois, une perte racontée, des comptes nommés.`,
        `Le deck en premier brûle un guanxi. La preuve avant la relation brûle un élu. Nommez le code.`,
      ],
    },
    {
      slug: "quiz-cycle",
      title: "Tenir le cycle",
      kicker: "Quiz",
      minutes: 3,
      kind: "quiz",
      body: [`HSK cocktail ne suffit pas.`],
      quiz: [
        {
          q: "Un quota mensuel sur un marché public :",
          choices: ["Motive l’équipe", "Tue le poste", "Se négocie en variable"],
          answer: 1,
        },
      ],
    },
  ];
  return {
    slug: "cycle-long",
    title: `Cycle long — ${name}`,
    excerpt: "Comptes nommés, pertes racontées, pas un ARR de salon.",
    audience: "employee",
    category: "metier",
    mandatory: false,
    sort: 25,
    modules: mods,
  };
}

function candidatePack(name: string): SeedCourse {
  const mods: SeedModule[] = [
    {
      slug: "lire-avant",
      title: `Lire ${name} avant d’écrire`,
      kicker: "Candidat",
      minutes: 5,
      kind: "lesson",
      body: [
        `Salaire publié, grille publique, pacte daté, le difficile nommé. Si ça manque, ce n’est pas ${name} — ou ce n’est pas Vera.`,
        `Un 40/100 sur la grille n’est pas un mystère ATS. Relisez, tenez le geste, renvoyez. Mentir sur un booléen baisse plus que l’avouer.`,
      ],
    },
    {
      slug: "module-geste",
      title: "Le geste manque ? Un module, pas un silence",
      kicker: "Préformation",
      minutes: 5,
      kind: "lesson",
      body: [
        `${name} ouvre ses parcours salariés aux candidats sur les modules marqués « les deux ». Vous préparez l’épreuve ici, pas dans un PDF perdu.`,
        `Score 55 : vous rejouez. Score 80 : le dossier s’ouvre. Indeed n’a aucun intérêt à faire ça.`,
      ],
    },
    {
      slug: "quiz-candidat",
      title: "Avant d’envoyer",
      kicker: "Quiz",
      minutes: 3,
      kind: "quiz",
      body: [`Trois faits. Pas quatre pages.`],
      quiz: [
        {
          q: "La grille est trop basse. Vous :",
          choices: [
            "Candidatez quand même, l’IA matcherait",
            "Tenez le module, rejouez l’épreuve",
            "Inventez le critère booléen",
          ],
          answer: 1,
        },
      ],
    },
  ];
  return {
    slug: "avant-de-postuler",
    title: `Avant de postuler chez ${name}`,
    excerpt: "Lire la grille, préparer le geste, ne pas mentir sur un critère.",
    audience: "both",
    category: "candidat",
    mandatory: false,
    sort: 80,
    modules: mods,
  };
}

function industryCourses(name: string, industry: string, slug: string): SeedCourse[] {
  const ind = industry.toLowerCase();
  const s = slug.toLowerCase();
  const out: SeedCourse[] = [onboarding(name)];
  if (
    /industrie|énergie|energie|bâtiment|batiment|transport/.test(ind) ||
    /releve|kora|nucl|volt|fils|rondes|naval|quai/.test(s)
  ) {
    out.push(safetyPack(name));
  } else if (/santé|sante|soin/.test(ind) || /lise|mireille|soin|domicile/.test(s)) {
    out.push(carePack(name));
  } else if (
    /outil|fintech|climat|aéro|aero|média|media/.test(ind) ||
    /sable|lumina|helios|orbital|relais/.test(s)
  ) {
    out.push(writingPack(name));
  } else if (/logistique|luxe|design/.test(ind) || /northline|vale|atelier/.test(s)) {
    out.push(salesPack(name));
  } else {
    out.push(writingPack(name));
  }
  out.push(candidatePack(name));
  return out;
}

async function seedAcademyOnce(sql: Sql): Promise<void> {
  const houses = await sql<{ id: number; slug: string; name: string; industry: string }>`
    select id, slug, name, industry from companies order by id
  `;
  if (!houses.length) return;
  const haveRows = await sql<{ company_id: number }>`
    select distinct company_id from academy_courses
  `;
  const have = new Set(haveRows.map((r) => r.company_id));
  const missing = houses.filter((h) => !have.has(h.id));
  if (!missing.length) return;

  const courseValues: unknown[] = [];
  const coursePh: string[] = [];
  const plans: { companyId: number; slug: string; modules: SeedModule[] }[] = [];
  let n = 1;
  for (const h of missing) {
    for (const c of industryCourses(h.name, h.industry, h.slug)) {
      coursePh.push(
        `($${n++},$${n++},$${n++},$${n++},$${n++},$${n++},$${n++},$${n++},$${n++},$${n++})`,
      );
      courseValues.push(
        h.id,
        c.slug,
        c.title,
        c.excerpt,
        c.audience,
        c.category,
        minutesOf(c.modules),
        c.mandatory,
        true,
        c.sort,
      );
      plans.push({ companyId: h.id, slug: c.slug, modules: c.modules });
    }
  }
  if (!coursePh.length) return;
  await sql.query(
    `insert into academy_courses (
      company_id, slug, title, excerpt, audience, category, minutes, mandatory, published, sort_order
    ) values ${coursePh.join(",")}`,
    courseValues,
  );

  const inserted = await sql<{ id: number; company_id: number; slug: string }>`
    select id, company_id, slug from academy_courses
  `;
  const idOf = new Map(inserted.map((r) => [`${r.company_id}:${r.slug}`, r.id]));

  const modValues: unknown[] = [];
  const modPh: string[] = [];
  n = 1;
  for (const p of plans) {
    const courseId = idOf.get(`${p.companyId}:${p.slug}`);
    if (!courseId) continue;
    let order = 10;
    for (const m of p.modules) {
      modPh.push(`($${n++},$${n++},$${n++},$${n++},$${n++},$${n++},$${n++},$${n++},$${n++})`);
      modValues.push(
        courseId,
        m.slug,
        m.title,
        m.kicker,
        m.body.join("\n\n"),
        m.kind,
        m.minutes,
        order,
        JSON.stringify(m.quiz ?? []),
      );
      order += 10;
    }
  }
  if (!modPh.length) return;
  const CHUNK = 80;
  for (let i = 0; i < modPh.length; i += CHUNK) {
    const slicePh = modPh.slice(i, i + CHUNK);
    const per = 9;
    const sliceVals = modValues.slice(i * per, (i + CHUNK) * per);
    const remapped: string[] = [];
    let k = 1;
    for (let j = 0; j < slicePh.length; j += 1) {
      remapped.push(
        `($${k++},$${k++},$${k++},$${k++},$${k++},$${k++},$${k++},$${k++},$${k++})`,
      );
    }
    await sql.query(
      `insert into academy_modules (
        course_id, slug, title, kicker, body, kind, minutes, sort_order, quiz_json
      ) values ${remapped.join(",")}`,
      sliceVals,
    );
  }
}

export async function seedAcademy(sql: Sql): Promise<void> {
  const g = globalThis as typeof globalThis & { __veraAcademySeeded__?: Promise<void> };
  g.__veraAcademySeeded__ ??= seedAcademyOnce(sql).catch((err) => {
    g.__veraAcademySeeded__ = undefined;
    throw err;
  });
  return g.__veraAcademySeeded__;
}

