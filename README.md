# Vault Track

Vault Track is a personal finance PWA for tracking **savings** (USD, SAR, and 21k gold) and **income/spending** over a defined period. Data is stored locally on your device, works offline, and can be installed like a mobile app.

Phase 1 is single-user and local-only. A future phase will add a backend API and authentication so the app can sync across devices.

---

## Repository layout

```
vault-track/
├── requirement-1.md    # Original problem statement & data shapes
├── BRD.md              # Business requirements, rules, and FR/NFR traceability
├── Flows.md            # Sequence diagrams for core user flows
├── Implementation.md   # Technical architecture, stack, and build plan
├── README.md           # This file
└── app-fe/             # React PWA application (source code)
```

All application code lives in **`app-fe/`**. The markdown files at the repo root are the design and specification layer — they describe _what_ to build and _why_; `app-fe/` is _how_ it is built.

---

## Design documents — what each file is for

Read the docs in this order when onboarding or planning work:

| Order | File                                     | Purpose                                                                                                                                                                                       | Use it when you need to…                                                                             |
| ----- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1     | [`requirement-1.md`](requirement-1.md)   | Raw stakeholder input: problem, JSON shapes, three core actions, and the long-term vision (local now, server later).                                                                          | Understand the original intent, data model sketches, and scope boundaries.                           |
| 2     | [`BRD.md`](BRD.md)                       | Formal business requirements: objectives, in/out of scope, business rules (`BR-S*`, `BR-SP*`, `BR-R*`), functional requirements (`FR-01`–`FR-11`), and non-functional requirements (`NFR-*`). | Decide if a feature belongs in scope, name a rule ID in code review, or verify acceptance criteria.  |
| 3     | [`Flows.md`](Flows.md)                   | Mermaid sequence diagrams for Saving transactions, SpendingIncome transactions, period reset/archive, and the future server phase.                                                            | Trace a user action through UI → use case → repository → storage, or design a new flow consistently. |
| 4     | [`Implementation.md`](Implementation.md) | Technical plan: layered architecture, stack choices, folder structure, Dexie schema, use cases, testing strategy, and phased delivery.                                                        | Implement or extend features, pick the right layer, or align new code with existing patterns.        |

### How the documents relate

```
requirement-1.md  ──►  BRD.md  ──►  Flows.md
                         │              │
                         └──────┬───────┘
                                ▼
                        Implementation.md
                                │
                                ▼
                            app-fe/
```

- **`requirement-1.md`** is the seed. Everything else expands on it.
- **`BRD.md`** turns informal notes into testable requirements and stable IDs (`FR-05`, `BR-S03`, etc.). Reference these IDs in commits, PRs, and tests.
- **`Flows.md`** shows runtime behavior step-by-step. When implementing a use case, open the matching diagram and follow the same actor boundaries (UI → use case → validator → repository → storage).
- **`Implementation.md`** maps BRD items to code: which use case, which Dexie store, which React route. It also records deliberate pivots (e.g. React Native → PWA) without changing domain rules.

### Practical workflow for contributors

1. **New feature or change** — Check `BRD.md` for scope and rule IDs. If it is not covered, update the BRD first (or confirm it is out of scope).
2. **Behavior questions** — Open `Flows.md` for the relevant sequence diagram.
3. **Where to put code** — Use `Implementation.md` layer rules: Domain (pure logic) → Application (use cases, validators) → Infrastructure (Dexie, file export) → Presentation (React pages and hooks).
4. **Verify completeness** — Cross-check `Implementation.md` FR traceability table against what exists in `app-fe/src/`.

---

## What the app does (Phase 1)

| Area                  | Description                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Saving**            | Deposit and withdraw across USD, SAR, and 21k gold. Withdrawals are blocked if balance is insufficient.                   |
| **Spending / Income** | Track income and spending in **EGP** within a period. Balance is signed (positive = net income, negative = net spending). |
| **End period**        | Archive the current spending period to JSON, then start a fresh period with zero balance.                                 |
| **Archives**          | Browse and export past spending periods.                                                                                  |
| **Settings**          | Export a full local backup; install prompt and offline support via PWA.                                                   |

### Routes

| Path        | Screen                          |
| ----------- | ------------------------------- |
| `/spending` | Income & spending (default tab) |
| `/saving`   | Multi-currency savings          |
| `/archives` | Past spending periods           |
| `/settings` | Backup and app options          |

---

## Tech stack (`app-fe/`)

| Layer              | Choices                                              |
| ------------------ | ---------------------------------------------------- |
| UI                 | React 19, TypeScript, Tailwind CSS 4, React Router 7 |
| Forms & validation | React Hook Form, Zod                                 |
| State              | Zustand                                              |
| Persistence        | IndexedDB via Dexie                                  |
| Money & dates      | decimal.js, Luxon                                    |
| PWA                | vite-plugin-pwa, Workbox                             |
| Tests              | Vitest, Testing Library, Playwright                  |

Architecture follows clean layering: **domain** → **application** → **infrastructure** → **presentation**, with dependency injection in `app-fe/src/app/container.ts`.

---

## Getting started

**Prerequisites:** Node.js 24 (recommended), npm.

```bash
cd app-fe
nvm use 24          # if you use nvm
npm install
npm run dev         # http://localhost:5173
```

### Common commands

Run these from `app-fe/`:

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Start dev server with HMR      |
| `npm run build`    | Production build               |
| `npm run preview`  | Serve production build locally |
| `npm run test`     | Unit tests (Vitest)            |
| `npm run test:e2e` | End-to-end tests (Playwright)  |
| `npm run lint`     | ESLint                         |
| `npm run format`   | Prettier (src only)            |

### Install as PWA

1. Run `npm run dev` or deploy the `dist/` folder.
2. Open the app in a mobile or desktop browser.
3. Use the browser’s **Install** / **Add to Home Screen** option.

Financial data stays in the browser’s IndexedDB on your device — it is not sent to a server in Phase 1.

---

## Data model (summary)

**Saving** — balances per `usd`, `sar`, `gold_21`, plus a transaction list.

**SpendingIncome** — `startedAt`, optional `resetedAt`, signed `balance`, and transactions with `createdAt`.

**Archive** — full snapshot of a closed spending period, stored in IndexedDB and exportable as JSON.

See `BRD.md` §9 and `requirement-1.md` for canonical JSON examples.

---

## Future work (Phase 2+)

Outlined in `BRD.md` and `Implementation.md`:

- Backend API and database as source of truth
- Authentication (JWT / OAuth)
- PWA as a thin client with sync
- Optional cloud backup

Domain models and use cases are designed so infrastructure can swap from Dexie repositories to API repositories without rewriting business logic.

---

## License

Private project — all rights reserved unless stated otherwise.
