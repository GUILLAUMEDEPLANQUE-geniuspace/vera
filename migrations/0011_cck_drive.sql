-- Folders for the house media library (GeniusDrive-class) + CCK épreuve fields live in seed.

create table if not exists drive_folders (
  id serial primary key,
  company_id int not null references companies(id) on delete cascade,
  parent_id int references drive_folders(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists drive_folders_house_slug
  on drive_folders (company_id, slug);

create index if not exists drive_folders_parent_idx
  on drive_folders (company_id, parent_id);

alter table drive_assets add column if not exists folder_id int references drive_folders(id) on delete set null;
alter table drive_assets add column if not exists company_id int references companies(id) on delete cascade;

create index if not exists drive_assets_folder_idx on drive_assets (folder_id);
create index if not exists drive_assets_company_idx on drive_assets (company_id, asset_type);
