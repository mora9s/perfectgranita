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

- App icon source: `assets/store/icon.png`
- Android adaptive icon foreground: `assets/store/adaptive-icon-foreground.png`
- Splash image: `assets/store/splash.png`
- Feature graphic draft: `assets/store/feature-graphic.png`
- FR/EN listing copy: `docs/store-listing.md`
- Privacy policy draft: `docs/privacy-policy.md`

Still needed from real device/emulator:

- At least 2 phone screenshots, preferably 4–8.
- Recommended screenshots:
  1. Home / machine selection.
  2. Recipes adapted to Ninja Slushi Max.
  3. Recipe detail with ingredients/steps.
  4. My Recipes / custom recipe persistence.

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
- [ ] Store listing FR filled.
- [ ] Store listing EN filled.
- [ ] Privacy policy published at a public URL.
- [ ] Data safety completed.
- [ ] Content rating completed.
- [ ] Target audience completed.
- [ ] Internal testing release created.
- [ ] Production release only after internal test validation.
