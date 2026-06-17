const assert = require('node:assert/strict');
const {
  applySavingTransaction,
  createEmptySaving,
} = require('../dist/domain/saving');
const {
  applySpendingIncomeTransaction,
  createFreshSpendingIncome,
} = require('../dist/domain/spending-income');
const { closePeriodSnapshot } = require('../dist/domain/archive');
const { validateSavingTransactionInput } = require('../dist/application/validators/validate-saving-transaction');
const { DOMAIN_ERROR_CODES, DomainError } = require('../dist/domain/errors');

const SAVING_ID = '00000000-0000-4000-8000-000000000001';
const PERIOD_ID = '00000000-0000-4000-8000-000000000002';
const TX_ID = '00000000-0000-4000-8000-000000000010';
const CREATED_AT = '2026-06-17T10:00:00+03:00';

let saving = createEmptySaving(SAVING_ID);
saving = applySavingTransaction(saving, {
  id: TX_ID,
  accountType: 'usd',
  amount: '100',
  note: '',
  operationType: 'deposit',
  createdAt: CREATED_AT,
});
assert.equal(saving.balance.usd, '100.00');
assert.equal(saving.balance.sar, '0');

try {
  applySavingTransaction(saving, {
    id: '00000000-0000-4000-8000-000000000012',
    accountType: 'usd',
    amount: '200',
    note: '',
    operationType: 'withdraw',
    createdAt: CREATED_AT,
  });
  assert.fail('Expected insufficient balance error');
} catch (err) {
  assert.ok(err instanceof DomainError);
  assert.equal(err.code, DOMAIN_ERROR_CODES.INSUFFICIENT_BALANCE);
}

let period = createFreshSpendingIncome(PERIOD_ID);
period = applySpendingIncomeTransaction(period, {
  id: TX_ID,
  amount: '100',
  note: 'salary',
  operationType: 'deposit',
  createdAt: CREATED_AT,
});
period = applySpendingIncomeTransaction(period, {
  id: '00000000-0000-4000-8000-000000000011',
  amount: '40',
  note: 'groceries',
  operationType: 'withdraw',
  createdAt: CREATED_AT,
});
assert.equal(period.balance, '60.00');

const snapshot = closePeriodSnapshot(period, CREATED_AT);
assert.equal(snapshot.resetedAt, CREATED_AT);
assert.equal(snapshot.transactions.length, 2);

assert.throws(
  () =>
    validateSavingTransactionInput(
      { accountType: 'usd', amount: '0', note: '', operationType: 'deposit' },
      saving,
    ),
  DomainError,
);

console.log('Smoke tests passed (BRD acceptance criteria core paths).');
