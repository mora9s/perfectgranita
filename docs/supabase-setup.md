# Supabase setup (Slushi Party)

## 1) Create project
- Go to https://supabase.com → **New project**
- Name: `slushi-party` (or `perfectgranita`)
- Region: EU (closest)

## 2) Run SQL schema
In Supabase dashboard → **SQL Editor** → paste and run:

```sql
create extension if not exists pgcrypto;

create type if not exists public.recipe_status as enum ('draft', 'published', 'archived');

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status public.recipe_status not null default 'draft',
  sort_order integer not null default 0,
  recipe jsonb not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists recipes_status_sort_order_updated_at_idx
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

drop trigger if exists set_recipes_updated_at on public.recipes;
create trigger set_recipes_updated_at
before update on public.recipes
for each row
execute function public.set_updated_at();

alter table public.recipes enable row level security;

drop policy if exists "Public can read published recipes" on public.recipes;
create policy "Public can read published recipes"
on public.recipes
for select
to anon, authenticated
using (status = 'published');
```

## 3) Add first published recipe

```sql
insert into public.recipes (slug, status, sort_order, recipe)
values (
  'demo-margarita',
  'published',
  1,
  jsonb_build_object(
    'name','Demo Margarita',
    'emoji','🍋',
    'description','Recette de démo',
    'ingredients', jsonb_build_array('Tequila','Citron vert','Sirop de sucre','Eau'),
    'instructions', jsonb_build_array('Mélanger','Verser','Lancer programme'),
    'proportions', jsonb_build_object('water','60%','sugar','20%','flavor','20%'),
    'time', jsonb_build_object('prep','5 min','freezing','45 min','total','50 min')
  )
)
on conflict (slug) do nothing;
```

## 4) Connect Expo app
Project Settings → API:
- `Project URL`
- `anon public key`

Add to app `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 5) Security notes
- Never put `service_role` key in mobile app.
- Keep writes admin-only (via Supabase dashboard or server/admin backend).
- Only `published` rows are publicly readable via RLS.

## 6) Verify quickly
- In app settings/debug, source should become `remote` after refresh.
- If Supabase unavailable, app must still work from bundled/cache recipes.
