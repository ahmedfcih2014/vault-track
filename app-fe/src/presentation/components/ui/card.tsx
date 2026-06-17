import type { HTMLAttributes } from "react";
import { cn } from "@/presentation/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-slate-800 bg-slate-900/80 p-4", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-medium text-slate-400", className)} {...props} />;
}

export function CardValue({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-1 text-2xl font-semibold tracking-tight text-slate-50", className)} {...props} />
  );
}
