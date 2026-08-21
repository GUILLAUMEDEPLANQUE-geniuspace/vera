-- International desk: portable skill ledger + arena attempts.

create table if not exists skill_ledger (
  id serial primary key,
  user_id text not null,
  arena_id text not null,
  skill_tag text not null,
  title text not null,
  score int not null,
  passed boolean not null default false,
  attempt_no int not null default 1,
  evidence text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists skill_ledger_user_idx on skill_ledger (user_id, created_at desc);

create table if not exists arena_attempts (
  id serial primary key,
  user_id text not null,
  arena_id text not null,
  score int not null,
  passed boolean not null default false,
  missed_json text not null default '[]',
  attempt_no int not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists arena_attempts_user_idx on arena_attempts (user_id, arena_id);
