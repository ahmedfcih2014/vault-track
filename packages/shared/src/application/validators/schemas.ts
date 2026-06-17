import { z } from "zod";

const positiveAmountSchema = z
  .string()
  .trim()
  .min(1, "Amount is required")
  .refine((value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0;
  }, "Amount must be greater than zero");

export const accountTypeSchema = z.enum(["usd", "sar", "gold_21"]);
export const operationTypeSchema = z.enum(["deposit", "withdraw"]);

export const savingTransactionFormSchema = z.object({
  accountType: accountTypeSchema,
  amount: positiveAmountSchema,
  note: z.string().trim().max(500),
  operationType: operationTypeSchema,
});

export const spendingIncomeTransactionFormSchema = z.object({
  amount: positiveAmountSchema,
  note: z.string().trim().max(500),
  operationType: operationTypeSchema,
});

export const savingSchema = z.object({
  id: z.string().uuid(),
  balance: z.object({
    usd: z.string(),
    sar: z.string(),
    gold_21: z.string(),
  }),
  transactions: z.array(
    z.object({
      id: z.string().uuid(),
      amount: z.string(),
      note: z.string(),
      operationType: operationTypeSchema,
      createdAt: z.string().datetime({ offset: true }),
      accountType: accountTypeSchema,
      syncStatus: z.enum(["local", "pending", "synced", "failed"]).optional(),
      serverId: z.string().optional(),
    }),
  ),
  updatedAt: z.string().datetime({ offset: true }),
  version: z.number().optional(),
});

export const spendingIncomeSchema = z.object({
  id: z.string().uuid(),
  startedAt: z.string().datetime({ offset: true }),
  resetedAt: z.string().datetime({ offset: true }).nullable(),
  balance: z.string(),
  transactions: z.array(
    z.object({
      id: z.string().uuid(),
      amount: z.string(),
      note: z.string(),
      operationType: operationTypeSchema,
      createdAt: z.string().datetime({ offset: true }),
      syncStatus: z.enum(["local", "pending", "synced", "failed"]).optional(),
      serverId: z.string().optional(),
    }),
  ),
  updatedAt: z.string().datetime({ offset: true }),
  version: z.number().optional(),
});

export type SavingTransactionFormValues = z.infer<typeof savingTransactionFormSchema>;
export type SpendingIncomeTransactionFormValues = z.infer<
  typeof spendingIncomeTransactionFormSchema
>;
