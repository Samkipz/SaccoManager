import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AmountInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  currency?: string;
  note?: string;
  error?: string;
  className?: string;
}

export function AmountInput({
  id,
  label,
  currency = "$",
  note,
  error,
  className,
  ...props
}: AmountInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</Label>}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">{currency}</span>
        </div>
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          className={cn("pl-8", error && "border-red-500 focus:ring-red-500 focus:border-red-500")}
          {...props}
        />
      </div>
      {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
