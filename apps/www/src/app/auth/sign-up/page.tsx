import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect("/client");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Registrace</CardTitle>
        <CardDescription>
          Vytvořte si účet. Po registraci vám pošleme ověřovací kód e-mailem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
