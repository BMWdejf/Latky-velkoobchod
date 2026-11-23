import "server-only";

export type Warehouse = {
  id: string;
  code: string;
  name: string;
};

export type AppSettings = {
  warehouseId: string | null;
};

export type AdminDataResult<T> =
  | { status: "ok"; data: T }
  | { status: "unauthorized" }
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

export const saveWarehouseId = (warehouseId: string | null) =>
  adminRequest<AppSettings>("/settings", {
    method: "PUT",
    body: JSON.stringify({ warehouseId }),
  });
