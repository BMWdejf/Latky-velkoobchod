"use client";

import { useActionState } from "react";
import type { ProductRule } from "@/lib/admin-api";
import { type SaveState, saveRulesAction } from "./actions";
import { RULES_FORM_ID } from "./form-ids";
import { RulesEditor } from "./rules-editor";

const initialState: SaveState = { status: "idle" };

export function RulesForm({ initialRules }: { initialRules: ProductRule[] }) {
  const [state, formAction, isPending] = useActionState(
    saveRulesAction,
    initialState,
  );

  return (
    <form
      id={RULES_FORM_ID}
      action={formAction}
      className="flex flex-col gap-4"
    >
      <RulesEditor initialRules={initialRules} />

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-[4px] bg-[#1e3f35] px-4 py-2 text-sm font-medium text-white max-md:hidden disabled:opacity-50"
      >
        {isPending ? "Ukládám…" : "Uložit pravidla"}
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
