"use server";

import { revalidatePath } from "next/cache";
import { fetchSettings, type ProductRule, saveSettings } from "@/lib/admin-api";
import { getAdminUser } from "@/lib/admin-session";

export type SaveState = {
  status: "idle" | "saved" | "error";
  message?: string;
};

/** Saves the warehouse and keeps the rules that are currently stored. */
export const saveWarehouseAction = async (
  _previous: SaveState,
  formData: FormData,
): Promise<SaveState> => {
  // Checked in the action itself: a Server Action can be invoked on any route.
  if (!(await getAdminUser())) {
    return notSignedIn();
  }

  const raw = formData.get("warehouseId");
  const warehouseId =
    typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null;

  const current = await fetchSettings();
  if (current.status !== "ok") {
    return unavailable(current.status);
  }

  return save(warehouseId, current.data.rules, ["/admin"]);
};

/** Saves the rules and keeps the warehouse that is currently stored. */
export const saveRulesAction = async (
  _previous: SaveState,
  formData: FormData,
): Promise<SaveState> => {
  if (!(await getAdminUser())) {
    return notSignedIn();
  }

  const rules = parseRulesField(formData.get("rules"));
  if (!rules) {
    return { status: "error", message: "Pravidla nejsou platná." };
  }

  const current = await fetchSettings();
  if (current.status !== "ok") {
    return unavailable(current.status);
  }

  return save(current.data.warehouseId, rules, ["/admin/pravidla"]);
};

const save = async (
  warehouseId: string | null,
  rules: ProductRule[],
  paths: string[],
): Promise<SaveState> => {
  const result = await saveSettings(warehouseId, rules);

  if (result.status === "invalid") {
    return { status: "error", message: result.message };
  }
  if (result.status !== "ok") {
    return unavailable(result.status);
  }

  for (const path of paths) {
    revalidatePath(path);
  }
  revalidatePath("/");
  return { status: "saved" };
};

const notSignedIn = (): SaveState => ({
  status: "error",
  message: "Nejste přihlášeni jako administrátor.",
});

const unavailable = (status: string): SaveState => ({
  status: "error",
  message:
    status === "unauthorized"
      ? "API odmítla token (ADMIN_TOKEN)."
      : "API není dostupné nebo není nakonfigurované.",
});

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
