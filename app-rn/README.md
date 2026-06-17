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
