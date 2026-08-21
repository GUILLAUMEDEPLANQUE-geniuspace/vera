import type { Sql } from "./db";

type SeedFile = { title: string; file: string; mime: string; type: string; folder: string };

const PACKS: { slug: string; folders: string[]; files: SeedFile[] }[] = [
  {
    slug: "releve",
    folders: ["Atelier", "Outils", "Équipe"],
    files: [
      { title: "Atelier Fos — presse", file: "/offer/releve-atelier.jpg", mime: "image/jpeg", type: "image", folder: "Atelier" },
      { title: "Kit de consignation", file: "/offer/tool-consignation.jpg", mime: "image/jpeg", type: "image", folder: "Outils" },
      { title: "Clé dynamométrique", file: "/offer/tool-couple.jpg", mime: "image/jpeg", type: "image", folder: "Outils" },
      { title: "Karim — équipe nuit", file: "/offer/karim.jpg", mime: "image/jpeg", type: "image", folder: "Équipe" },
      { title: "Geste consignation", file: "/offer/v/karim.mp4", mime: "video/mp4", type: "video", folder: "Équipe" },
    ],
  },
  {
    slug: "kora",
    folders: ["Chantier"],
    files: [
      { title: "Chantier PV", file: "/offer/kora-chantier.jpg", mime: "image/jpeg", type: "image", folder: "Chantier" },
      { title: "Onduleur — épreuve", file: "/offer/tool-onduleur.jpg", mime: "image/jpeg", type: "image", folder: "Chantier" },
      { title: "Nadia — chef de chantier", file: "/offer/nadia.jpg", mime: "image/jpeg", type: "image", folder: "Chantier" },
    ],
  },
  {
    slug: "lise",
    folders: ["Tournée"],
    files: [
      { title: "Tournée domicile", file: "/offer/lise-domicile.jpg", mime: "image/jpeg", type: "image", folder: "Tournée" },
      { title: "Hélène — auxiliaire", file: "/offer/helene.jpg", mime: "image/jpeg", type: "image", folder: "Tournée" },
      { title: "Voix tournée", file: "/offer/v/camille.mp4", mime: "video/mp4", type: "video", folder: "Tournée" },
    ],
  },
  {
    slug: "sable",
    folders: ["Bureau"],
    files: [
      { title: "Loft écriture", file: "/offer/sable-loft.jpg", mime: "image/jpeg", type: "image", folder: "Bureau" },
      { title: "Camille — produit", file: "/offer/camille.jpg", mime: "image/jpeg", type: "image", folder: "Bureau" },
    ],
  },
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function seedDriveMedia(sql: Sql): Promise<void> {
  const g = globalThis as typeof globalThis & { __veraDriveMedia__?: Promise<void> };
  g.__veraDriveMedia__ ??= (async () => {
    await sql.query(`
      create table if not exists drive_folders (
        id serial primary key,
        company_id int not null references companies(id) on delete cascade,
        parent_id int references drive_folders(id) on delete cascade,
        name text not null,
        slug text not null,
        created_at timestamptz not null default now()
      )
    `);
    await sql.query(`create unique index if not exists drive_folders_house_slug on drive_folders (company_id, slug)`);
    await sql.query(`alter table drive_assets add column if not exists folder_id int references drive_folders(id) on delete set null`);
    await sql.query(`alter table drive_assets add column if not exists company_id int references companies(id) on delete cascade`);

    for (const pack of PACKS) {
      const houses = await sql<{ id: number }>`select id from companies where slug = ${pack.slug} limit 1`;
      const house = houses[0];
      if (!house) continue;
      const folderIds = new Map<string, number>();
      for (const name of pack.folders) {
        const slug = slugify(name);
        await sql`
          insert into drive_folders (company_id, parent_id, name, slug)
          values (${house.id}, ${null}, ${name}, ${slug})
          on conflict (company_id, slug) do nothing
        `;
        const rows = await sql<{ id: number }>`
          select id from drive_folders where company_id = ${house.id} and slug = ${slug} limit 1
        `;
        if (rows[0]) folderIds.set(name, rows[0].id);
      }
      for (const f of pack.files) {
        const folderId = folderIds.get(f.folder) ?? null;
        const slug = `${pack.slug}-${slugify(f.title)}`;
        const exists = await sql<{ n: number }>`select count(*)::int as n from drive_assets where slug = ${slug}`;
        if ((exists[0]?.n ?? 0) > 0) {
          await sql`
            update drive_assets
            set company_id = ${house.id}, folder_id = ${folderId}, source_url = ${f.file}
            where slug = ${slug}
          `;
          continue;
        }
        await sql`
          insert into drive_assets (
            title, slug, filename, mime, asset_type, chunk_size, byte_size,
            source_url, entity_type, entity_key, visibility, company_id, folder_id
          ) values (
            ${f.title}, ${slug}, ${f.file.split("/").pop() ?? f.file}, ${f.mime}, ${f.type},
            ${262144}, ${0}, ${f.file}, ${"company"}, ${pack.slug}, ${"public"},
            ${house.id}, ${folderId}
          )
          on conflict (slug) do update set
            company_id = excluded.company_id,
            folder_id = excluded.folder_id,
            source_url = excluded.source_url
        `;
      }
    }
  })().catch((err) => {
    g.__veraDriveMedia__ = undefined;
    throw err;
  });
  return g.__veraDriveMedia__;
}
