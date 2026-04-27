# Google Play Release Checklist — Slushi Party

## Release target

- App name: **Slushi Party**
- `slug`: `perfectgranita` (retained to match the existing EAS project ID)
- `scheme`: `slushiparty`
- `android.package`: `com.mora9s.slushiparty`
- `android.versionCode`: `1`
- Initial app version: `1.0.0`
- Expo workflow: managed Expo / EAS Build
- First Play track target: **Internal testing**
- Store languages: **French + English**

## Local validation before build

```bash
npm install
npm test
npx tsc --noEmit
npx expo start
```

Phone test with Expo Go before building:

1. Start Expo with `npx expo start`.
2. Scan the QR code in Expo Go.
3. Test the critical flow:
   - app opens as Slushi Party;
   - select Ninja Slushi and Ninja Slushi Max;
   - verify Slushi Max volumes around `3310 ml`;
   - create a custom recipe;
   - close/reopen and confirm the custom recipe persists.

## Build commands

Use `npx eas-cli@latest` if EAS CLI is not globally installed.

### Check Expo login

```bash
npx eas-cli@latest whoami
```

Expected: connected to the Expo account that owns the project (`stefultra` in `app.json`).

### Preview APK for direct phone install

```bash
npx eas-cli@latest build --platform android --profile preview
```

Use this build before the Play Store submission to test a real Android APK outside Expo Go.

### Production AAB for Google Play

```bash
npx eas-cli@latest build --platform android --profile production
```

Google Play requires an Android App Bundle (`.aab`) for production/internal tracks.

## Play Console setup checklist

Create or complete the app in Google Play Console:

- App name: **Slushi Party**
- Default language: French or English, depending on the preferred primary store language.
- App type: App
- Free/Paid: confirm before publication.
- Category suggestion: Food & Drink.
- Tags suggestion: recipes, drinks, lifestyle.
- Contact email: required.
- Website: optional.
- Privacy policy URL: required/recommended; publish the privacy policy from `docs/privacy-policy.md` to a public URL.

## Store listing assets

Prepared in repo:

- Expo/app icon source: `assets/store/icon.png` — `1024 × 1024`.
- Google Play high-res icon: `assets/store/play-icon-512.png` — `512 × 512`.
- Android adaptive icon foreground: `assets/store/adaptive-icon-foreground.png` — `1024 × 1024`, transparent foreground.
- Splash image: `assets/store/splash.png` — `1242 × 2436`.
- Google Play feature graphic: `assets/store/feature-graphic.png` — `1024 × 500`.
- Google Play phone screenshots, generated drafts:
  1. `assets/store/screenshots/phone-01-home.png` — `1080 × 1920`.
  2. `assets/store/screenshots/phone-02-explore.png` — `1080 × 1920`.
  3. `assets/store/screenshots/phone-03-my-recipes.png` — `1080 × 1920`.
  4. `assets/store/screenshots/phone-04-settings.png` — `1080 × 1920`.
- User-provided neon logo source: `assets/store/source/slushi-party-neon-logo.jpg`.
- Previous user-provided icon-style source kept for reference: `assets/store/source/slushi-party-user-icon.jpg`.
- Asset generation script: `scripts/generate-store-assets.py`.
  - The script uses the approved neon **Slushi Party** logo as the main source for icon, splash, feature graphic, and screenshot hero art.
- FR/EN listing copy: `docs/store-listing.md`.
- Privacy policy draft: `docs/privacy-policy.md`.

Notes:

- The generated screenshots are Play Console-ready draft marketing screenshots. If Google rejects synthetic screenshots, replace them with real device captures from the same flows.
- Re-run `python3 scripts/generate-store-assets.py` after changing visual branding.

## Data safety draft answers

Based on the current app implementation:

- No account creation.
- No backend service.
- No analytics SDK observed.
- No ads SDK observed.
- Custom recipes are stored locally on device.
- The app should be declared as not collecting personal data, assuming no third-party SDK is added before release.

Re-check before final submission if dependencies change.

## Content rating / target audience

The app includes cocktail recipes and alcoholic drinks. In Play Console:

- Complete the content rating questionnaire truthfully.
- Target audience should avoid children-focused settings.
- Store description should mention cocktail recipes responsibly.

## Submission options

### Manual upload

1. Download the `.aab` from EAS Build.
2. Upload it in Play Console under the Internal testing track.
3. Complete all store/forms requirements.
4. Start internal testing.

### EAS Submit

Only after Google Play service account credentials are configured outside Git:

```bash
npx eas-cli@latest submit --platform android --profile production
```

Do **not** commit Google service account JSON or API credentials.

## Final pre-production checklist

- [ ] `npm test` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] Expo Go phone smoke test passes.
- [ ] Preview APK smoke test passes.
- [ ] Production AAB build succeeds.
- [x] Store listing FR copy prepared in `docs/store-listing.md` and `docs/play-console-submission-guide.md`.
- [x] Store listing EN copy prepared in `docs/store-listing.md` and `docs/play-console-submission-guide.md`.
- [ ] Privacy policy published at a public URL.
- [ ] Data safety completed.
- [ ] Content rating completed.
- [ ] Target audience completed.
- [ ] Internal testing release created.
- [ ] Production release only after internal test validation.
