"use client";

import { useState } from "react";
import type {
  ProductRule,
  RuleAction,
  RuleField,
  RuleOperator,
} from "@/lib/admin-api";

const FIELD_LABELS: Record<RuleField, string> = {
  stock: "Zásoba (ks)",
  price: "Cena bez DPH",
  group: "Skupina (kód)",
  code: "Kód produktu",
  name: "Název produktu",
};

const OPERATORS_BY_FIELD: Record<RuleField, RuleOperator[]> = {
  stock: ["gt", "gte", "lt", "lte", "eq"],
  price: ["gt", "gte", "lt", "lte", "eq"],
  group: ["eq", "in", "notIn"],
  code: ["eq", "contains", "notContains"],
  name: ["contains", "notContains"],
};

const OPERATOR_LABELS: Record<RuleOperator, string> = {
  gt: "je větší než",
  gte: "je větší nebo rovno",
  lt: "je menší než",
  lte: "je menší nebo rovno",
  eq: "je rovno",
  in: "je v seznamu",
  notIn: "není v seznamu",
  contains: "obsahuje",
  notContains: "neobsahuje",
};

type Row = {
  field: RuleField;
  op: RuleOperator;
  value: string;
  action: RuleAction;
  text: string;
};

const emptyRow = (): Row => ({
  field: "stock",
  op: "gt",
  value: "0",
  action: "hide",
  text: "",
});

const fromRule = (rule: ProductRule): Row => ({
  field: rule.field,
  op: rule.op,
  value: Array.isArray(rule.value) ? rule.value.join(", ") : String(rule.value),
  action: rule.action ?? "hide",
  text: rule.text ?? "",
});

/** Text rules are allowed on stock only; other fields always hide. */
const ACTIONS_ALLOWED_FOR: RuleField = "stock";

/** Keeps the rows as JSON in a hidden input so the server action receives them. */
export function RulesEditor({ initialRules }: { initialRules: ProductRule[] }) {
  const [rows, setRows] = useState<Row[]>(() => initialRules.map(fromRule));

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) =>
      current.map((row, i) => {
        if (i !== index) {
          return row;
        }
        const next = { ...row, ...patch };
        // Keep the operator valid for the chosen field.
        if (!OPERATORS_BY_FIELD[next.field].includes(next.op)) {
          next.op = OPERATORS_BY_FIELD[next.field][0] as RuleOperator;
        }
        if (next.field !== ACTIONS_ALLOWED_FOR) {
          next.action = "hide";
        }
        return next;
      }),
    );

  const payload = JSON.stringify(
    rows.map((row) => ({
      field: row.field,
      op: row.op,
      value:
        row.field === "stock" || row.field === "price"
          ? Number(row.value.replace(",", "."))
          : row.op === "in" || row.op === "notIn"
            ? row.value
                .split(",")
                .map((code) => code.trim())
                .filter(Boolean)
            : row.value.trim(),
      ...(row.action === "text"
        ? { action: "text", text: row.text.trim() }
        : {}),
    })),
  );

  return (
    <section
      id="pravidla"
      aria-labelledby="pravidla-nadpis"
      className="flex scroll-mt-20 flex-col gap-3 rounded-[4px] border border-[#e2ddd5] bg-white p-4"
    >
      <header className="flex flex-col gap-1">
        <h2
          id="pravidla-nadpis"
          className="text-base font-semibold text-[#1c1917]"
        >
          Pravidla zobrazení
        </h2>
        <p className="text-sm text-[#57534e]">
          Zobrazit produkty jen když platí tyto pravidla
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Žádná pravidla: zobrazí se všechny produkty.
        </p>
      ) : null}

      {rows.map((row, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: rows have no stable id
          key={index}
          className="flex flex-wrap items-center gap-2"
        >
          <select
            aria-label="Pole"
            value={row.field}
            onChange={(event) =>
              update(index, { field: event.target.value as RuleField })
            }
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            {(Object.keys(FIELD_LABELS) as RuleField[]).map((field) => (
              <option key={field} value={field}>
                {FIELD_LABELS[field]}
              </option>
            ))}
          </select>
          <select
            aria-label="Operátor"
            value={row.op}
            onChange={(event) =>
              update(index, { op: event.target.value as RuleOperator })
            }
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            {OPERATORS_BY_FIELD[row.field].map((op) => (
              <option key={op} value={op}>
                {OPERATOR_LABELS[op]}
              </option>
            ))}
          </select>
          <input
            aria-label="Hodnota"
            value={row.value}
            onChange={(event) => update(index, { value: event.target.value })}
            placeholder={
              row.op === "in" || row.op === "notIn" ? "KOD1, KOD2" : ""
            }
            className="min-w-40 flex-1 rounded-md border bg-background px-2 py-1 text-sm"
          />
          {row.field === ACTIONS_ALLOWED_FOR ? (
            <select
              aria-label="Akce"
              value={row.action}
              onChange={(event) =>
                update(index, { action: event.target.value as RuleAction })
              }
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              <option value="hide">Skrýt produkt, když neplatí</option>
              <option value="text">Zobrazit text</option>
            </select>
          ) : null}
          {row.action === "text" ? (
            <input
              aria-label="Text na webu"
              value={row.text}
              onChange={(event) => update(index, { text: event.target.value })}
              placeholder="Např. Očekáváme naskladnění"
              className="min-w-56 flex-1 rounded-md border bg-background px-2 py-1 text-sm"
            />
          ) : null}
          <button
            type="button"
            onClick={() =>
              setRows((current) => current.filter((_, i) => i !== index))
            }
            className="text-sm underline"
          >
            Odebrat
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setRows((current) => [...current, emptyRow()])}
        className="self-start text-sm underline"
      >
        + Přidat podmínku
      </button>

      <input type="hidden" name="rules" value={payload} />
    </section>
  );
}
