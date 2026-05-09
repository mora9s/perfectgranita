-- Storage bucket for recipe images
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do update set public = excluded.public;

-- Public read access to recipe images
DROP POLICY IF EXISTS "Public read recipe images" ON storage.objects;
create policy "Public read recipe images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'recipe-images');

-- Allow authenticated uploads/updates/deletes in recipe-images bucket
DROP POLICY IF EXISTS "Authenticated upload recipe images" ON storage.objects;
create policy "Authenticated upload recipe images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'recipe-images');

DROP POLICY IF EXISTS "Authenticated update recipe images" ON storage.objects;
create policy "Authenticated update recipe images"
on storage.objects
for update
to authenticated
using (bucket_id = 'recipe-images')
with check (bucket_id = 'recipe-images');

DROP POLICY IF EXISTS "Authenticated delete recipe images" ON storage.objects;
create policy "Authenticated delete recipe images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'recipe-images');

-- New recipe: Thé Pêche & Gingembre Glacé 0 %
insert into public.recipes (
  slug,
  status,
  sort_order,
  name_fr,
  name_en,
  description_fr,
  description_en,
  drink_category,
  alcohol_category,
  uses_monin,
  recipe_payload,
  published_at
)
values (
  'the-peche-gingembre-glace-0',
  'published',
  220,
  'Thé Pêche & Gingembre Glacé 0 %',
  'Iced Peach & Ginger Tea 0%',
  'Mocktail thé glacé premium, notes de pêche et gingembre doux, texture granité onctueuse.',
  'Premium iced tea mocktail with peach notes and gentle ginger, smooth slush texture.',
  'cocktailSans',
  null,
  false,
  jsonb_build_object(
    'id', 'the-peche-gingembre-glace-0',
    'name', 'Thé Pêche & Gingembre Glacé 0 %',
    'emoji', '🍑',
    'description', 'Mocktail thé glacé premium, notes de pêche et gingembre doux, texture granité onctueuse.',
    'ingredients', jsonb_build_array(
      'Thé noir infusé puis totalement refroidi',
      'Nectar de pêche',
      'Ginger ale bien froid',
      'Sirop d’agave'
    ),
    'ingredientItems', jsonb_build_array(
      jsonb_build_object('quantity','700 ml / 1400 ml','item','Thé noir infusé puis totalement refroidi','volumesMl',jsonb_build_object('slushi',700,'slushi-max',1400)),
      jsonb_build_object('quantity','550 ml / 1100 ml','item','Nectar de pêche','volumesMl',jsonb_build_object('slushi',550,'slushi-max',1100)),
      jsonb_build_object('quantity','200 ml / 400 ml','item','Ginger ale bien froid','volumesMl',jsonb_build_object('slushi',200,'slushi-max',400)),
      jsonb_build_object('quantity','50 ml / 100 ml','item','Sirop d’agave','volumesMl',jsonb_build_object('slushi',50,'slushi-max',100))
    ),
    'proportions', jsonb_build_object('water','Base thé refroidie','sugar','Nectar + agave','flavor','Pêche & gingembre'),
    'serves', 'FS301EU ~1,5 L | FS605EU/MAX ~3 L',
    'garnish', 'Tranche de pêche fraîche + fine lamelle de gingembre (décoration uniquement)',
    'drinkCategory', 'cocktailSans',
    'usesMonin', false,
    'tips', jsonb_build_array(
      'Utiliser un thé bien refroidi pour une prise de texture plus rapide.',
      'Ne pas utiliser de morceaux de fruits dans la cuve.',
      'Servir immédiatement pour conserver la texture granité.'
    ),
    'notes', jsonb_build_array(
      'Ambiance : adulte, premium, parfait pour un pot d’équipe.',
      'Goût : thé glacé, pêche, gingembre doux.'
    ),
    'machineGuidance', jsonb_build_object(
      'beforeStart', jsonb_build_array(
        'Préparer le thé à l’avance et le refroidir complètement.',
        'Mélanger avec le nectar, le ginger ale et le sirop d’agave.'
      ),
      'pourAndRun', jsonb_build_array(
        'Verser dans la cuve de la machine.',
        'Lancer le programme Slush (ou SlushAssist selon machine).'
      )
    ),
    'machineProfiles', jsonb_build_object(
      'slushi', jsonb_build_object(
        'machineProgram', 'Slush',
        'fillVolumeMl', 1500,
        'estimatedRunTime', '~40-55 min',
        'steps', jsonb_build_array(
          'Préparer le thé à l’avance et le laisser refroidir complètement.',
          'Mélanger avec le nectar, le ginger ale et le sirop d’agave.',
          'Verser dans la FS301EU.',
          'Lancer Slush.',
          'Servir avec une tranche de pêche en décoration au verre.'
        )
      ),
      'slushi-max', jsonb_build_object(
        'machineProgram', 'SlushAssist ou Slush',
        'fillVolumeMl', 3000,
        'estimatedRunTime', '~20-40 min',
        'steps', jsonb_build_array(
          'Préparer le thé à l’avance et le laisser refroidir complètement.',
          'Mélanger avec le nectar, le ginger ale et le sirop d’agave.',
          'Verser dans la FS605EU / MAX.',
          'Lancer SlushAssist ou Slush.',
          'Servir avec une tranche de pêche en décoration au verre.'
        )
      )
    ),
    'media', jsonb_build_object(
      'imageUrl', null,
      'imageAlt', 'Cocktail glacé sans alcool couleur pêche ambrée dans un verre tumbler'
    ),
    'drinkVisual', jsonb_build_object(
      'emoji', '🍑',
      'title', 'Verre tumbler pêche ambrée',
      'subtitle', 'Granité onctueux, décor pêche fraîche + gingembre fin'
    ),
    'i18n', jsonb_build_object(
      'fr', jsonb_build_object(
        'name', 'Thé Pêche & Gingembre Glacé 0 %',
        'description', 'Mocktail thé glacé premium, notes de pêche et gingembre doux, texture granité onctueuse.'
      ),
      'en', jsonb_build_object(
        'name', 'Iced Peach & Ginger Tea 0%',
        'description', 'Premium iced tea mocktail with peach notes and gentle ginger, smooth slush texture.'
      )
    ),
    'instructions', jsonb_build_array(
      'Préparer le thé à l’avance et le laisser refroidir complètement.',
      'Mélanger avec le nectar, le ginger ale et le sirop d’agave.',
      'Verser dans la machine adaptée.',
      'Lancer le programme conseillé.',
      'Servir avec une tranche de pêche en décoration au verre.'
    ),
    'time', jsonb_build_object('prep','~10 min','freezing','~20-55 min','total','~30-65 min')
  ),
  timezone('utc'::text, now())
)
on conflict (slug) do update
set
  status = excluded.status,
  sort_order = excluded.sort_order,
  name_fr = excluded.name_fr,
  name_en = excluded.name_en,
  description_fr = excluded.description_fr,
  description_en = excluded.description_en,
  drink_category = excluded.drink_category,
  alcohol_category = excluded.alcohol_category,
  uses_monin = excluded.uses_monin,
  recipe_payload = excluded.recipe_payload,
  published_at = excluded.published_at,
  updated_at = timezone('utc'::text, now());