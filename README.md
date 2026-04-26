# Slushi Party

Slushi Party is an Expo + React Native mobile app for preparing frozen drink recipes with Ninja Slushi machines.

## What The App Does

- Lets you choose your machine: `Ninja Slushi` or `Ninja Slushi Max`.
- Scales recipe quantities to the selected machine capacity.
- Provides recipe browsing with filters for:
  - drink type (alcoholic cocktail, non-alcoholic cocktail, other)
  - alcohol category
  - Monin / non-Monin recipes
- Includes localized recipe content (French/English) and per-recipe detail screens.
- Supports custom recipe creation from the app (`My Recipes` tab).
- Includes in-app settings for theme and language preferences.

## Tech Stack

- Expo SDK 55
- React Native 0.83
- Expo Router
- TypeScript

## Install

```bash
npm install
```

## Run In Development

```bash
npm run start
```

Then launch a target from the Expo UI, or use:

```bash
npm run android
npm run ios
npm run web
```

## Type Check

```bash
npx tsc --noEmit
```

## Legacy CLI (Short Note)

This repository still contains the historical Node.js CLI entrypoint at `src/index.js`.

```bash
npm run cli
```

The mobile app is now the primary product surface.

## License

MIT
