-- Operational layer: roles, barriers, slots, invoices, proofs, rejection feedback.

alter table profiles add column if not exists role text not null default 'candidate';
alter table profiles add column if not exists house_slug text;
alter table profiles add column if not exists barriers_json text not null default '[]';
alter table profiles add column if not exists availability_json text not null default '[]';

alter table jobs add column if not exists barriers_json text not null default '[]';
alter table jobs add column if not exists trybuy_json text;
alter table jobs add column if not exists slots_json text not null default '[]';

alter table applications add column if not exists trial_json text;
alter table applications add column if not exists feedback_json text;
alter table applications add column if not exists miss_json text not null default '[]';

create table if not exists slots (
  id serial primary key,
  job_id int not null references jobs(id) on delete cascade,
  weekday int not null,
  start_hour int not null,
  hours int not null,
  city text not null,
  seats int not null default 1
);

create table if not exists slot_claims (
  user_id text not null,
  slot_id int not null references slots(id) on delete cascade,
  status text not null default 'held',
  created_at timestamptz not null default now(),
  primary key (user_id, slot_id)
);

create table if not exists ppqc_invoices (
  id serial primary key,
  application_id int not null references applications(id) on delete cascade,
  company_id int not null references companies(id) on delete cascade,
  job_id int not null references jobs(id) on delete cascade,
  euros int not null,
  status text not null default 'due',
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  unique (application_id)
);

create table if not exists proof_files (
  id serial primary key,
  user_id text not null,
  article_id int references articles(id) on delete set null,
  file_name text not null,
  mime text not null,
  body_b64 text not null,
  byte_size int not null,
  created_at timestamptz not null default now()
);

create table if not exists lessons_done (
  user_id text not null,
  lesson_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_slug)
);
