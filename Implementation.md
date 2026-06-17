# Vault Track — Implementation Plan (React PWA)

Technical implementation plan derived from `requirement-1.md`, `BRD.md`, and `Flows.md`.

**Platform:** React + TypeScript **Progressive Web App** (mobile-first, installable, offline-first)  
**Phase 1:** Local-only, single user, no authentication  
**Phase 2 (future):** Backend API + JWT auth; PWA becomes thin client

> **Pivot note:** Original requirements referenced React Native. This plan targets a **PWA** instead — domain models, business rules, and use cases are unchanged; only presentation and infrastructure adapters differ.

---

## 1. Technical Architecture (Phase 1)

```
┌─────────────────────────────────────────────────────────────────┐
│  PRESENTATION (React)                                           │
│  Routes: /saving | /spending | /archives                        │
│  Components: BalanceCard, TransactionForm, HistoryList,         │
│              ConfirmResetDialog, InstallPrompt, OfflineBanner   │
│  Hooks: useSaving, useSpendingIncome                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│  APPLICATION                                                      │
│  Use Cases: ApplySavingTransaction, ApplySpendingIncomeTransaction│
│             ResetSpendingIncomePeriod                             │
│  Ports: ISavingRepository, ISpendingIncomeRepository,             │
│         IArchiveService                                           │
│  Validators (Zod), DTOs, standardized error codes                 │
└───────────────────────────────┬───────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  DOMAIN                                                         │
│  Entities: Saving, SpendingIncome, Transaction, Archive         │
│  Pure functions: applyDeposit, applyWithdraw, createFreshPeriod │
│  Business rules: BR-S01–S05, BR-SP01–SP05, BR-R01–R04           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  INFRASTRUCTURE                                                 │
│  DexieSavingRepository | DexieSpendingIncomeRepository          │
│  IndexedDbArchiveService | BrowserFileExport                    │
│  (Phase 2: ApiSavingRepository, ApiSpendingIncomeRepository)    │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency rule

| Layer          | May import                        | Must not import                 |
| -------------- | --------------------------------- | ------------------------------- |
| Presentation   | Application, Domain types         | Infrastructure concrete classes |
| Application    | Domain, repository **interfaces** | React, Dexie, Workbox           |
| Domain         | Nothing external                  | Everything else                 |
| Infrastructure | Domain, interfaces it implements  | Presentation                    |

**Service worker** caches the app shell only — never financial documents.

---

## 2. Recommended Stack

| Layer       | Choice                                       | Rationale                                         |
| ----------- | -------------------------------------------- | ------------------------------------------------- |
| Build       | **Vite 6** + `@vitejs/plugin-react`          | Fast HMR, small bundle, PWA plugin                |
| Language    | **TypeScript 5.x** (strict)                  | Shared types with future API DTOs                 |
| PWA         | **vite-plugin-pwa** + Workbox                | Manifest, SW, precache shell                      |
| Routing     | **React Router 7**                           | Tab routes, mobile-friendly                       |
| State       | **Zustand** (+ TanStack Query v5 in Phase 2) | Simple local state now; server cache later        |
| Storage     | **IndexedDB via Dexie.js 4**                 | Atomic transactions; schema versioning            |
| Archive     | IDB `archives` store + Blob download         | No native FS in browser                           |
| Forms       | **React Hook Form + Zod**                    | Validation aligned with BRD                       |
| Dates       | **Luxon**                                    | ISO 8601 with timezone (BR-SP05)                  |
| Money       | **decimal.js** or string decimals            | Avoid float drift; aligns with PostgreSQL NUMERIC |
| IDs         | `crypto.randomUUID()`                        | Dedup, future sync, double-submit guard           |
| Styling     | **Tailwind CSS 4** + **shadcn/ui**           | Mobile-first, accessible dialogs                  |
| Testing     | **Vitest** + Testing Library + Playwright    | Unit + mobile-viewport E2E                        |
| Lint/format | ESLint 9 (flat) + Prettier                   | Consistent quality                                |

### Persistence decision

| Store                 | Verdict            | Reason                                      |
| --------------------- | ------------------ | ------------------------------------------- |
| localStorage          | **Reject**         | No atomic multi-step writes; ~5 MB limit    |
| **IndexedDB (Dexie)** | **Primary**        | Transactions for reset flow; large capacity |
| OPFS                  | Optional Phase 1.5 | Large manual backup exports only            |

---

## 3. Functional Requirements Traceability

| FR    | Requirement                     | PWA Feature                     | Use Case                             | Storage                     |
| ----- | ------------------------------- | ------------------------------- | ------------------------------------ | --------------------------- |
| FR-01 | View Saving balances            | Saving tab → `BalanceCard` × 3  | `GetSaving`                          | `saving` store              |
| FR-02 | Deposit to Saving               | Saving form (deposit)           | `ApplySavingTransaction`             | Append transaction          |
| FR-03 | Withdraw from Saving            | Saving form (withdraw)          | `ApplySavingTransaction` + validator | Block if insufficient       |
| FR-04 | Saving history                  | `TransactionList`               | Read repository                      | `saving.transactions[]`     |
| FR-05 | SpendingIncome balance & period | Spending tab → header + balance | `GetSpendingIncome`                  | `spendingIncome` store      |
| FR-06 | Deposit (income)                | Spending form (Income)          | `ApplySpendingIncomeTransaction`     | Append + `createdAt`        |
| FR-07 | Withdraw (spending)             | Spending form (Spending)        | `ApplySpendingIncomeTransaction`     | Signed balance              |
| FR-08 | SpendingIncome history          | `TransactionList`               | Read active period                   | Current-period txs only     |
| FR-09 | Reset period                    | `ConfirmResetDialog`            | `ResetSpendingIncomePeriod`          | Archive + fresh period      |
| FR-10 | View/export archives            | Archives tab                    | `ListArchives`, `ExportArchive`      | `archives` store + download |
| FR-11 | Persist across restarts         | Bootstrap + Dexie               | All repositories                     | IndexedDB                   |

---

## 4. Business Rules Validation Matrix

### Saving

| Rule   | Enforced in  | UI behavior             | Test                                   |
| ------ | ------------ | ----------------------- | -------------------------------------- |
| BR-S01 | Domain + Zod | Three balance cards     | USD deposit only affects `balance.usd` |
| BR-S02 | Use case     | Deposit/withdraw toggle | +10 deposit → balance +10              |
| BR-S03 | Validator    | Inline error            | Withdraw 100 when balance 50 → blocked |
| BR-S04 | Repository   | History updates         | Transaction count +1 per op            |
| BR-S05 | Form + Zod   | No negative input       | `amount > 0` required                  |

### SpendingIncome

| Rule    | Enforced in           | UI behavior              | Test                               |
| ------- | --------------------- | ------------------------ | ---------------------------------- |
| BR-SP01 | Domain                | Green/red balance        | Net = Σ deposits − Σ withdrawals   |
| BR-SP02 | Use case              | Income / Spending labels | Consistent with Saving semantics   |
| BR-SP03 | Init + reset          | Period header            | New `startedAt` after reset        |
| BR-SP04 | Repository            | History rows             | All fields present                 |
| BR-SP05 | Use case sets `now()` | Localized display        | Timestamp within seconds of submit |

### Reset

| Rule   | Enforced in        | UI behavior      | Test                              |
| ------ | ------------------ | ---------------- | --------------------------------- |
| BR-R01 | Reset use case     | Archive only     | Archive has non-null `resetedAt`  |
| BR-R02 | `ArchiveService`   | Toast on success | Archive contains all transactions |
| BR-R03 | Repository replace | Empty period UI  | `balance: 0`, `transactions: []`  |
| BR-R04 | No undo            | Confirm modal    | Accidental dismiss does not reset |

---

## 5. User Journeys (Mobile-First PWA)

### Information architecture

```
Bottom tabs:  [ Saving ]  [ Spending ]  [ Archives ]

Saving tab
  ├── Balance overview (USD, SAR, Gold 21k)
  ├── Add transaction (bottom sheet)
  └── Transaction history (newest first)

Spending tab
  ├── Period start + signed balance
  ├── Add income / spending (bottom sheet)
  ├── Transaction history
  └── End period → confirm → archive + fresh start

Archives tab
  ├── List of closed periods
  ├── Detail view
  └── Export JSON (download / share)
```

### Key journeys

1. **Quick saving withdrawal** — Open from home screen → tap account card → bottom sheet → submit → balance + history update (< 300 ms perceived).
2. **Log spending** — Spending tab → Spending action → amount + note → signed balance decreases.
3. **End of period** — "End Period" → confirm (BR-R04) → atomic archive + fresh period → optional view in Archives.
4. **Install & offline** — Visit URL → Add to Home Screen → airplane mode → all Phase 1 operations still work.

### PWA UX conventions

| Pattern       | Recommendation                                       |
| ------------- | ---------------------------------------------------- |
| Navigation    | Bottom tab bar; `safe-area-inset` padding            |
| Forms         | Bottom sheet; `inputmode="decimal"` for amounts      |
| Touch targets | ≥ 44×44 px                                           |
| Feedback      | Toast on success; inline on validation errors        |
| Install       | `beforeinstallprompt` handler; iOS A2HS instructions |
| Offline       | Subtle banner when `navigator.onLine === false`      |

---

## 6. Data Entity Lifecycles

### Saving

- **Born:** First launch seeds `{ balance: { usd: 0, sar: 0, gold_21: 0 }, transactions: [] }`
- **Mutate:** Deposit/withdraw only; append-only transactions
- **Die:** Never deleted in Phase 1

### SpendingIncome

| State              | `resetedAt`   | `balance`            | Visible in   |
| ------------------ | ------------- | -------------------- | ------------ |
| Active             | `null`        | Running signed total | Spending tab |
| Archived           | ISO timestamp | Final snapshot       | Archives tab |
| Fresh (post-reset) | `null`        | `0`                  | Spending tab |

### Reset sequence (atomic)

```
1. snapshot = clone(active); snapshot.resetedAt = now()
2. BEGIN IndexedDB transaction
     → archives.add(snapshot)
     → spendingIncome.put(freshPeriod)
   COMMIT
3. (async) offer JSON download / share — failure does NOT roll back
```

### IndexedDB schema (Dexie)

| Store                | Key         | Content                                       |
| -------------------- | ----------- | --------------------------------------------- |
| `meta`               | `app`       | `{ schemaVersion, deviceId, lastModifiedAt }` |
| `saving`             | `active`    | Single `Saving` document                      |
| `spendingIncome`     | `active`    | Single active `SpendingIncome`                |
| `archives`           | `id` (UUID) | `{ id, filename, archivedAt, snapshot }`      |
| `backups` (optional) | `id`        | Pre-reset shadow backup                       |

---

## 7. Domain Types (implement now for Phase 2 compatibility)

```typescript
type AccountType = "usd" | "sar" | "gold_21";
type OperationType = "deposit" | "withdraw";

interface BaseTransaction {
  id: string; // UUID — client-generated
  amount: string; // decimal string, never JS float
  note: string;
  operationType: OperationType;
  createdAt: string; // ISO 8601 — add to Saving txs too
  syncStatus?: "local" | "pending" | "synced" | "failed";
  serverId?: string;
}

interface SavingTransaction extends BaseTransaction {
  accountType: AccountType;
}

interface SpendingIncomeTransaction extends BaseTransaction {}

interface Saving {
  id: string;
  balance: Record<AccountType, string>;
  transactions: SavingTransaction[];
  updatedAt: string;
  version?: number;
}

interface SpendingIncome {
  id: string;
  startedAt: string;
  resetedAt: string | null;
  balance: string;
  transactions: SpendingIncomeTransaction[];
  updatedAt: string;
  version?: number;
}
```

### Repository ports

```typescript
interface ISavingRepository {
  get(): Promise<Saving>;
  applyTransaction(input: SavingTransactionInput): Promise<Saving>;
}

interface ISpendingIncomeRepository {
  getCurrent(): Promise<SpendingIncome>;
  applyTransaction(
    input: SpendingIncomeTransactionInput,
  ): Promise<SpendingIncome>;
  replaceWithFresh(period: SpendingIncome): Promise<SpendingIncome>;
}

interface IArchiveService {
  save(snapshot: SpendingIncome): Promise<ArchiveRef>;
  list(): Promise<ArchiveMeta[]>;
  get(id: string): Promise<SpendingIncome>;
  exportToFile(id: string): Promise<void>;
}
```

Phase 1: Dexie implementations. Phase 2: swap to `Api*` repos behind the same interfaces.

---

## 8. Phased Delivery

### Phase 0 — Foundation (~3 days)

| Task                                                     | Deliverable                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------- |
| Vite + React + TypeScript scaffold                       | Runnable dev server                                           |
| `vite-plugin-pwa` + manifest + icons (192, 512 maskable) | Installable shell                                             |
| Dexie schema + seed on first launch                      | Empty Saving + SpendingIncome                                 |
| Layered folder structure                                 | `domain/`, `application/`, `infrastructure/`, `presentation/` |
| Domain types + Zod schemas + error codes                 | `src/contracts/`                                              |
| React Router + bottom tab layout                         | `/saving`, `/spending`, `/archives`                           |
| Mobile viewport + safe-area CSS                          | Usable at 375px width                                         |
| ESLint, Prettier, Vitest                                 | Quality baseline                                              |

**Exit:** App launches; empty state loads from IndexedDB; Lighthouse PWA installable.

---

### Phase 1 — Saving Module (~4 days)

| Task                              | Deliverable                                       |
| --------------------------------- | ------------------------------------------------- |
| `DexieSavingRepository`           | Read/write, transaction append in IDB transaction |
| `ApplySavingTransaction` use case | Deposit/withdraw + balance update                 |
| Validation                        | Positive amounts; BR-S03 over-withdraw block      |
| Saving page                       | Balance cards, bottom-sheet form, history list    |
| Unit tests                        | Balance math, withdraw limits, validator          |

**Exit:** FR-01 through FR-04; BR-S01–BR-S05 satisfied.

---

### Phase 2 — SpendingIncome Module (~3 days)

| Task                                      | Deliverable                                   |
| ----------------------------------------- | --------------------------------------------- |
| `DexieSpendingIncomeRepository`           | Read/write active period                      |
| `ApplySpendingIncomeTransaction` use case | Signed balance logic                          |
| Spending page                             | Period header, balance display, form, history |
| Auto-set `createdAt` on each transaction  | BR-SP05                                       |
| Unit tests                                | Signed balance, transaction append            |

**Exit:** FR-05 through FR-08 satisfied.

---

### Phase 3 — Reset & Archive (~2 days)

| Task                                 | Deliverable                             |
| ------------------------------------ | --------------------------------------- |
| `IndexedDbArchiveService`            | Store snapshot in `archives` store      |
| `BrowserFileExport`                  | Blob download + Web Share API fallback  |
| `ResetSpendingIncomePeriod` use case | Clone → archive → fresh period (atomic) |
| `ConfirmResetDialog`                 | Irreversibility warning (BR-R04)        |
| Archives page                        | List, detail, export JSON               |

**Exit:** FR-09 satisfied; FR-10 (view/export) satisfied.

---

### Phase 4 — Hardening (~3 days)

| Task                               | Deliverable                              |
| ---------------------------------- | ---------------------------------------- |
| Atomic IDB transactions            | No partial state on crash                |
| Double-submit guard                | Disable button + transaction `id` dedup  |
| Corrupt data recovery UI           | Zod parse on load; fallback screen       |
| Multi-tab sync                     | `BroadcastChannel` to refresh state      |
| Settings: "Export all data"        | Full JSON backup (mitigates device loss) |
| Offline indicator + install prompt | PWA polish                               |
| Playwright E2E (mobile viewport)   | Deposit → balance → reset → archive      |
| Manual test checklist              | Against acceptance criteria              |

**Exit:** NFR-02, NFR-03, NFR-06 met; all Phase 1 acceptance criteria pass.

---

### Phase 5 — Server Readiness (future)

| Task                                                 | Deliverable                                             |
| ---------------------------------------------------- | ------------------------------------------------------- | ---- |
| `openapi/v1.yaml` stub                               | API contract (see §10)                                  |
| `ApiSavingRepository`, `ApiSpendingIncomeRepository` | Swappable implementations                               |
| Auth shell                                           | Login screen, token storage, `AuthenticatedFetchClient` |
| `POST /sync/bootstrap` client                        | One-time IndexedDB → server migration                   |
| Backend scaffold                                     | Fastify + PostgreSQL (see §11)                          |
| Feature flag                                         | `VITE_DATA_SOURCE=local                                 | api` |

**Exit:** PWA calls API; local path still works for offline dev.

---

## 9. Project Structure

```
vault-track/
├── public/
│   ├── icons/                         # 192, 512 maskable
│   └── manifest.webmanifest
├── src/
│   ├── main.tsx
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers.tsx              # DI: repos → use cases → stores
│   │   └── pwa/
│   │       ├── RegisterSW.tsx
│   │       └── InstallPrompt.tsx
│   ├── domain/
│   │   ├── saving.ts
│   │   ├── spending-income.ts
│   │   ├── archive.ts
│   │   └── errors.ts
│   ├── application/
│   │   ├── ports/
│   │   ├── use-cases/
│   │   ├── validators/schemas.ts
│   │   └── contracts/                 # DTOs, ERROR_CODES
│   ├── infrastructure/
│   │   ├── storage/dexie-db.ts
│   │   ├── repositories/
│   │   ├── archive/
│   │   └── seed/initial-data.ts
│   └── presentation/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       └── layout/AppShell.tsx
├── openapi/v1.yaml                    # Phase 2 API stub
├── vite.config.ts
├── vitest.config.ts
├── BRD.md
├── Flows.md
├── requirement-1.md
└── Implementation.md
```

---

## 10. API Contract Preview (Phase 2)

Base path: `/api/v1` · Auth: `Bearer` token · Errors: RFC 7807 problem+json

| Method | Endpoint                                | Maps to                        |
| ------ | --------------------------------------- | ------------------------------ |
| POST   | `/auth/login`                           | Login                          |
| POST   | `/auth/refresh`                         | Token rotation                 |
| GET    | `/saving`                               | View Saving                    |
| POST   | `/saving/transactions`                  | Deposit/withdraw               |
| GET    | `/spending-income`                      | Active period                  |
| POST   | `/spending-income/transactions`         | Deposit/withdraw               |
| POST   | `/spending-income/reset`                | Reset + archive                |
| GET    | `/spending-income/archives`             | List archives                  |
| GET    | `/spending-income/archives/{id}/export` | JSON download                  |
| POST   | `/sync/bootstrap`                       | One-time local → server import |

**Client fields to include now:** `clientTransactionId`, `createdAt`, `version` (ETag), `deviceId`.

---

## 11. Future Backend Architecture (summary)

### PostgreSQL (normalized, not document blobs)

- `users`, `savings`, `saving_transactions`
- `spending_income_periods`, `spending_income_transactions`
- `spending_income_archives` (with `snapshot_json` for export parity)
- `idempotency_keys`, `sync_cursors`

### Auth path

| Phase         | Model                                                 |
| ------------- | ----------------------------------------------------- |
| 2a Solo       | Single user + JWT access (15 min) / refresh (30 days) |
| 2b Multi-user | Same JWT; `user_id` row isolation                     |
| 2c Devices    | Device tokens + refresh rotation                      |

### Deployment (solo user)

**Recommended:** Railway or Fly.io (~$5–15/mo) — API container + managed PostgreSQL.  
**Alternative:** Single VPS (Hetzner/DO) with Docker Compose + Caddy.

### Sync strategy

1. Bootstrap upload with balance recomputation server-side
2. Dedup via `clientTransactionId` / `clientResetId`
3. Server wins on conflicts; append-only transactions minimize them
4. Wipe or invalidate local cache after successful bootstrap

---

## 12. PWA-Specific Concerns

### Service worker caching

| Asset                  | Strategy                             |
| ---------------------- | ------------------------------------ |
| JS/CSS chunks (hashed) | Precache / CacheFirst                |
| `index.html`           | NetworkFirst or StaleWhileRevalidate |
| IndexedDB data         | **Never** cached by SW               |
| API (Phase 2)          | NetworkOnly                          |

```typescript
// vite.config.ts — conceptual
VitePWA({
  registerType: "prompt",
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
    navigateFallback: "/index.html",
    runtimeCaching: [],
  },
});
```

### Installability checklist

- HTTPS (localhost exempt in dev)
- Manifest: `display: "standalone"`, `start_url: "/"`, theme colors
- Icons: 192×192, 512×512, maskable
- `viewport-fit=cover` for notched devices

### Security (Phase 1)

- Financial data in origin-scoped IndexedDB only
- No amounts or notes in `localStorage` or SW cache
- CSP headers when deployed
- Optional Phase 1.5: app PIN before showing balances

---

## 13. Testing Strategy

| Level           | Focus                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| **Unit**        | Balance math, withdraw limits, reset clone, Zod schemas                |
| **Integration** | Dexie repository round-trip, atomic reset transaction                  |
| **E2E**         | Playwright mobile viewport: deposit → balance → reset → archive exists |
| **PWA audit**   | Lighthouse: installable, offline shell, performance                    |

---

## 14. Acceptance Criteria

### Functional

1. Saving balances match Σ transactions per `accountType`.
2. SpendingIncome balance matches deposits minus withdrawals since `startedAt`.
3. Reset creates immutable archive with full history and `resetedAt`.
4. Active SpendingIncome is fresh after reset (`balance: 0`, empty transactions, new `startedAt`).
5. Saving withdraw blocked when insufficient (BR-S03).
6. All transactions have valid ISO 8601 `createdAt`.

### PWA-specific

1. Installable on Android Chrome and iOS Safari (Add to Home Screen).
2. App shell loads offline after first visit.
3. FR-01–FR-09 operations work in airplane mode.
4. Data survives browser restart and PWA relaunch.
5. Layout usable at 375px width; touch targets ≥ 44px.
6. Archive export produces valid downloadable JSON.
7. Local operations perceived < 300 ms (NFR-06).

---

## 15. Pre-Build Decisions

Resolve before writing domain types:

| #   | Decision                        | Recommendation                            |
| --- | ------------------------------- | ----------------------------------------- |
| 1   | Platform                        | **React PWA** (update BRD §10 constraint) |
| 2   | Archive storage                 | IndexedDB canonical; export on demand     |
| 3   | Transaction `id`                | **UUID on every transaction**             |
| 4   | Saving `createdAt`              | **Add** for history sorting + API parity  |
| 5   | Negative SpendingIncome balance | **Allow** (signed balance model)          |
| 6   | Gold unit                       | Grams — label "Gold 21k (g)"              |
| 7   | Decimal precision               | 2 decimals USD/SAR; 3 for gold            |
| 8   | Note field                      | Optional (empty string default)           |
| 9   | History sort                    | Newest first                              |
| 10  | Default tab                     | Spending (daily use) or Saving — pick one |
| 11  | Manual full backup              | **Yes** — Settings export (Phase 4)       |

### Open questions for stakeholder

1. FR-10: view/export only, or import/restore archive JSON?
2. Currency display format (`$1,234.56` vs `100 USD`)?
3. Desktop layout support, or phone-only?
4. Arabic/RTL for SAR context?

---

## 16. Milestone Summary

| Milestone            | Duration | Outcome                                    |
| -------------------- | -------- | ------------------------------------------ |
| M0: Scaffold         | ~3 days  | Installable PWA with empty state           |
| M1: Saving           | ~4 days  | Multi-asset savings tracking               |
| M2: SpendingIncome   | ~3 days  | Period-based income/spending               |
| M3: Reset & Archives | ~2 days  | Archive + fresh period + export            |
| M4: Polish           | ~3 days  | Production-ready for personal use          |
| M5: Server           | TBD      | Auth + remote persistence + bootstrap sync |

**Estimated Phase 1 total:** ~2–3 weeks part-time for a solo developer.

---

## 17. Architecture Decision Record

```markdown
# ADR-001: React PWA with IndexedDB for Phase 1

## Status

Accepted

## Context

Vault Track needs offline-first, single-user financial tracking with atomic
writes and a path to server-backed storage.

## Decision

Build as Vite + React PWA. Use Dexie/IndexedDB for Saving, SpendingIncome,
and archives. Repository interfaces in application layer; browser adapters
in infrastructure. Service worker caches app shell only.

## Consequences

- Offline install on mobile home screen without app store
- Atomic multi-document writes for reset flow
- Domain/use cases portable to Phase 2 API repos

* iOS PWA storage eviction risk — mitigate via installed PWA + export backup
* File System Access API not universal — download fallback required
* Must not cache financial data in service worker
```
