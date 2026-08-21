-- CCK (jobs + courses + articles + meets) and company appointment slots.

create table if not exists cck_types (
  id serial primary key,
  slug text unique not null,
  entity text not null,
  label text not null,
  description text not null default ''
);

create table if not exists cck_fields (
  id serial primary key,
  type_id int not null references cck_types(id) on delete cascade,
  company_id int references companies(id) on delete cascade,
  name text not null,
  label text not null,
  kind text not null default 'text',
  options_json text not null default '[]',
  required boolean not null default false,
  weight int not null default 10,
  on_list boolean not null default false,
  on_card boolean not null default true,
  filterable boolean not null default false,
  hint text not null default ''
);

create unique index if not exists cck_fields_global_name
  on cck_fields (type_id, name) where company_id is null;
create unique index if not exists cck_fields_house_name
  on cck_fields (type_id, company_id, name) where company_id is not null;

create table if not exists cck_values (
  id serial primary key,
  field_id int not null references cck_fields(id) on delete cascade,
  entity_kind text not null,
  entity_id int not null,
  value_json text not null default 'null',
  unique (field_id, entity_kind, entity_id)
);

create index if not exists cck_values_entity_idx on cck_values (entity_kind, entity_id);

create table if not exists meet_slots (
  id serial primary key,
  company_id int not null references companies(id) on delete cascade,
  weekday int not null,
  start_hour int not null,
  minutes int not null default 30,
  seats int not null default 2,
  kind text not null default 'visite',
  place text not null,
  created_at timestamptz not null default now()
);

create index if not exists meet_slots_company_idx on meet_slots (company_id, weekday);

create table if not exists meet_bookings (
  id serial primary key,
  slot_id int not null references meet_slots(id) on delete cascade,
  user_id text not null,
  day date not null,
  status text not null default 'held',
  created_at timestamptz not null default now(),
  unique (slot_id, user_id, day)
);

create table if not exists academy_hires (
  company_id int not null references companies(id) on delete cascade,
  course_slug text not null,
  hired int not null default 0,
  held int not null default 0,
  primary key (company_id, course_slug)
);
