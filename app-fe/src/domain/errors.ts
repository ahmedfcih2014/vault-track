export const DOMAIN_ERROR_CODES = {
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  STORAGE_ERROR: "STORAGE_ERROR",
  CORRUPT_DATA: "CORRUPT_DATA",
} as const;

export type DomainErrorCode =
  (typeof DOMAIN_ERROR_CODES)[keyof typeof DOMAIN_ERROR_CODES];

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    code: DomainErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.details = details;
  }
}
