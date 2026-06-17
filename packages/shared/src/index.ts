// Domain — types
export type {
  AccountType,
  OperationType,
  SyncStatus,
  BaseTransaction,
  SavingTransaction,
  SpendingIncomeTransaction,
  Saving,
  SpendingIncome,
  ArchiveRef,
  ArchiveRecord,
  AppMeta,
} from './domain/types';
export { ACTIVE_DOCUMENT_KEY } from './domain/types';

// Domain — errors
export { DOMAIN_ERROR_CODES, DomainError } from './domain/errors';
export type { DomainErrorCode } from './domain/errors';

// Domain — money & date
export {
  addMoney,
  subtractMoney,
  isPositive,
  compareMoney,
  formatMoney,
  normalizeAmountForAccount,
  formatCurrency,
  formatSignedEgp,
} from './domain/money';
export { nowIso, formatDisplayDate } from './domain/date';

// Domain — saving
export {
  createEmptySaving,
  createSavingTransaction,
  ACCOUNT_LABELS,
  applyDeposit,
  applyWithdraw,
  applySavingTransaction,
} from './domain/saving';
export type { ApplySavingTransactionInput } from './domain/saving';

// Domain — spending-income
export {
  createFreshSpendingIncome,
  SPENDING_OPERATION_LABELS,
  normalizeSpendingAmount,
  createSpendingIncomeTransaction,
  applySpendingIncomeTransaction,
} from './domain/spending-income';
export type { ApplySpendingIncomeTransactionInput } from './domain/spending-income';

// Domain — archive
export {
  buildArchiveFilename,
  cloneSpendingIncomePeriod,
  closePeriodSnapshot,
} from './domain/archive';

// Application — contracts
export type {
  SavingTransactionInput,
  SavingTransactionPersistenceInput,
  SpendingIncomeTransactionInput,
  SpendingIncomeTransactionPersistenceInput,
  SavingDto,
  SpendingIncomeDto,
  BootstrapResult,
} from './application/contracts/dtos';
export { ERROR_CODES } from './application/contracts/error-codes';

// Application — ports
export type {
  ISavingRepository,
  ISpendingIncomeRepository,
  ArchiveMeta,
  IArchiveService,
  IAppBootstrap,
} from './application/ports/repositories';

// Application — use cases
export { ApplySavingTransactionUseCase } from './application/use-cases/apply-saving-transaction';
export { ApplySpendingIncomeTransactionUseCase } from './application/use-cases/apply-spending-income-transaction';
export { ResetSpendingIncomePeriodUseCase } from './application/use-cases/reset-spending-income-period';

// Application — validators
export {
  accountTypeSchema,
  operationTypeSchema,
  savingTransactionFormSchema,
  spendingIncomeTransactionFormSchema,
  savingSchema,
  spendingIncomeSchema,
} from './application/validators/schemas';
export type {
  SavingTransactionFormValues,
  SpendingIncomeTransactionFormValues,
} from './application/validators/schemas';
export { validateSavingTransactionInput } from './application/validators/validate-saving-transaction';
export {
  validateSpendingIncomeTransactionInput,
  validateSpendingIncomePeriod,
} from './application/validators/validate-spending-income-transaction';
export { validatePersistedSnapshot } from './application/validators/validate-persisted-snapshot';
