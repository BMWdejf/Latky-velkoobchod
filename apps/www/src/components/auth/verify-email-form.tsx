"use client";

import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  type AuthFormState,
  resendOtpAction,
  verifyEmailAction,
} from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VerifyEmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    verifyEmailAction,
    undefined,
  );
  const [resendState, resend, resending] = useActionState<
    AuthFormState,
    FormData
  >(resendOtpAction, undefined);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  useEffect(() => {
    if (resendState?.email)
      toast.success("Nový kód byl odeslán na váš e-mail.");
    if (resendState?.error) toast.error(resendState.error);
  }, [resendState]);

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="otp">Ověřovací kód</Label>
          <Input
            id="otp"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Kód z e-mailu"
            required
          />
          {state?.fieldErrors?.otp && (
            <p className="text-sm text-destructive">
              {state.fieldErrors.otp[0]}
            </p>
          )}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Ověřuji…" : "Ověřit e-mail"}
        </Button>
      </form>
      <form action={resend}>
        <input type="hidden" name="email" value={email} />
        <Button
          type="submit"
          variant="ghost"
          disabled={resending}
          className="w-full"
        >
          {resending ? "Odesílám…" : "Poslat kód znovu"}
        </Button>
      </form>
    </div>
  );
}
