export const dynamic = "force-dynamic";

import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Admin – přihlášení</h1>
      </header>
      <LoginForm />
    </main>
  );
}
