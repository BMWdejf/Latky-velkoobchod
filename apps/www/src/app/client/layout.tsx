import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Toaster } from "@/components/ui/toaster";

export default function ClientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 px-5 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link href="/client" className="text-lg font-semibold">
            Loci
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-5 py-8">{children}</main>
      <Toaster />
    </div>
  );
}
