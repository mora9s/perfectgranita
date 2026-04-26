# 📋 BRIEFING - DevFront
## Mission: Finalisation UI Slushi Party

### Contexte projet
Slushi Party est une application Expo / React Native pour préparer des recettes adaptées aux machines **Ninja Slushi** et **Ninja Slushi Max**.

L'ancien nom du projet était PerfectGranita. Le branding visible doit désormais rester **Slushi Party**.

### État actuel
- Navigation par onglets en place : Accueil, Explorer, Mes Recettes, Paramètres.
- Choix machine sur l'accueil avec visuels officiels.
- Recettes catalogue affichées dans Explorer avec volumes/programmes adaptés à la machine.
- Mes Recettes existe et affiche les recettes personnalisées.
- Thème clair/sombre/système et langue FR/EN disponibles.

---

## 🎯 Mission DevFront

Finaliser l'expérience utilisateur et vérifier la cohérence visuelle.

### À vérifier / améliorer
- [ ] Les écrans utilisent le nom **Slushi Party** lorsqu'un nom produit est visible.
- [ ] Les onglets sont lisibles et cohérents sur mobile et web.
- [ ] L'écran Accueil rend clairement le choix Ninja Slushi / Ninja Slushi Max.
- [ ] L'écran Explorer reste compact malgré les filtres et cartes recettes.
- [ ] L'écran Mes Recettes gère : état vide, liste avec recettes, accès détail, bouton création.
- [ ] Le détail recette affiche correctement les données machine, y compris pour les recettes personnalisées.
- [ ] Les textes FR/EN restent cohérents quand on change de langue.
- [ ] Aucun contenu historique PerfectGranita ne doit apparaître dans l'UI finale.

### Fichiers principaux
- `app/(tabs)/index.tsx`
- `app/(tabs)/explore.tsx`
- `app/(tabs)/my-recipes.tsx`
- `app/(tabs)/settings.tsx`
- `app/recipe/[id].tsx`
- `app/modal.tsx`
- `app/language/language-context.tsx`
- `app/theme/theme-context.tsx`

---

## ✅ Validation attendue
- [ ] `npm test`
- [ ] `npx tsc --noEmit`
- [ ] Smoke test Expo Web : accueil → choix machine → Explorer → Mes Recettes → création recette → reload → détail recette.
- [ ] Console navigateur sans erreur JS bloquante.

## Livrable
Un court compte-rendu listant les écrans vérifiés, les problèmes trouvés et les corrections proposées ou appliquées.

*Architecte - Slushi Party Project*
