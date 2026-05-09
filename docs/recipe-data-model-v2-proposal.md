# Slushi Party — Proposition modèle données recettes V2

Objectif: garantir une homogénéité stricte entre recettes locales et recettes BDD (liste + détail), tout en conservant la résilience locale en cas de panne Supabase.

## 1) Invariants produit (non négociables)

1. L’app fonctionne sans Supabase (offline / outage):
   - catalogue local embarqué toujours disponible.
2. Le catalogue distant enrichit le catalogue local, il ne doit jamais casser l’UX si indisponible.
3. Liste et détail consomment la même shape canonique (`RecipeDTO`).
4. FR/EN doit être nativement supporté avec fallback déterministe.

---

## 2) Contrat canonique TypeScript (source de vérité app)

```ts
export type RecipeStatus = 'draft' | 'published' | 'archived';
export type RecipeDrinkCategory = 'cocktailAlcool' | 'cocktailSans' | 'autre';
export type RecipeAlcoholCategory =
  | 'tequila'
  | 'rhum'
  | 'vodka'
  | 'gin'
  | 'aperol-prosecco'
  | 'vin'
  | 'mixte'
  | 'autre';

export type Locale = 'fr' | 'en';

export interface RecipeLocalizedText {
  name?: string;
  description?: string;
  garnish?: string;
  tips?: string[];
  notes?: string[];
  drinkVisual?: {
    title?: string;
    subtitle?: string;
  };
  machineGuidance?: {
    beforeStart?: string[];
    pourAndRun?: string[];
  };
}

export interface RecipeI18n {
  fr?: RecipeLocalizedText;
  en?: RecipeLocalizedText;
}

export interface RecipeDTO {
  id: string;                // slug stable côté app
  source: 'bundled' | 'remote' | 'custom';

  // Champs liste/filter rapides (toujours présents)
  name: string;
  description: string;
  drinkCategory: RecipeDrinkCategory;
  alcoholCategory?: RecipeAlcoholCategory;
  usesMonin: boolean;

  // Détail
  emoji: string;
  ingredients: string[];
  ingredientItems?: Array<{
    quantity: string;
    item: string;
    note?: string;
    volumesMl?: Partial<Record<'slushi' | 'slushi-max', number>>;
    abvPercent?: number;
  }>;
  machineProfiles?: Record<string, unknown>;
  machineGuidance?: { beforeStart: string[]; pourAndRun: string[] };
  drinkVisual?: { emoji: string; title: string; subtitle: string };
  garnish?: string;
  tips: string[];
  notes: string[];
  instructions: string[];
  time: { prep: string; freezing: string; total: string };

  media?: {
    image?: any;      // local asset require()
    imageUrl?: string; // remote URL
    imageAlt?: string;
  };

  i18n?: RecipeI18n;
  sortOrder?: number;
  updatedAt?: string;
}
```

### Règles de normalisation parser (obligatoires)

- `tips`, `notes`, `instructions` => toujours `string[]` (jamais `undefined` au rendu)
- `time.prep/freezing/total` => toujours renseignés (`'—'` fallback)
- `usesMonin` => `false` par défaut
- `drinkCategory` => valeur autorisée sinon `'autre'`
- `id` app = `slug` BDD (stable)

---

## 3) Proposition BDD V2 (hybride: colonnes + payload)

Conserver la flexibilité JSON pour le détail, sortir les colonnes nécessaires aux filtres et à l’i18n de liste.

```sql
-- Types
create type public.recipe_status as enum ('draft', 'published', 'archived');
create type public.recipe_drink_category as enum ('cocktailAlcool', 'cocktailSans', 'autre');
create type public.recipe_alcohol_category as enum ('tequila', 'rhum', 'vodka', 'gin', 'aperol-prosecco', 'vin', 'mixte', 'autre');

-- Table v2 (proposition)
create table public.recipes_v2 (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status public.recipe_status not null default 'draft',
  sort_order integer not null default 0,

  -- Colonnes structurantes liste/recherche
  name_fr text not null,
  name_en text,
  description_fr text not null,
  description_en text,
  drink_category public.recipe_drink_category not null,
  alcohol_category public.recipe_alcohol_category,
  uses_monin boolean not null default false,

  -- Payload riche détail
  recipe_payload jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  published_at timestamptz
);

-- Indexes
create index recipes_v2_public_list_idx
  on public.recipes_v2 (status, sort_order asc, updated_at desc)
  where status = 'published';

create index recipes_v2_filters_idx
  on public.recipes_v2 (status, drink_category, alcohol_category, uses_monin)
  where status = 'published';

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger set_recipes_v2_updated_at
before update on public.recipes_v2
for each row execute function public.set_updated_at();

-- RLS lecture publique published
alter table public.recipes_v2 enable row level security;

create policy "Public can read published recipes v2"
on public.recipes_v2
for select
to anon, authenticated
using (status = 'published');
```

### Pourquoi ce modèle est meilleur

- Filtres de liste efficaces et indexables (`drink_category`, `alcohol_category`, `uses_monin`)
- I18n FR/EN de base structurée en colonnes
- Détail reste flexible via `recipe_payload`
- Contrat local/remote plus robuste

---

## 4) Mapping SQL -> app homogène

### Requête recommandée

```sql
select
  slug,
  sort_order,
  updated_at,
  name_fr,
  name_en,
  description_fr,
  description_en,
  drink_category,
  alcohol_category,
  uses_monin,
  recipe_payload
from public.recipes_v2
where status = 'published'
order by sort_order asc, updated_at desc;
```

### Mapping côté app

- `id = slug`
- `name = name_fr`
- `description = description_fr`
- `i18n.en.name = name_en` (si non null)
- `i18n.en.description = description_en` (si non null)
- puis merge avec `recipe_payload` (emoji, ingredients, time, machineProfiles, etc.)
- exécuter `normalizeRecipeShape()` avant de publier au store

---

## 5) Compatibilité fallback local + cache

Priorité de rendu recommandée (inchangée):

1. remote valide en mémoire (si fetch OK)
2. cache remote local valide
3. bundled local embarqué
4. custom user local

Et merge:
- bundled IDs sont des ancres stables
- remote n’écrase pas un ID bundled identique (mode additif)
- custom ne remplace jamais un ID officiel

---

## 6) Plan migration sûr (sans casser prod)

1. Créer `recipes_v2` + policies + indexes.
2. Backfill depuis `recipes` actuel:
   - extraire `name_fr/name_en/...` depuis `recipe` jsonb.
3. Ajouter un parser v2 dédié (`parseRemoteRecipeV2Row`).
4. Activer feature flag côté app (`USE_RECIPES_V2`).
5. Vérifier parité liste+détail (snapshot/QA manuel FR+EN).
6. Basculer en défaut v2.
7. Déprécier `recipes` legacy après période d’observation.

---

## 7) Checks QA avant bascule

- FR/EN: nom+description+sections détail cohérentes
- Tous filtres liste identiques local vs remote
- Détail ne crash jamais si payload partiel
- Supabase off => app continue avec bundled/cache
- Ratings local/remote inchangés (`scope + recipe_key`)

---

## 8) Recommandation finale

Adopter V2 hybride (colonnes filtrables + payload JSON) est le meilleur compromis pour:
- robustesse produit,
- performance filtres,
- i18n FR/EN,
- et continuité offline locale.
