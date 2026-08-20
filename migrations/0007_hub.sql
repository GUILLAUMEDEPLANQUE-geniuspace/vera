-- Knowledge hub (Savoirs), GeniusDrive, glossary, forum replies.

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
);

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
);

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
);

create index if not exists knowledge_articles_cat_idx on knowledge_articles (category_id, published);

create table if not exists knowledge_replies (
  id serial primary key,
  article_id int not null references knowledge_articles(id) on delete cascade,
  user_id text not null,
  author_name text not null,
  author_role text not null default 'candidate',
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists glossary_terms (
  term_key text primary key,
  label text not null,
  definition text not null,
  candidate_use text not null,
  company_use text not null
);

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
);

create table if not exists drive_chunks (
  asset_id int not null references drive_assets(id) on delete cascade,
  idx int not null,
  body_b64 text not null,
  primary key (asset_id, idx)
);

create index if not exists drive_assets_entity_idx on drive_assets (entity_type, entity_key);
