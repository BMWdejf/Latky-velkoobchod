"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { saveWarehouseId } from "@/lib/admin-api";
import { isAdminAuthorized } from "@/lib/admin-auth";

export type SaveWarehouseState = {
  status: "idle" | "saved" | "error";
  message?: string;
};

export const saveWarehouseAction = async (
  _previous: SaveWarehouseState,
  formData: FormData,
): Promise<SaveWarehouseState> => {
  // Enforced here, not only in proxy.ts: a Server Action can be invoked on
  // routes outside the /admin matcher.
  const requestHeaders = await headers();
  if (!isAdminAuthorized(requestHeaders.get("authorization"))) {
    return { status: "error", message: "Neautorizováno." };
  }

  const raw = formData.get("warehouseId");
  const warehouseId =
    typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null;

  const result = await saveWarehouseId(warehouseId);

  if (result.status !== "ok") {
    return {
      status: "error",
      message:
        result.status === "unauthorized"
          ? "API odmítla token (ADMIN_TOKEN)."
          : "API není dostupné nebo není nakonfigurované.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { status: "saved" };
};
