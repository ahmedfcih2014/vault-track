# Vault Track Mobile — Manual Acceptance Checklist

Run on a device or emulator after `npm run start:rn`. Mark each item pass/fail.

## Saving (FR-01–04, BR-S01–05)

- [ ] Three balance cards show USD, SAR, and Gold 21k (g)
- [ ] Deposit to one account updates only that account balance
- [ ] Withdraw reduces balance; history shows new row
- [ ] Withdraw more than balance shows an error and does not change balance
- [ ] Kill and reopen app — balances and history persist

## Spending (FR-05–08, BR-SP01–05)

- [ ] Period header shows `startedAt` date
- [ ] Income (deposit) increases signed EGP balance
- [ ] Spending (withdraw) decreases signed EGP balance
- [ ] Negative balance displays correctly when spending exceeds income
- [ ] Each history row has amount, note, and timestamp

## Reset & archives (FR-09–11, BR-R01–04)

- [ ] "End period" opens confirm dialog; cancel does nothing
- [ ] Confirm ends period: balance resets to 0, history clears, new `startedAt`
- [ ] Share sheet offers JSON export after reset
- [ ] Archives tab lists the closed period without leaving the app
- [ ] Archive detail shows full transaction history
- [ ] Per-archive export works from Archives tab

## Settings & recovery

- [ ] Settings → Export full backup produces shareable JSON
- [ ] Offline (airplane mode): deposit and spending still work (NFR-02)
- [ ] Operations feel instant (< 300 ms perceived, NFR-06)

## Automated coverage (unit tests in `packages/shared`)

These BRD rules are covered by `npm test` at repo root (Node 20+):

| Rule / criterion | Test file |
|------------------|-----------|
| Balance math per account | `domain/saving.test.ts` |
| Insufficient withdraw (BR-S03) | `domain/saving.test.ts`, `validators/validate-saving-transaction.test.ts` |
| Signed spending balance | `domain/spending-income.test.ts` |
| Reset archive + fresh period | `use-cases/reset-spending-income-period.test.ts` |
| Corrupt data detection | `validators/validate-persisted-snapshot.test.ts` |
