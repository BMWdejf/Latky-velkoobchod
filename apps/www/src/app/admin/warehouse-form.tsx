"use client";

import { useActionState } from "react";
import type { ProductRule, Warehouse } from "@/lib/admin-api";
import { type SaveWarehouseState, saveWarehouseAction } from "./actions";
import { RulesEditor } from "./rules-editor";
import { WAREHOUSE_FORM_ID } from "./warehouse-form-id";

const initialState: SaveWarehouseState = { status: "idle" };

type WarehouseFormProps = {
  warehouses: Warehouse[];
  currentWarehouseId: string | null;
  currentRules: ProductRule[];
};

export function WarehouseForm({
  warehouses,
  currentWarehouseId,
  currentRules,
}: WarehouseFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveWarehouseAction,
    initialState,
  );

  return (
    <form
      id={WAREHOUSE_FORM_ID}
      action={formAction}
      className="flex flex-col gap-4"
    >
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

      <RulesEditor initialRules={currentRules} />

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-[4px] bg-[#1e3f35] px-4 py-2 text-sm font-medium text-white max-md:hidden disabled:opacity-50"
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
