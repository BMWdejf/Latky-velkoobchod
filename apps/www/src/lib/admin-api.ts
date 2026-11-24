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

export type AdminOverview = {
  warehouseId: string | null;
  warehouseName: string | null;
  ruleCount: number;
  total: number;
  lowStock: number;
  outOfStock: number;
  criticalItems: Array<{
    id: string;
    sku: string;
    name: string;
    stock: number;
  }>;
  groups: Array<{ name: string; count: number; share: number }>;
  flexibeeOk: boolean;
  databaseOk: boolean;
};

export const fetchOverview = () => adminRequest<AdminOverview>("/overview");

export type AdminProductFilter = "all" | "low" | "out" | "hidden";

/** Mirrors `AdminProduct` returned by `GET /admin/products` in apps/api. */
export type AdminProduct = {
  id: string;
  sku: string;
  name: string;
  unitPrice: number;
  currency: "CZK";
  unit: string | null;
  stock: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  group: string | null;
  minOrder: number | null;
  width: string | null;
  weight: string | null;
  composition: string | null;
  ean: string | null;
  minStock: number | null;
  visibleForWeb: boolean;
};

export type AdminProductPage = {
  items: AdminProduct[];
  total: number;
  limit: number;
  start: number;
  counts: Record<AdminProductFilter, number>;
  kpis: {
    totalSku: number;
    hiddenForWeb: number;
    lowStock: number;
    outOfStock: number;
    stockValue: number;
  };
};

export type AdminProductQuery = {
  q?: string;
  filter?: AdminProductFilter;
  group?: string;
  start?: number;
  limit?: number;
};

/** Product list for the admin Products page. Filters and paging go to the API. */
export const fetchAdminProducts = (query: AdminProductQuery) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return adminRequest<AdminProductPage>(`/products${qs ? `?${qs}` : ""}`);
};
