alter table jobs add column if not exists pool text;
alter table profiles add column if not exists public_slug text;
alter table profiles add column if not exists slasher boolean not null default false;
alter table profiles add column if not exists hours_week int;
alter table profiles add column if not exists pool_prefs_json text not null default '[]';

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
);

create index if not exists articles_author_slug_idx on articles (author_slug);
create index if not exists articles_company_id_idx on articles (company_id);
create index if not exists articles_published_idx on articles (published, created_at desc);

create table if not exists aptitude_badges (
  id serial primary key,
  user_id text not null,
  job_id int references jobs(id) on delete set null,
  family text not null,
  label text not null,
  score int not null,
  created_at timestamptz not null default now()
);

create index if not exists aptitude_badges_user_idx on aptitude_badges (user_id);
