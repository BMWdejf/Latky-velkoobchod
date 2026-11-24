"use server";

import { revalidatePath } from "next/cache";
import { type ProductRule, saveSettings } from "@/lib/admin-api";
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

  const rules = parseRulesField(formData.get("rules"));
  if (!rules) {
    return { status: "error", message: "Pravidla nejsou platná." };
  }

  const result = await saveSettings(warehouseId, rules);

  if (result.status === "invalid") {
    return { status: "error", message: result.message };
  }
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

/** The rules editor submits its rows as JSON. Returns null when it is not a list. */
const parseRulesField = (
  raw: FormDataEntryValue | null,
): ProductRule[] | null => {
  if (typeof raw !== "string" || raw.trim() === "") {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProductRule[]) : null;
  } catch {
    return null;
  }
};
