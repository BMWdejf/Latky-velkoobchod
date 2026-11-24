import "server-only";

export type Warehouse = {
  id: string;
  code: string;
  name: string;
};

export type RuleField = "stock" | "price" | "group" | "code" | "name";

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

/** One condition. The API validates the exact field/operator/value combinations. */
export type ProductRule = {
  field: RuleField;
  op: RuleOperator;
  value: string | number | string[];
};

export type AppSettings = {
  warehouseId: string | null;
  rules: ProductRule[];
};

export type AdminDataResult<T> =
  | { status: "ok"; data: T }
  | { status: "unauthorized" }
  | { status: "invalid"; message: string }
  | { status: "unavailable" };

const apiBaseUrl = (): string =>
  (process.env.API_URL ?? "http://localhost:3000").replace(/\/+$/, "");

const adminRequest = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<AdminDataResult<T>> => {
  const token = process.env.ADMIN_TOKEN;

  if (!token) {
    return { status: "unavailable" };
  }

  try {
    const response = await fetch(`${apiBaseUrl()}/admin${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
        ...init.headers,
      },
      cache: "no-store",
    });

    if (response.status === 401) {
      return { status: "unauthorized" };
    }
    if (response.status === 400) {
      const body = (await response.json().catch(() => ({}))) as {
        message?: string | string[];
      };
      const message = Array.isArray(body.message)
        ? body.message.join(" ")
        : (body.message ?? "Neplatné nastavení.");
      return { status: "invalid", message };
    }
    if (!response.ok) {
      return { status: "unavailable" };
    }

    return { status: "ok", data: (await response.json()) as T };
  } catch {
    return { status: "unavailable" };
  }
};

export const fetchWarehouses = () => adminRequest<Warehouse[]>("/warehouses");

export const fetchSettings = () => adminRequest<AppSettings>("/settings");

export const saveSettings = (
  warehouseId: string | null,
  rules: ProductRule[],
) =>
  adminRequest<AppSettings>("/settings", {
    method: "PUT",
    body: JSON.stringify({ warehouseId, rules }),
  });
