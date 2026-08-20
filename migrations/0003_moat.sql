alter table companies add column if not exists response_sla_days int not null default 10;
alter table companies add column if not exists honor_score int not null default 86;
alter table companies add column if not exists honor_answered int not null default 0;
alter table companies add column if not exists honor_due int not null default 0;

alter table jobs add column if not exists process_json text not null default '[]';
alter table jobs add column if not exists process_hours real not null default 6;
alter table jobs add column if not exists decision_days int not null default 14;

alter table applications add column if not exists due_at timestamptz;
alter table applications add column if not exists answered_at timestamptz;
alter table applications add column if not exists pact_breached boolean not null default false;
alter table applications add column if not exists brief_attached boolean not null default false;

create table if not exists briefs (
  user_id text primary key,
  shipped_json text not null default '[]',
  refuse_json text not null default '[]',
  next_chapter text,
  working_style text,
  updated_at timestamptz not null default now()
);

create table if not exists quiet_signals (
  user_id text not null,
  job_id int not null references jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create index if not exists quiet_signals_job_id_idx on quiet_signals (job_id);
