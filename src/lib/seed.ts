import { seedAcademy } from "./academy-seed";
import { seedCck } from "./cck-seed";
import { seedDriveMedia } from "./drive-seed";
import { seedHub } from "./hub-seed";
import type { Sql } from "./db";
import { packForJob } from "./offer-data";
import { HOUSE_PACT } from "./pact";
import { decisionDaysFor, hoursOf, processForJob } from "./process";
import { INTL_COMPANIES, INTL_JOBS } from "./intl-seed";
import { COMPANIES, JOBS } from "./seed-data";
import { GEO_COMPANIES, GEO_JOBS } from "./seed-geo";
import { VOLUME_COMPANIES, VOLUME_JOBS } from "./seed-volume";

const ALL_COMPANIES = [...COMPANIES, ...GEO_COMPANIES, ...VOLUME_COMPANIES, ...INTL_COMPANIES];
const ALL_JOBS = [...JOBS, ...GEO_JOBS, ...VOLUME_JOBS, ...INTL_JOBS];

async function ensureMoatSchema(sql: Sql): Promise<void> {
  await sql.query(
    `alter table companies add column if not exists response_sla_days int not null default 10`,
  );
  await sql.query(`alter table companies add column if not exists honor_score int not null default 86`);
  await sql.query(`alter table companies add column if not exists honor_answered int not null default 0`);
  await sql.query(`alter table companies add column if not exists honor_due int not null default 0`);
  await sql.query(`alter table jobs add column if not exists process_json text not null default '[]'`);
  await sql.query(`alter table jobs add column if not exists process_hours real not null default 6`);
  await sql.query(`alter table jobs add column if not exists decision_days int not null default 14`);
  await sql.query(`alter table jobs add column if not exists offer_json text not null default '{}'`);
  await sql.query(`alter table applications add column if not exists due_at timestamptz`);
  await sql.query(`alter table applications add column if not exists answered_at timestamptz`);
  await sql.query(
    `alter table applications add column if not exists pact_breached boolean not null default false`,
  );
  await sql.query(
    `alter table applications add column if not exists brief_attached boolean not null default false`,
  );
  await sql.query(`alter table applications add column if not exists trial_score int`);
  await sql.query(`alter table applications add column if not exists trial_json text`);
  await sql.query(`alter table applications add column if not exists fit_score int`);
  await sql.query(`alter table applications add column if not exists grid_json text`);
  await sql.query(`alter table jobs add column if not exists grid_json text not null default '{}'`);
  await sql.query(`
    create table if not exists briefs (
      user_id text primary key,
      shipped_json text not null default '[]',
      refuse_json text not null default '[]',
      next_chapter text,
      working_style text,
      updated_at timestamptz not null default now()
    )
  `);
  await sql.query(`
    create table if not exists quiet_signals (
      user_id text not null,
      job_id int not null references jobs(id) on delete cascade,
      created_at timestamptz not null default now(),
      primary key (user_id, job_id)
    )
  `);
  await sql.query(`alter table jobs add column if not exists pool text`);
  await sql.query(`alter table profiles add column if not exists public_slug text`);
  await sql.query(`alter table profiles add column if not exists slasher boolean not null default false`);
  await sql.query(`alter table profiles add column if not exists hours_week int`);
  await sql.query(`alter table profiles add column if not exists pool_prefs_json text not null default '[]'`);
  await sql.query(`alter table profiles add column if not exists role text not null default 'candidate'`);
  await sql.query(`alter table profiles add column if not exists house_slug text`);
  await sql.query(`alter table profiles add column if not exists barriers_json text not null default '[]'`);
  await sql.query(`alter table profiles add column if not exists availability_json text not null default '[]'`);
  await sql.query(`alter table jobs add column if not exists barriers_json text not null default '[]'`);
  await sql.query(`alter table jobs add column if not exists trybuy_json text`);
  await sql.query(`alter table jobs add column if not exists slots_json text not null default '[]'`);
  await sql.query(`alter table applications add column if not exists trial_json text`);
  await sql.query(`alter table applications add column if not exists feedback_json text`);
  await sql.query(`alter table applications add column if not exists miss_json text not null default '[]'`);
  await sql.query(`
    create table if not exists slots (
      id serial primary key,
      job_id int not null references jobs(id) on delete cascade,
      weekday int not null,
      start_hour int not null,
      hours int not null,
      city text not null,
      seats int not null default 1
    )
  `);
  await sql.query(`
    create table if not exists slot_claims (
      user_id text not null,
      slot_id int not null references slots(id) on delete cascade,
      status text not null default 'held',
      created_at timestamptz not null default now(),
      primary key (user_id, slot_id)
    )
  `);
  await sql.query(`
    create table if not exists ppqc_invoices (
      id serial primary key,
      application_id int not null references applications(id) on delete cascade,
      company_id int not null references companies(id) on delete cascade,
      job_id int not null references jobs(id) on delete cascade,
      euros int not null,
      status text not null default 'due',
      created_at timestamptz not null default now(),
      paid_at timestamptz
    )
  `);
  await sql.query(`create unique index if not exists ppqc_invoices_app_uidx on ppqc_invoices (application_id)`);
  await sql.query(`
    create table if not exists proof_files (
      id serial primary key,
      user_id text not null,
      article_id int,
      file_name text not null,
      mime text not null,
      body_b64 text not null,
      byte_size int not null,
      created_at timestamptz not null default now()
    )
  `);
  await sql.query(`
    create table if not exists lessons_done (
      user_id text not null,
      lesson_slug text not null,
      created_at timestamptz not null default now(),
      primary key (user_id, lesson_slug)
    )
  `);
  await sql.query(`
    create table if not exists articles (
      id serial primary key,
      slug text unique not null,
      title text not null,
      excerpt text not null,
      body text not null,
      kind text not null default 'article',
      tags_json text not null default '[]',
      file_name text,
      file_note text,
      author_kind text not null,
      author_name text not null,
      author_slug text not null,
      user_id text,
      company_id int references companies(id) on delete set null,
      published boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await sql.query(`
    create table if not exists aptitude_badges (
      id serial primary key,
      user_id text not null,
      job_id int references jobs(id) on delete set null,
      family text not null,
      label text not null,
      score int not null,
      created_at timestamptz not null default now()
    )
  `);
  await sql.query(`
    create table if not exists skill_ledger (
      id serial primary key,
      user_id text not null,
      arena_id text not null,
      skill_tag text not null,
      title text not null,
      score int not null,
      passed boolean not null default false,
      attempt_no int not null default 1,
      evidence text not null default '',
      created_at timestamptz not null default now()
    )
  `);
  await sql.query(`create index if not exists skill_ledger_user_idx on skill_ledger (user_id, created_at desc)`);
  await sql.query(`
    create table if not exists arena_attempts (
      id serial primary key,
      user_id text not null,
      arena_id text not null,
      score int not null,
      passed boolean not null default false,
      missed_json text not null default '[]',
      attempt_no int not null default 1,
      created_at timestamptz not null default now()
    )
  `);
  await sql.query(`create index if not exists arena_attempts_user_idx on arena_attempts (user_id, arena_id)`);
}

async function insertHousesAndJobs(sql: Sql): Promise<void> {
  const [{ n }] = await sql<{ n: number }>`select count(*)::int as n from companies`;
  if (n >= ALL_COMPANIES.length) {
    const [{ jn }] = await sql<{ jn: number }>`select count(*)::int as jn from jobs`;
    if (jn >= ALL_JOBS.length) {
      /* continue to articles */
    } else {
      /* insert missing jobs below */
    }
  }
  for (const c of ALL_COMPANIES) {
    await sql`
      insert into companies (
        slug, name, tagline, about, industry, size_band, hq_city, hq_country,
        website, founded_year, culture_score, hiring_velocity, values_json
      ) values (
        ${c.slug}, ${c.name}, ${c.tagline}, ${c.about}, ${c.industry}, ${c.sizeBand},
        ${c.hqCity}, ${c.hqCountry}, ${c.website}, ${c.foundedYear}, ${c.cultureScore},
        ${c.hiringVelocity}, ${JSON.stringify(c.values)}
      )
      on conflict (slug) do update set
        about = excluded.about,
        values_json = excluded.values_json
    `;
  }

  const companyRows = await sql<{ id: number; slug: string }>`select id, slug from companies`;
  const idBySlug = new Map(companyRows.map((r) => [r.slug, r.id]));

  for (const j of ALL_JOBS) {
    const companyId = idBySlug.get(j.companySlug);
    if (!companyId) continue;
    const posted = new Date(Date.now() - j.daysAgo * 86_400_000).toISOString();
    const location = `${j.city}, ${j.country}`;
    await sql`
      insert into jobs (
        company_id, slug, title, team, location, city, country, remote_type,
        contract, seniority, salary_min, salary_max, currency, equity, description,
        responsibilities_json, requirements_json, nice_json, benefits_json,
        skills_json, posted_at, applicants_count, views_count, ghost_risk, collection, pool,
        barriers_json, trybuy_json, slots_json
      ) values (
        ${companyId}, ${j.slug}, ${j.title}, ${j.team}, ${location}, ${j.city}, ${j.country},
        ${j.remoteType}, ${j.contract}, ${j.seniority}, ${j.salaryMin}, ${j.salaryMax},
        ${"EUR"}, ${j.equity}, ${j.description},
        ${JSON.stringify(j.responsibilities)}, ${JSON.stringify(j.requirements)},
        ${JSON.stringify(j.nice)}, ${JSON.stringify(j.benefits)},
        ${JSON.stringify(j.skills)}, ${posted}, ${j.applicants}, ${j.views},
        ${j.ghostRisk}, ${j.collection}, ${j.pool ?? null},
        ${JSON.stringify(j.barriers ?? [])}, ${j.tryBuy ? JSON.stringify(j.tryBuy) : null},
        ${JSON.stringify(j.slots ?? [])}
      )
      on conflict (slug) do update set
        team = excluded.team,
        description = excluded.description,
        benefits_json = excluded.benefits_json,
        requirements_json = excluded.requirements_json
    `;
  }

  for (const j of ALL_JOBS) {
    if (!j.barriers?.length && !j.tryBuy && !j.slots?.length) continue;
    await sql`
      update jobs
      set barriers_json = ${JSON.stringify(j.barriers ?? [])},
          trybuy_json = ${j.tryBuy ? JSON.stringify(j.tryBuy) : null},
          slots_json = ${JSON.stringify(j.slots ?? [])}
      where slug = ${j.slug}
    `;
  }

  const [{ sn }] = await sql<{ sn: number }>`select count(*)::int as sn from slots`;
  const jobRows = await sql<{ id: number; slug: string }>`select id, slug from jobs`;
  const jobId = new Map(jobRows.map((r) => [r.slug, r.id]));
  if (sn === 0) {
    for (const j of ALL_JOBS) {
      const id = jobId.get(j.slug);
      if (!id || !j.slots?.length) continue;
      for (const s of j.slots) {
        await sql`
          insert into slots (job_id, weekday, start_hour, hours, city, seats)
          values (${id}, ${s.weekday}, ${s.startHour}, ${s.hours}, ${s.city}, ${s.seats})
        `;
      }
    }
  } else {
    for (const j of ALL_JOBS) {
      if (!j.slots?.length) continue;
      const id = jobId.get(j.slug);
      if (!id) continue;
      const [{ n }] = await sql<{ n: number }>`select count(*)::int as n from slots where job_id = ${id}`;
      if (n > 0) continue;
      for (const s of j.slots) {
        await sql`
          insert into slots (job_id, weekday, start_hour, hours, city, seats)
          values (${id}, ${s.weekday}, ${s.startHour}, ${s.hours}, ${s.city}, ${s.seats})
        `;
      }
    }
  }

  for (const j of VOLUME_JOBS) {
    await sql`
      update jobs set title = ${j.title}, description = ${j.description}
      where slug = ${j.slug}
    `;
  }

  {
    const idBy = new Map((await sql<{ id: number; slug: string }>`select id, slug from companies`).map((r) => [r.slug, r.id]));
    const seedArts: {
      slug: string;
      title: string;
      excerpt: string;
      body: string;
      kind: string;
      tags: string[];
      authorKind: string;
      authorName: string;
      authorSlug: string;
      companySlug?: string;
      fileName?: string;
      fileNote?: string;
    }[] = [
      {
        slug: "consignation-fos-ce-que-le-lundi-enseigne",
        title: "Consignation à Fos : ce que le premier lundi enseigne",
        excerpt: "Un cadenas perso, une ligne arrêtée, un junior qui regarde. Relève écrit le geste.",
        body: "La consignation n’est pas un module e-learning. C’est un lundi à 5 h 40, une presse, un cadenas qui n’est pas celui du collègue. Chez Relève on arrête la ligne pour former — c’est écrit, c’est payé. Les entreprises qui « formeront sur le tas » n’ont pas de page ici.\n\nLe dossier PDF de 40 pages Pôle emploi ne dit pas ça. Une épreuve machine de trois minutes, si.",
        kind: "article",
        tags: ["maintenance", "Fos", "consignation"],
        authorKind: "company",
        authorName: "Relève",
        authorSlug: "releve",
        companySlug: "releve",
      },
      {
        slug: "guanxi-ce-que-10-ans-asie-ne-veut-pas-dire",
        title: "Guanxi : ce que « 10 ans en Asie » ne veut pas dire",
        excerpt: "Trois portes nommées. Un yes qui veut dire j’ai entendu. Northline publie la grille.",
        body: "Le CV corridor est un genre littéraire. Northline demande trois portes, un niveau de mandarin de négo, et ce que vous faites quand le yes veut dire j’ai entendu. C’est public. Les ATS cachent ça. Les agents IA, via le Markdown, le lisent.",
        kind: "article",
        tags: ["Asie", "guanxi", "commercial"],
        authorKind: "company",
        authorName: "Northline",
        authorSlug: "northline",
        companySlug: "northline",
      },
      {
        slug: "plafond-cinq-personnes-lyon",
        title: "Pourquoi cinq personnes par jour, pas neuf",
        excerpt: "Maison Lise : le dos, les familles, la tournée. Un PDF de vocation n’y change rien.",
        body: "Neuf personnes, c’est un arrêt maladie à six mois. Cinq, des trajets payés, une coordinatrice nommée. On publie le plafond. Les plans à 9 restent sur les jobboards de volume.",
        kind: "article",
        tags: ["soin", "Lyon", "tournée"],
        authorKind: "company",
        authorName: "Maison Lise",
        authorSlug: "lise",
        companySlug: "lise",
      },
      {
        slug: "schema-onduleur-diagnostic",
        title: "Fichier : schéma onduleur — diagnostic 8 minutes",
        excerpt: "Le schéma de l’épreuve Kora, annoté. Pour ceux qui veulent s’entraîner avant de candidater.",
        body: "Pas un secret d’entreprise : le geste. L’épreuve est dans l’offre. Ce fichier est le même schéma, avec les trois erreurs fréquentes en marge.",
        kind: "fichier",
        tags: ["électrique", "PV", "épreuve"],
        authorKind: "company",
        authorName: "Kora",
        authorSlug: "kora",
        companySlug: "kora",
        fileName: "schema-onduleur-kora.pdf",
        fileNote: "Schéma pédagogique — 2 pages. Pas un plan de chantier client.",
      },
      {
        slug: "carnet-consignation-malik",
        title: "Preuves : trois arrêts de ligne que j’ai tenus",
        excerpt: "Un technicien Fos écrit ses preuves. Ça remplace le CV chronologique.",
        body: "2019 : presse 4, vanne bloquée, consignation à deux. 2022 : CACES 3 passé en interne. 2025 : j’ai dit non à un 3×8 non écrit. C’est le brief. Les entreprises qui veulent un PDF de 4 pages ne sont pas ici.",
        kind: "note",
        tags: ["maintenance", "brief", "Fos"],
        authorKind: "candidate",
        authorName: "Malik B.",
        authorSlug: "malik-b",
      },
      {
        slug: "lettre-pac-nantes",
        title: "PAC air-eau : les trois pannes que je vois encore",
        excerpt: "Un chauffagiste Nantes documente. Compétence avant candidature.",
        body: "Détente bouchée, sonde mal posée, client qui a coupé le tarif heures creuses. L’épreuve Loire Chaleur copie ces cas. Je les écris pour que le score de grille ne soit pas une surprise.",
        kind: "article",
        tags: ["PAC", "Nantes", "plomberie"],
        authorKind: "candidate",
        authorName: "Hélène R.",
        authorSlug: "helene-r",
      },
    ];
    for (const a of seedArts) {
      await sql`
        insert into articles (
          slug, title, excerpt, body, kind, tags_json, file_name, file_note,
          author_kind, author_name, author_slug, company_id, published
        ) values (
          ${a.slug}, ${a.title}, ${a.excerpt}, ${a.body}, ${a.kind},
          ${JSON.stringify(a.tags)}, ${a.fileName ?? null}, ${a.fileNote ?? null},
          ${a.authorKind}, ${a.authorName}, ${a.authorSlug},
          ${a.companySlug ? (idBy.get(a.companySlug) ?? null) : null}, ${true}
        )
        on conflict (slug) do update set
          excerpt = excluded.excerpt,
          body = excluded.body
      `;
    }
  }
}

async function ensureMoatBackfill(sql: Sql): Promise<void> {
  const probe = await sql<{ honor_due: number }>`
    select honor_due from companies where slug = ${"sable"} limit 1
  `;
  const seeded = (probe[0]?.honor_due ?? 0) > 0;

  if (!seeded) {
    for (const [slug, pact] of Object.entries(HOUSE_PACT)) {
      await sql`
        update companies set
          response_sla_days = ${pact.slaDays},
          honor_score = ${pact.honorScore},
          honor_answered = ${pact.honorAnswered},
          honor_due = ${pact.honorDue}
        where slug = ${slug}
      `;
    }
  } else {
    for (const [slug, pact] of Object.entries(HOUSE_PACT)) {
      await sql`update companies set response_sla_days = ${pact.slaDays} where slug = ${slug}`;
    }
    for (const slug of ["releve", "lise"] as const) {
      const pact = HOUSE_PACT[slug];
      if (!pact) continue;
      await sql`
        update companies set
          honor_score = ${pact.honorScore},
          honor_answered = ${pact.honorAnswered},
          honor_due = ${pact.honorDue},
          response_sla_days = ${pact.slaDays}
        where slug = ${slug} and honor_due = 0
      `;
    }
  }

  for (const j of ALL_JOBS) {
    const steps = processForJob(j);
    const hours = hoursOf(steps);
    const decision = decisionDaysFor(j);
    await sql`
      update jobs
      set process_json = ${JSON.stringify(steps)},
          process_hours = ${hours},
          decision_days = ${decision}
      where slug = ${j.slug} and process_json = '[]'
    `;
  }
}

async function ensureOfferBackfill(sql: Sql): Promise<void> {
  const probe = await sql<{ offer_json: string }>`
    select offer_json from jobs where slug = ${"technicien-maintenance-releve"} limit 1
  `;
  const packed = (probe[0]?.offer_json ?? "").includes("Relève renouvelle");
  const empty = await sql<{ n: number }>`
    select count(*)::int as n from jobs where offer_json = '{}' or offer_json = '' or offer_json is null
  `;
  const staleSim = await sql<{ n: number }>`
    select count(*)::int as n from jobs
    where offer_json like ${"%circuit%"} and offer_json not like ${"%isolate%"}
  `;
  if (packed && (empty[0]?.n ?? 0) === 0 && (staleSim[0]?.n ?? 0) === 0) return;

  const companyRows = await sql<{ slug: string; industry: string }>`select slug, industry from companies`;
  const industryBySlug = new Map(companyRows.map((r) => [r.slug, r.industry]));
  for (const j of ALL_JOBS) {
    const pack = packForJob({ ...j, industry: industryBySlug.get(j.companySlug) });
    await sql`update jobs set offer_json = ${JSON.stringify(pack)} where slug = ${j.slug}`;
  }
}

export async function ensureSeeded(sql: Sql): Promise<void> {
  const g = globalThis as typeof globalThis & { __veraSeeded__?: Promise<void> };
  g.__veraSeeded__ ??= (async () => {
    await ensureMoatSchema(sql);
    await insertHousesAndJobs(sql);
    await ensureMoatBackfill(sql);
    await ensureOfferBackfill(sql);
    await seedHub(sql);
    await seedAcademy(sql);
    await seedCck(sql);
    await seedDriveMedia(sql);
  })().catch((err) => {
    g.__veraSeeded__ = undefined;
    throw err;
  });
  return g.__veraSeeded__;
}
