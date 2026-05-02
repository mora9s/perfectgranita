create extension if not exists pgcrypto;

create type public.recipe_status as enum ('draft', 'published', 'archived');

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status public.recipe_status not null default 'draft',
  sort_order integer not null default 0,
  recipe jsonb not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index recipes_status_sort_order_updated_at_idx
  on public.recipes (status, sort_order asc, updated_at desc);

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
