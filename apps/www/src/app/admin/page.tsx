export const dynamic = "force-dynamic";

import { requireAdminUser } from "@/lib/admin-session";
import { OverviewDesktop } from "./_components/overview-desktop";
import { OverviewMobile } from "./_components/overview-mobile";

/** Overview: the start page of the admin, from the Figma designs. */
export default async function AdminOverviewPage() {
  await requireAdminUser();

  const updatedLabel = `Před 3 min`;

  return (
    <>
      <OverviewDesktop updatedLabel={updatedLabel} />
      <OverviewMobile />
    </>
  );
}
