alter table jobs add column if not exists offer_json text not null default '{}';
alter table applications add column if not exists trial_score int;
alter table applications add column if not exists trial_json text;
