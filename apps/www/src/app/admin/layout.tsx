import type { ReactNode } from "react";
import { fetchSettings, fetchWarehouses } from "@/lib/admin-api";
import { getAdminUser } from "@/lib/admin-session";
import { AdminHeader } from "./_components/admin-header";
import { AdminMobileNav } from "./_components/admin-mobile-nav";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminStickyBar } from "./_components/admin-sticky-bar";

export const dynamic = "force-dynamic";

/**
 * Admin shell from the Figma designs.
 * Desktop: sidebar on the left, top bar, scrolling main.
 * Mobile: top bar, navigation row, scrolling main, and an action bar fixed to
 * the bottom edge. Without a signed-in admin (the login page) only the
 * children are rendered.
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
    <div className="flex h-dvh overflow-hidden bg-[#faf9f6] font-[family-name:var(--font-plus-jakarta)] text-[#1c1917]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          email={user.email}
          flexibeeOk={warehouses.status === "ok"}
          databaseOk={settings.status === "ok"}
        />
        <AdminMobileNav />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
          {children}
        </main>
        <AdminStickyBar />
      </div>
    </div>
  );
}
