create table public.recipe_ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id text not null,
  rater_key text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (recipe_id, rater_key)
);

create index recipe_ratings_recipe_id_idx
  on public.recipe_ratings (recipe_id);

create trigger set_recipe_ratings_updated_at
before update on public.recipe_ratings
for each row
execute function public.set_updated_at();

create or replace view public.recipe_rating_stats as
select
  recipe_id,
  round(avg(rating)::numeric, 1) as avg_rating,
  count(*)::int as votes_count
from public.recipe_ratings
group by recipe_id;

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
with check (char_length(rater_key) >= 12);

create policy "Public can update own recipe ratings"
on public.recipe_ratings
for update
to anon, authenticated
using (char_length(rater_key) >= 12)
with check (char_length(rater_key) >= 12);

