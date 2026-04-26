# 📋 BRIEFING - Intégrateur
## Mission: Vérification globale Slushi Party

### Contexte projet
Slushi Party est l'application Expo / React Native de recettes pour **Ninja Slushi** et **Ninja Slushi Max**.

L'ancien branding PerfectGranita ne doit plus apparaître dans l'expérience produit visible. Pour la préparation Google Play, l'identifiant Android retenu est `com.mora9s.slushiparty`; les traces `perfectgranita` restantes concernent uniquement le CLI/npm historique ou des notes d'ancien nom.

---

## 🎯 Mission Intégrateur

Vérifier que les changements front, données et persistance forment une version cohérente et utilisable.

## 🔍 Phase 1 — Branding et configuration
- [ ] `app.json` affiche `Slushi Party` comme nom d'application.
- [ ] Le titre web affiche `Slushi Party`.
- [ ] Le README décrit bien Slushi Party et l'état actuel Expo / React Native.
- [ ] Aucun écran produit ne montre l'ancien nom PerfectGranita.

## 🔍 Phase 2 — Navigation et UI
- [ ] Accueil : choix Ninja Slushi / Ninja Slushi Max clair et sélection active visible.
- [ ] Explorer : liste recettes affichée, filtres accessibles, recap compact.
- [ ] Mes Recettes : état vide + bouton création + liste après création.
- [ ] Paramètres : thème, langue, machine par défaut, don.
- [ ] Détail recette : ingrédients, machine active, programme, volumes, temps.

## 🔍 Phase 3 — Données et machine scaling
- [ ] Les volumes changent quand on sélectionne Slushi vs Slushi Max.
- [ ] Les recettes catalogue gardent leurs profils machine.
- [ ] Les recettes personnalisées restent consultables en détail.
- [ ] Aucune recette personnalisée ne masque une recette catalogue.

## 🔍 Phase 4 — Persistance locale
- [ ] Créer une recette personnalisée.
- [ ] Recharger l'app.
- [ ] Vérifier que la recette existe toujours dans Mes Recettes.
- [ ] Ouvrir son détail après reload sans écran “recette manquante”.

## 🔍 Phase 5 — Validation technique
- [ ] `npm test`
- [ ] `npx tsc --noEmit`
- [ ] Smoke test Expo Web.
- [ ] Console navigateur sans erreur JS bloquante.
- [ ] `git status` propre après commit local.

---

## 📊 Rapport attendu
Fournir un compte-rendu court avec :
- statut OK/KO par phase ;
- bugs bloquants éventuels ;
- recommandations avant push/PR ;
- commit(s) locaux à pousser si validation donnée.

*Architecte - Slushi Party Project*
