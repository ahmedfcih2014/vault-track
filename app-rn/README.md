# Vault Track — React Native

Personal finance tracker for savings (USD, SAR, gold) and EGP spending/income periods. Offline-first, local SQLite storage.

## Requirements

- **Node.js** 20.19+ (Expo SDK 56)
- npm 10+
- iOS Simulator, Android emulator, or Expo Go on a physical device

## Monorepo setup

**Always install from the repository root** (recommended):

```bash
cd vault-track
npm install
```

If you install only inside `app-rn`, run the linker afterward from the repo root:

```bash
node scripts/link-expo-router.mjs
```

This links `expo-router` into the root `node_modules` so Expo CLI can generate typed routes in the monorepo.

## Run the app

```bash
# From repo root
npm run start:rn

# Or from app-rn/
cd app-rn && npm start
```

Then press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

**Web (`npm run web`):** `expo-sqlite` on web is alpha. Metro is configured for `wa-sqlite.wasm`. If you see a WASM resolution error after pulling changes, restart with a clean cache:

```bash
npx expo start --web --clear
```

## Build Android (EAS)

[EAS Build](https://docs.expo.dev/build/introduction/) compiles the app in the cloud. Install from the repo root first (`npm install`).

### One-time setup

```bash
npm install -g eas-cli
eas login
cd app-rn
```

`eas.json` and the Android package (`com.ahmedhesham.vaulttrack`) are already configured in this project.

### Build profiles

| Profile       | Use case                                      |
| ------------- | --------------------------------------------- |
| `preview`     | Install on your phone (internal distribution) |
| `production`  | Play Store release (AAB)                      |
| `development` | Dev client with live reload                   |

### Build and install

```bash
cd app-rn

# Internal APK/AAB for sideloading (recommended for personal use)
eas build -p android --profile preview

# Play Store build
eas build -p android --profile production
```

When the build finishes, download the artifact from the link in the terminal or from [expo.dev](https://expo.dev):

```bash
eas build:download
```

Copy the APK to your phone and install it (enable “Install unknown apps” for your file manager if prompted).

### APK vs AAB

By default, EAS may produce an **AAB** (Android App Bundle). For a direct **APK** sideload, add this to the `preview` profile in `eas.json`:

```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```

Then run `eas build -p android --profile preview` again.

## Architecture

```
app-rn/src/
├── app/              Expo Router (tabs + settings)
├── components/       RN UI
├── hooks/            Feature hooks → use cases
└── infrastructure/   SQLite adapters (expo-sqlite)

packages/shared/      Domain + application (shared with app-fe PWA)
```

**Data flow:** UI hooks → `appContainer` use cases → SQLite repositories → `expo-sqlite`.

### Screens

| Tab      | Purpose                                |
| -------- | -------------------------------------- |
| Spending | EGP income/spending period, end period |
| Saving   | USD / SAR / gold balances              |
| Archives | Closed periods, export JSON            |
| Settings | Full backup export                     |

### Platform adapters vs web PWA

| Web (`app-fe`)    | Mobile (`app-rn`)              |
| ----------------- | ------------------------------ |
| Dexie / IndexedDB | expo-sqlite                    |
| Browser download  | expo-sharing share sheet       |
| Tailwind          | StyleSheet + VaultColors theme |

## Tests

```bash
# Shared business logic smoke tests (Node 16+, from repo root)
npm test

# Full Vitest suite (Node 20+, from repo root)
npm run test:unit

# Web PWA
npm run test:fe

# Verify @vault-track/shared wiring for app-rn
npm run verify:shared
```

## Manual acceptance

See [MANUAL_ACCEPTANCE.md](./MANUAL_ACCEPTANCE.md) for the BRD §12 checklist to run on a device or emulator.

## Related docs

- [BRD.md](../BRD.md) — business requirements
- [Flows.md](../Flows.md) — sequence diagrams
- [requirement-1.md](../requirement-1.md) — original problem statement
