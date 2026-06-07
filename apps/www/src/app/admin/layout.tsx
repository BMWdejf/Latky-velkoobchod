import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Toaster } from "@/components/ui/toaster";

/**
 * Admin shell layout. Per Next.js guidance, no auth check happens here
 * (layouts don't re-run on every navigation) — the gate lives in each page.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 px-5 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link href="/admin" className="text-lg font-semibold">
            Loci <span className="text-muted-foreground">Admin</span>
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
