create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where t.typname = 'recipe_status' and n.nspname = 'public') then
    create type public.recipe_status as enum ('draft', 'published', 'archived');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where t.typname = 'recipe_drink_category' and n.nspname = 'public') then
    create type public.recipe_drink_category as enum ('cocktailAlcool', 'cocktailSans', 'autre');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where t.typname = 'recipe_alcohol_category' and n.nspname = 'public') then
    create type public.recipe_alcohol_category as enum ('tequila', 'rhum', 'vodka', 'gin', 'aperol-prosecco', 'vin', 'mixte', 'autre');
  end if;
end $$;

drop table if exists public.recipes cascade;

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status public.recipe_status not null default 'draft',
  sort_order integer not null default 0,

  name_fr text not null,
  name_en text,
  description_fr text not null,
  description_en text,
  drink_category public.recipe_drink_category not null,
  alcohol_category public.recipe_alcohol_category,
  uses_monin boolean not null default false,

  recipe_payload jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  published_at timestamptz
);

create index recipes_public_list_idx
  on public.recipes (status, sort_order asc, updated_at desc)
  where status = 'published';

create index recipes_filters_idx
  on public.recipes (status, drink_category, alcohol_category, uses_monin)
  where status = 'published';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger set_recipes_updated_at
before update on public.recipes
for each row
execute function public.set_updated_at();

alter table public.recipes enable row level security;

create policy "Public can read published recipes"
on public.recipes
for select
to anon, authenticated
using (status = 'published');
