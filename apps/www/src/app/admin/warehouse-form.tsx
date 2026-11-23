"use client";

import { useActionState } from "react";
import type { Warehouse } from "@/lib/admin-api";
import { type SaveWarehouseState, saveWarehouseAction } from "./actions";

const initialState: SaveWarehouseState = { status: "idle" };

type WarehouseFormProps = {
  warehouses: Warehouse[];
  currentWarehouseId: string | null;
};

export function WarehouseForm({
  warehouses,
  currentWarehouseId,
}: WarehouseFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveWarehouseAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Sklad
        <select
          name="warehouseId"
          defaultValue={currentWarehouseId ?? ""}
          className="rounded-md border bg-background px-3 py-2"
        >
          <option value="">Globální zásoba (výchozí)</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.code} – {warehouse.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {isPending ? "Ukládám…" : "Uložit"}
      </button>

      {state.status === "saved" ? (
        <output className="text-sm">Uloženo.</output>
      ) : null}
      {state.status === "error" ? (
        <p role="alert" className="text-sm">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
