# Spécifications Intégrateur - Slushi Party

## Contexte
Slushi Party est une application Expo / React Native pour recettes **Ninja Slushi** et **Ninja Slushi Max**.

## Objectif
Valider qu'une branche est prête à être poussée ou ouverte en PR sans casser l'expérience principale.

## Checklist de validation

### 1. Branding
- [ ] Nom visible : Slushi Party.
- [ ] Titre web : Slushi Party.
- [ ] README aligné sur l'app actuelle.
- [ ] Ancien nom PerfectGranita absent de l'UI visible.

### 2. Parcours utilisateur principal
- [ ] Accueil affiché sans erreur.
- [ ] Sélection Ninja Slushi et Ninja Slushi Max fonctionnelle.
- [ ] Explorer affiche les recettes et les volumes adaptés.
- [ ] Détail recette catalogue accessible.
- [ ] Mes Recettes affiche l'état vide.
- [ ] Création d'une recette personnalisée fonctionnelle.
- [ ] Recette personnalisée visible dans Mes Recettes.
- [ ] Recette personnalisée encore présente après reload.
- [ ] Détail recette personnalisée accessible après reload.
- [ ] Paramètres affichés sans erreur.

### 3. Validation technique
- [ ] `npm test` passe.
- [ ] `npx tsc --noEmit` passe.
- [ ] Console navigateur sans erreur JS bloquante pendant le smoke test.
- [ ] Aucun fichier généré inutile commité.
- [ ] `git status` propre après commit.

### 4. Rapport attendu
Fournir :
- statut global : prêt / prêt avec réserves / non prêt ;
- liste des vérifications OK ;
- bugs ou risques restants ;
- commits locaux à pousser ;
- recommandation push/PR.

## Commandes utiles
```bash
npm test
npx tsc --noEmit
CI=1 npx expo start --web --port 8082 --clear
```

## Livrable
Rapport de vérification court et actionnable.
