import { redirect } from "next/navigation";
import { ClientDashboard } from "@/components/client/client-dashboard";
import { PendingApproval } from "@/components/client/pending-approval";
import { getRole, ROLES, requireVerified } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function ClientPage() {
  const user = await requireVerified();
  const role = getRole(user);

  // Admin is a superset — send them to their own panel.
  if (role === ROLES.admin) redirect("/admin");

  // Not-yet-approved customers see only the pending notice.
  if (role === ROLES.customer) return <PendingApproval />;

  // Approved clients see their dashboard.
  return <ClientDashboard name={user.name} />;
}
