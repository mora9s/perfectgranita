# Spécifications DevFront - Slushi Party

## Contexte
Slushi Party est une application Expo / React Native de recettes adaptées à **Ninja Slushi** et **Ninja Slushi Max**.

## Objectif
Maintenir une UI simple, lisible et cohérente avec le branding Slushi Party.

## Exigences fonctionnelles

### Navigation
- Onglets disponibles : Accueil, Explorer, Mes Recettes, Paramètres.
- Les onglets doivent rester accessibles sur mobile et web.

### Accueil
- Afficher le choix entre Ninja Slushi et Ninja Slushi Max.
- Montrer la machine active.
- Le choix machine doit mettre à jour les proportions affichées dans Explorer et Détail.

### Explorer
- Afficher les recettes catalogue.
- Proposer les filtres type de boisson / alcool / Monin selon l'état actuel de l'app.
- Garder un recap de filtres compact.
- Les cartes doivent afficher nom, description, programme, volume et temps.

### Mes Recettes
- Afficher un état vide clair.
- Permettre la création via `/modal`.
- Afficher les recettes personnalisées persistées localement.
- Ouvrir le détail d'une recette personnalisée.

### Détail recette
- Attendre la fin du chargement local avant d'afficher une erreur de recette manquante.
- Afficher les informations machine et temps même si certains champs d'une recette personnalisée sont vides.

### Paramètres
- Thème : clair, sombre, système.
- Langue : FR/EN.
- Machine par défaut : les deux, Slushi seule, Slushi Max seule.
- Section don présente.

## Validation
- `npm test`
- `npx tsc --noEmit`
- Smoke test Expo Web : accueil → machine Max → Explorer → Mes Recettes → créer recette → reload → détail.
- Console navigateur sans erreur JS bloquante.

## Livrables
- Changements UI ciblés.
- Compte-rendu des écrans testés et bugs éventuels.
