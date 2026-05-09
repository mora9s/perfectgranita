drop view if exists public.recipe_rating_stats;
drop table if exists public.recipe_ratings cascade;

create table public.recipe_ratings (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('remote', 'local')),
  recipe_key text not null,
  recipe_id text,
  rater_key text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (scope, recipe_key, rater_key)
);

create index recipe_ratings_scope_recipe_key_idx
  on public.recipe_ratings (scope, recipe_key);

create trigger set_recipe_ratings_updated_at
before update on public.recipe_ratings
for each row
execute function public.set_updated_at();

create or replace view public.recipe_rating_stats as
select
  scope,
  recipe_key,
  round(avg(rating)::numeric, 1) as avg_rating,
  count(*)::int as votes_count
from public.recipe_ratings
group by scope, recipe_key;

alter table public.recipe_ratings enable row level security;

create policy "Public can read recipe ratings"
on public.recipe_ratings
for select
to anon, authenticated
using (true);

create policy "Public can insert recipe ratings"
on public.recipe_ratings
for insert
to anon, authenticated
with check (
  char_length(rater_key) >= 12
  and scope in ('remote', 'local')
  and char_length(recipe_key) > 0
);

create policy "Public can update own recipe ratings"
on public.recipe_ratings
for update
to anon, authenticated
using (
  char_length(rater_key) >= 12
  and scope in ('remote', 'local')
)
with check (
  char_length(rater_key) >= 12
  and scope in ('remote', 'local')
  and char_length(recipe_key) > 0
);
