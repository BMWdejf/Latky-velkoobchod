import { BadRequestException } from "@nestjs/common";
import type { Product } from "./product.mapper";

/**
 * A product is shown only when every rule matches. A rule is
 * `field + operator + value`, and the allowed operators depend on the field.
 */
export const RULE_FIELDS = ["stock", "price", "group", "code", "name"] as const;
export type RuleField = (typeof RULE_FIELDS)[number];

const OPERATORS_BY_FIELD = {
  stock: ["gt", "gte", "lt", "lte", "eq"],
  price: ["gt", "gte", "lt", "lte", "eq"],
  group: ["eq", "in", "notIn"],
  code: ["eq", "contains", "notContains"],
  name: ["contains", "notContains"],
} as const satisfies Record<RuleField, readonly string[]>;

export type RuleOperator =
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "eq"
  | "in"
  | "notIn"
  | "contains"
  | "notContains";

export type ProductRule =
  | {
      field: "stock" | "price";
      op: "gt" | "gte" | "lt" | "lte" | "eq";
      value: number;
    }
  | { field: "group"; op: "eq"; value: string }
  | { field: "group"; op: "in" | "notIn"; value: string[] }
  | {
      field: "code" | "name";
      op: "eq" | "contains" | "notContains";
      value: string;
    };

export const MAX_RULES = 20;
const MAX_TEXT_LENGTH = 200;

const fail = (message: string): never => {
  throw new BadRequestException(message);
};

const isRuleField = (value: unknown): value is RuleField =>
  typeof value === "string" &&
  (RULE_FIELDS as readonly string[]).includes(value);

const parseNumber = (value: unknown): number => {
  const number =
    typeof value === "string" ? Number(value.replace(",", ".")) : value;
  if (typeof number !== "number" || !Number.isFinite(number)) {
    fail("Rule value must be a number");
  }
  return number as number;
};

const parseText = (value: unknown): string => {
  if (
    typeof value !== "string" ||
    value.trim() === "" ||
    value.length > MAX_TEXT_LENGTH
  ) {
    fail("Rule value must be a non-empty text");
  }
  return (value as string).trim();
};

const parseList = (value: unknown): string[] => {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : fail("Rule value must be a list of group codes");
  const codes = (list as unknown[]).map(parseText);
  if (codes.length === 0) {
    fail("Rule value must contain at least one group code");
  }
  return codes;
};

/** Validates rules coming from the admin form or API body. Throws 400 on error. */
export const parseRules = (input: unknown): ProductRule[] => {
  if (input === undefined || input === null) {
    return [];
  }
  if (!Array.isArray(input) || input.length > MAX_RULES) {
    fail(`Rules must be a list with at most ${MAX_RULES} items`);
  }

  return (input as Array<Record<string, unknown>>).map((rule) => {
    const { field, op } = rule;
    if (!isRuleField(field)) {
      fail(`Unknown rule field: ${String(field)}`);
    }
    const allowed = OPERATORS_BY_FIELD[field as RuleField] as readonly string[];
    if (typeof op !== "string" || !allowed.includes(op)) {
      fail(`Operator ${String(op)} is not allowed for ${String(field)}`);
    }

    switch (field) {
      case "stock":
      case "price":
        return { field, op, value: parseNumber(rule.value) } as ProductRule;
      case "group":
        return op === "eq"
          ? { field, op, value: parseText(rule.value) }
          : { field, op: op as "in" | "notIn", value: parseList(rule.value) };
      default:
        return { field, op, value: parseText(rule.value) } as ProductRule;
    }
  });
};

const compareNumber = (
  actual: number,
  op: string,
  expected: number,
): boolean => {
  switch (op) {
    case "gt":
      return actual > expected;
    case "gte":
      return actual >= expected;
    case "lt":
      return actual < expected;
    case "lte":
      return actual <= expected;
    default:
      return actual === expected;
  }
};

/** Stock is the warehouse quantity when a warehouse is selected, else the total. */
export const matchesRule = (product: Product, rule: ProductRule): boolean => {
  switch (rule.field) {
    case "stock":
      return compareNumber(product.stock, rule.op, rule.value);
    case "price":
      return compareNumber(product.unitPrice, rule.op, rule.value);
    case "group": {
      const group = (product.group ?? "").toLowerCase();
      if (rule.op === "eq") {
        return group === rule.value.toLowerCase();
      }
      const listed = rule.value
        .map((code) => code.toLowerCase())
        .includes(group);
      return rule.op === "in" ? listed : !listed;
    }
    default: {
      const text = (
        rule.field === "code" ? product.sku : product.name
      ).toLowerCase();
      const expected = rule.value.toLowerCase();
      if (rule.op === "eq") {
        return text === expected;
      }
      return rule.op === "contains"
        ? text.includes(expected)
        : !text.includes(expected);
    }
  }
};

export const matchesAllRules = (
  product: Product,
  rules: ProductRule[],
): boolean => rules.every((rule) => matchesRule(product, rule));
