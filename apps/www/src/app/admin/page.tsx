import { AdminShell } from "@/components/admin/admin-shell";
import { ROLES, requireRole } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Only verified admins reach this; everyone else is redirected to /client.
  const user = await requireRole(ROLES.admin);
  return <AdminShell name={user.name} />;
}
