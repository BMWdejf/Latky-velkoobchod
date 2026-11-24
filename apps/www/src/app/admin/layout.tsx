import type { ReactNode } from "react";
import { fetchSettings, fetchWarehouses } from "@/lib/admin-api";
import { getAdminUser } from "@/lib/admin-session";
import { AdminHeader } from "./_components/admin-header";
import { AdminSidebar } from "./_components/admin-sidebar";

export const dynamic = "force-dynamic";

/**
 * Admin shell from the Figma design: dark sidebar on the left, white top bar.
 * Without a signed-in admin (the login page) only the children are rendered.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getAdminUser();

  if (!user) {
    return <>{children}</>;
  }

  const [warehouses, settings] = await Promise.all([
    fetchWarehouses(),
    fetchSettings(),
  ]);

  return (
    <div className="flex min-h-screen bg-[#faf9f6] font-[family-name:var(--font-plus-jakarta)] text-[#1c1917]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          email={user.email}
          flexibeeOk={warehouses.status === "ok"}
          databaseOk={settings.status === "ok"}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
