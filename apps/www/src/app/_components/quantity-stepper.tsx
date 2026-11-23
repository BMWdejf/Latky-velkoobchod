"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

type QuantityStepperProps = {
  productName: string;
  min: number;
  unit: string | null;
};

export function QuantityStepper({
  productName,
  min,
  unit,
}: QuantityStepperProps) {
  const [quantity, setQuantity] = useState(min);
  const label = unit ?? "ks";

  const decrease = () => setQuantity((value) => Math.max(min, value - 1));
  const increase = () => setQuantity((value) => value + 1);

  return (
    <div className="flex items-stretch overflow-hidden rounded-sm border border-hairline bg-card">
      <button
        type="button"
        onClick={decrease}
        disabled={quantity <= min}
        aria-label={`Snížit množství: ${productName}`}
        className="flex w-9 items-center justify-center border-r border-hairline text-foreground hover:bg-muted disabled:opacity-40"
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        value={quantity}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          setQuantity(Number.isFinite(next) ? Math.max(min, next) : min);
        }}
        aria-label={`Množství v ${label}: ${productName}`}
        className="w-14 bg-transparent text-center text-sm font-bold tabular-nums text-foreground outline-none"
      />
      <span className="flex items-center pr-2 text-xs text-ink-muted">
        {label}
      </span>
      <button
        type="button"
        onClick={increase}
        aria-label={`Zvýšit množství: ${productName}`}
        className="flex w-9 items-center justify-center border-l border-hairline text-foreground hover:bg-muted"
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
