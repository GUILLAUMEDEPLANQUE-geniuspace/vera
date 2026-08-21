-- Company academies: one catalog per house, connected to the public company page.

create table if not exists academy_courses (
  id serial primary key,
  company_id int not null references companies(id) on delete cascade,
  slug text not null,
  title text not null,
  excerpt text not null,
  audience text not null default 'employee',
  category text not null default 'accueil',
  minutes int not null default 18,
  mandatory boolean not null default false,
  published boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  unique (company_id, slug)
);

create index if not exists academy_courses_company_idx on academy_courses (company_id, published);

create table if not exists academy_modules (
  id serial primary key,
  course_id int not null references academy_courses(id) on delete cascade,
  slug text not null,
  title text not null,
  kicker text not null default '',
  body text not null,
  kind text not null default 'lesson',
  minutes int not null default 6,
  sort_order int not null default 10,
  quiz_json text not null default '[]',
  unique (course_id, slug)
);

create index if not exists academy_modules_course_idx on academy_modules (course_id, sort_order);

create table if not exists academy_members (
  id serial primary key,
  company_id int not null references companies(id) on delete cascade,
  user_id text not null,
  role text not null default 'learner',
  job_title text,
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create index if not exists academy_members_user_idx on academy_members (user_id);

create table if not exists academy_enrollments (
  id serial primary key,
  user_id text not null,
  course_id int not null references academy_courses(id) on delete cascade,
  status text not null default 'assigned',
  progress_pct int not null default 0,
  assigned_by text,
  assigned_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  unique (user_id, course_id)
);

create index if not exists academy_enrollments_user_idx on academy_enrollments (user_id);
create index if not exists academy_enrollments_course_idx on academy_enrollments (course_id);

create table if not exists academy_progress (
  user_id text not null,
  module_id int not null references academy_modules(id) on delete cascade,
  score int,
  completed_at timestamptz not null default now(),
  primary key (user_id, module_id)
);
