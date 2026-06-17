# Vault Track — Business Requirements Document (BRD)

| Field | Value |
|-------|-------|
| **Project** | Vault Track |
| **Version** | 1.0 |
| **Date** | 2026-06-16 |
| **Status** | Draft |
| **Source** | `requirement-1.md` |

---

## 1. Executive Summary

Vault Track is a personal mobile application for tracking savings (multi-currency/assets) and income/spending over a defined period. The product targets a single user on one device initially, with a later path to server-backed storage and authentication so the phone becomes a thin client.

---

## 2. Business Problem

The stakeholder cannot reliably track income, spending, and savings across multiple asset types (USD, SAR, gold). Manual or ad-hoc methods do not provide a clear balance view or historical record per period.

**Business impact:** Poor visibility into financial position, harder budgeting, and no structured archive when a spending/income period ends.

---

## 3. Business Objectives

| ID | Objective | Success Metric |
|----|-----------|----------------|
| BO-01 | Track savings across USD, SAR, and gold (21k) | Balances update correctly after every deposit/withdraw |
| BO-02 | Track income vs spending within a period | Running balance reflects all transactions since `startedAt` |
| BO-03 | Close a period and start fresh | Reset archives the period and starts a new one with `startedAt = now` |
| BO-04 | Support future multi-device use | Architecture allows server migration without redesigning core models |

---

## 4. Stakeholders

| Role | Interest |
|------|----------|
| **Primary user (owner)** | Daily deposit/withdraw, view balances, reset spending periods |
| **Future: system operator** | Host backend, manage auth, backups |

---

## 5. Scope

### In Scope (Phase 1 — Mobile, Local-Only)

- Saving: deposit and withdraw per account type (`usd`, `sar`, `gold_21`)
- SpendingIncome: deposit and withdraw with signed balance
- SpendingIncome reset: set `resetedAt`, archive clone to JSON, reset main object
- Transaction history per domain
- Local persistence on device

### Out of Scope (Phase 1)

- Multi-user accounts
- Server sync and authentication
- Bank integrations, receipts, categories, budgets, reports
- Cloud backup (unless added explicitly later)

### Future Scope (Phase 2+)

- Backend API and database
- Authentication (e.g. JWT / OAuth)
- Mobile as UI-only with remote persistence

---

## 6. Business Rules

### Saving

| Rule ID | Rule |
|---------|------|
| BR-S01 | Balance is split by `accountType`: `usd`, `sar`, `gold_21` |
| BR-S02 | `deposit` increases balance; `withdraw` decreases it |
| BR-S03 | Withdraw cannot exceed available balance for that account type |
| BR-S04 | Each operation appends a transaction with `amount`, `accountType`, `note`, `operationType` |
| BR-S05 | Amounts are positive; direction is determined by `operationType` |

### SpendingIncome

| Rule ID | Rule |
|---------|------|
| BR-SP01 | `balance` is signed: positive = net income, negative = net spending |
| BR-SP02 | `deposit` increases balance (income); `withdraw` decreases it (spending) |
| BR-SP03 | `startedAt` marks period start; `resetedAt` is null while active |
| BR-SP04 | Each transaction has `amount`, `note`, `createdAt`, `operationType` |
| BR-SP05 | `createdAt` is set at transaction time (ISO 8601 with timezone) |

### Reset (SpendingIncome)

| Rule ID | Rule |
|---------|------|
| BR-R01 | Reset sets `resetedAt` on the current period to now |
| BR-R02 | A full clone of the period (including transactions) is written to a JSON archive file |
| BR-R03 | Main SpendingIncome is replaced with a fresh object: `startedAt = now`, `resetedAt = null`, `balance = 0`, `transactions = []` |
| BR-R04 | Reset is irreversible from the app UI (archive is the recovery path) |

---

## 7. Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | User can view Saving balances for USD, SAR, and gold_21 | Must |
| FR-02 | User can deposit to Saving for any account type | Must |
| FR-03 | User can withdraw from Saving for any account type | Must |
| FR-04 | User can view Saving transaction history | Must |
| FR-05 | User can view current SpendingIncome balance and period (`startedAt`) | Must |
| FR-06 | User can deposit (income) to SpendingIncome | Must |
| FR-07 | User can withdraw (spending) from SpendingIncome | Must |
| FR-08 | User can view SpendingIncome transaction history | Must |
| FR-09 | User can reset SpendingIncome (archive + fresh period) | Must |
| FR-10 | User can view or export archived SpendingIncome JSON files | Should |
| FR-11 | App persists data across restarts | Must |

---

## 8. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Single-user, single device (Phase 1) | No login required initially |
| NFR-02 | Offline-first | All operations work without network |
| NFR-03 | Data integrity | Atomic writes; no partial state after crash |
| NFR-04 | Future server migration | Domain models and operations map cleanly to API |
| NFR-05 | Future authentication | API design assumes authenticated user context |
| NFR-06 | Performance | UI updates within ~300 ms for local operations |
| NFR-07 | Privacy | Financial data stays on device until server phase |

---

## 9. Data Entities

### Saving

```json
{
  "balance": {
    "usd": 100,
    "sar": 110,
    "gold_21": 5
  },
  "transactions": [
    {
      "amount": 5,
      "accountType": "usd",
      "note": "testing note here",
      "operationType": "withdraw"
    }
  ]
}
```

### SpendingIncome

```json
{
  "startedAt": "2026-06-16T10:00:00+03:00",
  "resetedAt": null,
  "balance": 250,
  "transactions": [
    {
      "amount": 100,
      "note": "test note",
      "createdAt": "2026-06-16T10:01:00+03:00",
      "operationType": "deposit"
    }
  ]
}
```

### SpendingIncomeArchive (derived on reset)

Snapshot of SpendingIncome at reset time, stored as a JSON file (e.g. `spending-income-2026-06-16T10-00-00.json`).

---

## 10. Assumptions & Constraints

| Type | Item |
|------|------|
| Assumption | User enters amounts manually |
| Assumption | Gold is tracked in units (e.g. grams), not live market price |
| Assumption | One active SpendingIncome period at a time |
| Constraint | React Native for mobile |
| Constraint | Phase 1 is local storage only |
| Constraint | No multi-currency conversion between Saving account types |

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss on device failure | High | Export/archive on reset; optional manual backup (Phase 1.5) |
| Local storage corruption | Medium | Atomic writes, validation on load, backup before reset |
| Scope creep (reports, categories) | Medium | Strict Phase 1 scope per BRD |
| Hard migration to server later | Medium | Repository pattern, shared TypeScript types, API-shaped service layer |

---

## 12. Acceptance Criteria (Phase 1)

1. After deposit/withdraw on Saving, displayed balance matches sum of operations per account type.
2. SpendingIncome balance matches sum of deposits minus withdrawals since last reset.
3. Reset produces a JSON archive containing the closed period and clears the active period.
4. Data survives app kill and device restart.
5. Withdraw on Saving is blocked when balance is insufficient.
