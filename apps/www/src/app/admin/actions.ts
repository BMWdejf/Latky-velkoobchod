"use server";

import { revalidatePath } from "next/cache";
import { saveWarehouseId } from "@/lib/admin-api";
import { getAdminUser } from "@/lib/admin-session";

export type SaveWarehouseState = {
  status: "idle" | "saved" | "error";
  message?: string;
};

export const saveWarehouseAction = async (
  _previous: SaveWarehouseState,
  formData: FormData,
): Promise<SaveWarehouseState> => {
  // Checked in the action itself: a Server Action can be invoked on any route.
  if (!(await getAdminUser())) {
    return {
      status: "error",
      message: "Nejste přihlášeni jako administrátor.",
    };
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
