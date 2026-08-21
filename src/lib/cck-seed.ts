import type { Sql } from "./db";

const TYPES = [
  { slug: "job", entity: "job", label: "Offre", description: "Champs publics d’une offre — les mêmes kinds que JoomCCK (texte, médias, relations)." },
  { slug: "course", entity: "course", label: "Parcours", description: "Champs d’un parcours académie, y compris preuves d’embauche." },
  { slug: "article", entity: "article", label: "Journal", description: "Champs d’un article de blog entreprise." },
  { slug: "meet", entity: "meet", label: "Rendez-vous", description: "Créneaux visite / entretien / info." },
] as const;

const FIELDS: {
  type: string;
  name: string;
  label: string;
  kind: string;
  options?: string[];
  onList?: boolean;
  onCard?: boolean;
  filterable?: boolean;
  hint: string;
  weight: number;
}[] = [
  { type: "job", name: "epreuve", label: "Épreuve avant CV", kind: "bool", onCard: true, onList: true, filterable: true, hint: "Le candidat tient un geste avant les coordonnées.", weight: 10 },
  { type: "job", name: "epreuve_kind", label: "Type d’épreuve", kind: "choice", options: ["machine", "lockout", "circuit", "care", "code"], onCard: true, filterable: true, hint: "Geste en étapes, consignation, schéma, soin, code.", weight: 12 },
  { type: "job", name: "epreuve_brief", label: "Brief d’épreuve", kind: "textarea", hint: "Ce que le candidat doit tenir. Pas un slogan RH.", weight: 14 },
  { type: "job", name: "epreuve_symptom", label: "Symptôme", kind: "textarea", hint: "La situation réelle, une phrase.", weight: 16 },
  { type: "job", name: "epreuve_steps", label: "Étapes", kind: "textarea", hint: "Une étape par ligne, dans l’ordre.", weight: 18 },
  { type: "job", name: "epreuve_trap", label: "Piège", kind: "text", hint: "Le geste faux qui met le score à 0.", weight: 19 },
  { type: "job", name: "salaire_public", label: "Salaire publié", kind: "bool", onCard: true, onList: true, filterable: true, hint: "Fourchette visible, pas « selon profil ».", weight: 20 },
  { type: "job", name: "pacte_jours", label: "Pacte (jours)", kind: "number", onCard: true, hint: "Délai de réponse écrit.", weight: 30 },
  { type: "job", name: "outils", label: "Outils du poste", kind: "textarea", hint: "Nommés, pas « environnement moderne ».", weight: 40 },
  { type: "job", name: "image", label: "Image", kind: "image", onCard: true, hint: "Une photo du poste, pas un moodboard.", weight: 44 },
  { type: "job", name: "gallery", label: "Galerie", kind: "gallery", hint: "Plusieurs images, URLs Drive séparées par des virgules.", weight: 46 },
  { type: "job", name: "video", label: "Vidéo", kind: "video", hint: "Visite ou geste filmé.", weight: 48 },
  { type: "job", name: "audio", label: "Audio", kind: "audio", hint: "Voix collègue, pas un jingle.", weight: 49 },
  { type: "job", name: "visite_video", label: "Vidéo du poste", kind: "url", hint: "URL interne Drive /offer.", weight: 50 },
  { type: "job", name: "file", label: "Fichier", kind: "file", hint: "Mode opératoire, PDF, schéma.", weight: 52 },
  { type: "job", name: "vivier", label: "Vivier", kind: "choice", options: ["", "senior-fractional", "rsa", "binome", "reprise", "slasher"], onList: true, filterable: true, hint: "Profil oublié visé.", weight: 60 },
  { type: "job", name: "contact_email", label: "E-mail public", kind: "email", hint: "Pas un formulaire orphelin.", weight: 70 },
  { type: "job", name: "contact_tel", label: "Téléphone", kind: "tel", hint: "Ligne directe, optionnelle.", weight: 72 },
  { type: "job", name: "published_at", label: "Publiée le", kind: "datetime", hint: "Date ISO.", weight: 74 },
  { type: "job", name: "status", label: "Statut", kind: "status", options: ["ouverte", "pause", "pourvue"], onList: true, filterable: true, hint: "Ouverte, pause, pourvue.", weight: 76 },
  { type: "job", name: "related_course", label: "Parcours lié", kind: "relation", hint: "Slug du module qui monte la grille.", weight: 80 },
  { type: "course", name: "skill_tags", label: "Gestes", kind: "text", onCard: true, hint: "Tags de grille (consignation, FHIR…).", weight: 10 },
  { type: "course", name: "grid_family", label: "Famille de grille", kind: "choice", options: ["terrain", "soin", "tech", "commercial", "asie", "design"], filterable: true, hint: "Le module tenu monte cette grille.", weight: 20 },
  { type: "course", name: "hires", label: "Embauches issues du module", kind: "number", onCard: true, onList: true, hint: "Preuve publique, pas un slogan L&D.", weight: 30 },
  { type: "course", name: "image", label: "Image", kind: "image", onCard: true, hint: "Visuel du parcours.", weight: 40 },
  { type: "course", name: "video", label: "Vidéo", kind: "video", hint: "Démo du geste.", weight: 42 },
  { type: "course", name: "gallery", label: "Galerie", kind: "gallery", hint: "Photos du module.", weight: 44 },
  { type: "article", name: "cover", label: "Couverture", kind: "media", hint: "Image du journal.", weight: 10 },
  { type: "article", name: "image", label: "Image", kind: "image", hint: "Une photo, pas un stock.", weight: 12 },
  { type: "article", name: "gallery", label: "Galerie", kind: "gallery", hint: "Série.", weight: 14 },
  { type: "meet", name: "duree", label: "Durée (min)", kind: "number", onCard: true, hint: "30 / 45 / 60.", weight: 10 },
  { type: "meet", name: "video", label: "Lien visio", kind: "url", hint: "Si le créneau est à distance.", weight: 20 },
];

export async function seedCck(sql: Sql): Promise<void> {
  const g = globalThis as typeof globalThis & { __veraCck__?: Promise<void> };
  g.__veraCck__ ??= (async () => {
    await sql.query(`
      create table if not exists cck_types (
        id serial primary key, slug text unique not null, entity text not null,
        label text not null, description text not null default ''
      )
    `);
    await sql.query(`
      create table if not exists cck_fields (
        id serial primary key,
        type_id int not null references cck_types(id) on delete cascade,
        company_id int references companies(id) on delete cascade,
        name text not null, label text not null, kind text not null default 'text',
        options_json text not null default '[]', required boolean not null default false,
        weight int not null default 10, on_list boolean not null default false,
        on_card boolean not null default true, filterable boolean not null default false,
        hint text not null default ''
      )
    `);
    await sql.query(`create unique index if not exists cck_fields_global_name on cck_fields (type_id, name) where company_id is null`);
    await sql.query(`create unique index if not exists cck_fields_house_name on cck_fields (type_id, company_id, name) where company_id is not null`);
    await sql.query(`
      create table if not exists cck_values (
        id serial primary key,
        field_id int not null references cck_fields(id) on delete cascade,
        entity_kind text not null, entity_id int not null,
        value_json text not null default 'null',
        unique (field_id, entity_kind, entity_id)
      )
    `);
    await sql.query(`
      create table if not exists meet_slots (
        id serial primary key,
        company_id int not null references companies(id) on delete cascade,
        weekday int not null, start_hour int not null, minutes int not null default 30,
        seats int not null default 2, kind text not null default 'visite',
        place text not null, created_at timestamptz not null default now()
      )
    `);
    await sql.query(`
      create table if not exists meet_bookings (
        id serial primary key,
        slot_id int not null references meet_slots(id) on delete cascade,
        user_id text not null, day date not null, status text not null default 'held',
        created_at timestamptz not null default now(),
        unique (slot_id, user_id, day)
      )
    `);
    await sql.query(`
      create table if not exists academy_hires (
        company_id int not null references companies(id) on delete cascade,
        course_slug text not null, hired int not null default 0, held int not null default 0,
        primary key (company_id, course_slug)
      )
    `);
    for (const t of TYPES) {
      await sql`
        insert into cck_types (slug, entity, label, description)
        values (${t.slug}, ${t.entity}, ${t.label}, ${t.description})
        on conflict (slug) do update set label = excluded.label, description = excluded.description
      `;
    }
    const types = await sql<{ id: number; slug: string }>`select id, slug from cck_types`;
    const idOf = new Map(types.map((t) => [t.slug, t.id]));
    for (const f of FIELDS) {
      const typeId = idOf.get(f.type);
      if (!typeId) continue;
      await sql`
        insert into cck_fields (
          type_id, company_id, name, label, kind, options_json, required, weight,
          on_list, on_card, filterable, hint
        ) values (
          ${typeId}, ${null}, ${f.name}, ${f.label}, ${f.kind},
          ${JSON.stringify(f.options ?? [])}, ${false}, ${f.weight},
          ${Boolean(f.onList)}, ${f.onCard !== false}, ${Boolean(f.filterable)}, ${f.hint}
        )
        on conflict do nothing
      `;
    }

    const flagship = await sql<{ id: number; slug: string }>`
      select id, slug from companies
      where slug = any(${["releve", "kora", "lise", "sable", "lumina", "northline", "mireille"]})
    `;
    const jobField = await sql<{ id: number; name: string }>`
      select f.id, f.name from cck_fields f
      join cck_types t on t.id = f.type_id
      where t.slug = ${"job"} and f.company_id is null
    `;
    const byName = new Map(jobField.map((f) => [f.name, f.id]));
    for (const h of flagship) {
      const jobs = await sql<{ id: number }>`select id from jobs where company_id = ${h.id} limit 8`;
      for (const j of jobs) {
        const epreuve = byName.get("epreuve");
        const salaire = byName.get("salaire_public");
        if (epreuve) {
          await sql`
            insert into cck_values (field_id, entity_kind, entity_id, value_json)
            values (${epreuve}, ${"job"}, ${j.id}, ${JSON.stringify(true)})
            on conflict do nothing
          `;
        }
        if (salaire) {
          await sql`
            insert into cck_values (field_id, entity_kind, entity_id, value_json)
            values (${salaire}, ${"job"}, ${j.id}, ${JSON.stringify(true)})
            on conflict do nothing
          `;
        }
      }
    }

    const hireField = await sql<{ id: number }>`
      select f.id from cck_fields f
      join cck_types t on t.id = f.type_id
      where t.slug = ${"course"} and f.name = ${"hires"} limit 1
    `;
    const courses = await sql<{ id: number; company_id: number; slug: string }>`
      select a.id, a.company_id, a.slug from academy_courses a
      join companies c on c.id = a.company_id
      where c.slug = any(${["releve", "kora", "lise"]}) and a.slug = any(${["securite-geste", "soin-tenu", "accueil"]})
    `;
    const hired: Record<string, number> = { "securite-geste": 3, "soin-tenu": 5, accueil: 8 };
    for (const c of courses) {
      const n = hired[c.slug] ?? 2;
      if (hireField[0]) {
        await sql`
          insert into cck_values (field_id, entity_kind, entity_id, value_json)
          values (${hireField[0].id}, ${"course"}, ${c.id}, ${JSON.stringify(n)})
          on conflict do nothing
        `;
      }
      await sql`
        insert into academy_hires (company_id, course_slug, hired, held)
        values (${c.company_id}, ${c.slug}, ${n}, ${n * 4 + 2})
        on conflict (company_id, course_slug) do nothing
      `;
    }

    const haveSlots = await sql<{ n: number }>`select count(*)::int as n from meet_slots`;
    if ((haveSlots[0]?.n ?? 0) === 0) {
      const packs: { slug: string; place: string; hours: number[] }[] = [
        { slug: "releve", place: "Atelier Fos", hours: [8, 14] },
        { slug: "kora", place: "Chantier / visio", hours: [9, 16] },
        { slug: "lise", place: "Agence Lyon 7e", hours: [10, 15] },
        { slug: "sable", place: "Visio Europe", hours: [11, 17] },
        { slug: "lumina", place: "Paris 11e", hours: [9, 18] },
        { slug: "northline", place: "Visio + Shanghai matin", hours: [8, 19] },
      ];
      const idBy = new Map(flagship.map((h) => [h.slug, h.id]));
      for (const p of packs) {
        const id = idBy.get(p.slug);
        if (!id) continue;
        for (const wd of [2, 4]) {
          for (const h of p.hours) {
            await sql`
              insert into meet_slots (company_id, weekday, start_hour, minutes, seats, kind, place)
              values (${id}, ${wd}, ${h}, ${45}, ${2}, ${h < 12 ? "visite" : "info"}, ${p.place})
            `;
          }
        }
      }
    }
  })().catch((err) => {
    g.__veraCck__ = undefined;
    throw err;
  });
  return g.__veraCck__;
}
