"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { type AuthFormState, signInAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signInAction,
    undefined,
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        {state?.fieldErrors?.email && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Heslo</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state?.fieldErrors?.password && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Přihlašuji…" : "Přihlásit se"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Nemáte účet?{" "}
        <Link href="/auth/sign-up" className="text-primary hover:underline">
          Zaregistrovat se
        </Link>
      </p>
    </form>
  );
}
