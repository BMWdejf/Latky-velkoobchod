import { redirect } from "next/navigation";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const user = await getCurrentUser();

  // Already verified users have nothing to do here.
  if (user?.emailVerified) redirect("/client");

  const targetEmail = email ?? user?.email ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Ověření e-mailu</CardTitle>
        <CardDescription>
          {targetEmail
            ? `Zadejte kód, který jsme poslali na ${targetEmail}.`
            : "Zadejte ověřovací kód, který jsme vám poslali e-mailem."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyEmailForm email={targetEmail} />
      </CardContent>
    </Card>
  );
}
