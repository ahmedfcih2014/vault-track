import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SpendingIncomeTransactionInput } from "@vault-track/shared";
import {
  SPENDING_OPERATION_LABELS,
  spendingIncomeTransactionFormSchema,
  type OperationType,
  type SpendingIncomeTransactionFormValues,
} from "@vault-track/shared";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { cn } from "@/presentation/lib/utils";

interface SpendingTransactionFormProps {
  defaultOperationType?: OperationType;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (input: SpendingIncomeTransactionInput) => Promise<void>;
}

export function SpendingTransactionForm({
  defaultOperationType = "withdraw",
  isSubmitting,
  errorMessage,
  onSubmit,
}: SpendingTransactionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SpendingIncomeTransactionFormValues>({
    resolver: zodResolver(spendingIncomeTransactionFormSchema),
    defaultValues: {
      operationType: defaultOperationType,
      amount: "",
      note: "",
    },
  });

  const operationType = watch("operationType");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clientTransactionIdRef = useRef(crypto.randomUUID());
  const submitLockRef = useRef(false);

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        if (submitLockRef.current || isSubmitting) {
          return;
        }

        submitLockRef.current = true;
        setSubmitError(null);
        try {
          await onSubmit({
            amount: values.amount,
            note: values.note ?? "",
            operationType: values.operationType,
            clientTransactionId: clientTransactionIdRef.current,
          });
        } catch (error) {
          setSubmitError(error instanceof Error ? error.message : "Transaction failed");
        } finally {
          submitLockRef.current = false;
        }
      })}
    >
      <div className="grid grid-cols-2 gap-2">
        {(["deposit", "withdraw"] as const).map((type) => (
          <Button
            key={type}
            type="button"
            variant={operationType === type ? "default" : "secondary"}
            data-testid={type === "deposit" ? "operation-income" : "operation-spending"}
            onClick={() => setValue("operationType", type)}
          >
            {SPENDING_OPERATION_LABELS[type]}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="spending-amount">Amount (EGP)</Label>
        <Input
          id="spending-amount"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          data-testid="spending-amount"
          {...register("amount")}
        />
        {errors.amount ? (
          <p className="text-sm text-rose-400">{errors.amount.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="spending-note">Note (optional)</Label>
        <Input id="spending-note" placeholder="Add a note" {...register("note")} />
      </div>

      {submitError || errorMessage ? (
        <p className={cn("text-sm text-rose-400")}>{submitError ?? errorMessage}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="spending-submit">
        {isSubmitting ? "Saving..." : `Record ${SPENDING_OPERATION_LABELS[operationType]}`}
      </Button>
    </form>
  );
}
