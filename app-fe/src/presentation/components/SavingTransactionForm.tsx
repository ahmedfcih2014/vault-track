import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SavingTransactionInput } from "@vault-track/shared";
import {
  ACCOUNT_LABELS,
  savingTransactionFormSchema,
  type AccountType,
  type OperationType,
  type SavingTransactionFormValues,
} from "@vault-track/shared";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { cn } from "@/presentation/lib/utils";

interface SavingTransactionFormProps {
  defaultAccountType: AccountType;
  defaultOperationType?: OperationType;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (input: SavingTransactionInput) => Promise<void>;
}

const accountTypes: AccountType[] = ["usd", "sar", "gold_21"];

export function SavingTransactionForm({
  defaultAccountType,
  defaultOperationType = "deposit",
  isSubmitting,
  errorMessage,
  onSubmit,
}: SavingTransactionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SavingTransactionFormValues>({
    resolver: zodResolver(savingTransactionFormSchema),
    defaultValues: {
      accountType: defaultAccountType,
      operationType: defaultOperationType,
      amount: "",
      note: "",
    },
  });

  const operationType = watch("operationType");
  const accountType = watch("accountType");
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
            accountType: values.accountType,
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
            className="capitalize"
            onClick={() => setValue("operationType", type)}
          >
            {type}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountType">Account</Label>
        <select
          id="accountType"
          className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          {...register("accountType")}
        >
          {accountTypes.map((type) => (
            <option key={type} value={type}>
              {ACCOUNT_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount ({ACCOUNT_LABELS[accountType]})</Label>
        <Input
          id="amount"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          data-testid="saving-amount"
          {...register("amount")}
        />
        {errors.amount ? (
          <p className="text-sm text-rose-400">{errors.amount.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input id="note" placeholder="Add a note" {...register("note")} />
      </div>

      {submitError || errorMessage ? (
        <p className={cn("text-sm text-rose-400")}>{submitError ?? errorMessage}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="saving-submit">
        {isSubmitting ? "Saving..." : "Submit transaction"}
      </Button>
    </form>
  );
}
