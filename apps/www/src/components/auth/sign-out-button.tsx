import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outline" size="sm">
        Odhlásit se
      </Button>
    </form>
  );
}
