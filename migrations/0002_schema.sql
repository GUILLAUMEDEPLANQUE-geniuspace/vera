create table if not exists companies (
  id serial primary key,
  slug text unique not null,
  name text not null,
  tagline text not null,
  about text not null,
  industry text not null,
  size_band text not null,
  hq_city text not null,
  hq_country text not null,
  website text,
  founded_year int,
  culture_score int not null default 80,
  hiring_velocity text not null default 'steady',
  values_json text not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists jobs (
  id serial primary key,
  company_id int not null references companies(id) on delete cascade,
  slug text unique not null,
  title text not null,
  team text,
  location text not null,
  city text not null,
  country text not null,
  remote_type text not null,
  contract text not null,
  seniority text not null,
  salary_min int,
  salary_max int,
  currency text not null default 'EUR',
  equity boolean not null default false,
  description text not null,
  responsibilities_json text not null default '[]',
  requirements_json text not null default '[]',
  nice_json text not null default '[]',
  benefits_json text not null default '[]',
  skills_json text not null default '[]',
  posted_at timestamptz not null default now(),
  applicants_count int not null default 0,
  views_count int not null default 0,
  ghost_risk text not null default 'low',
  collection text,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists jobs_company_id_idx on jobs (company_id);
create index if not exists jobs_posted_at_idx on jobs (posted_at desc);
create index if not exists jobs_remote_type_idx on jobs (remote_type);
create index if not exists jobs_contract_idx on jobs (contract);
create index if not exists jobs_seniority_idx on jobs (seniority);
create index if not exists jobs_collection_idx on jobs (collection);

create table if not exists profiles (
  user_id text primary key,
  headline text,
  location text,
  remote_pref text,
  seniority text,
  skills_json text not null default '[]',
  languages_json text not null default '[]',
  bio text,
  salary_min int,
  salary_max int,
  open_to_work boolean not null default true,
  role_targets_json text not null default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists saved_jobs (
  user_id text not null,
  job_id int not null references jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create table if not exists applications (
  id serial primary key,
  user_id text not null,
  job_id int not null references jobs(id) on delete cascade,
  status text not null default 'sent',
  cover_letter text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index if not exists applications_user_id_idx on applications (user_id);

create table if not exists coach_notes (
  id serial primary key,
  user_id text not null,
  job_id int,
  kind text not null,
  prompt text not null,
  response text not null,
  created_at timestamptz not null default now()
);

create index if not exists coach_notes_user_id_idx on coach_notes (user_id);
