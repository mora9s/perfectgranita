drop view if exists public.recipe_rating_stats;

drop policy if exists "Public can read recipe ratings" on public.recipe_ratings;
drop policy if exists "Public can insert recipe ratings" on public.recipe_ratings;
drop policy if exists "Public can update own recipe ratings" on public.recipe_ratings;

drop index if exists recipe_ratings_recipe_id_idx;

alter table public.recipe_ratings
  add column if not exists scope text,
  add column if not exists recipe_key text;

update public.recipe_ratings
set
  scope = coalesce(scope, 'remote'),
  recipe_key = coalesce(recipe_key, recipe_id)
where scope is null or recipe_key is null;

alter table public.recipe_ratings
  alter column scope set not null,
  alter column recipe_key set not null;

alter table public.recipe_ratings
  add constraint recipe_ratings_scope_check check (scope in ('remote', 'local'));

alter table public.recipe_ratings
  drop constraint if exists recipe_ratings_recipe_id_rater_key_key;

alter table public.recipe_ratings
  add constraint recipe_ratings_scope_recipe_key_rater_key_key unique (scope, recipe_key, rater_key);

create index recipe_ratings_scope_recipe_key_idx
  on public.recipe_ratings (scope, recipe_key);

create or replace view public.recipe_rating_stats as
select
  scope,
  recipe_key,
  round(avg(rating)::numeric, 1) as avg_rating,
  count(*)::int as votes_count
from public.recipe_ratings
group by scope, recipe_key;

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
