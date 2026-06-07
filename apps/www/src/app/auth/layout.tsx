import Image from "next/image";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-5 py-10">
      <Link href="/" className="flex items-center gap-2" aria-label="Loci home">
        <Image
          alt="Loci logo"
          src="/logo.svg"
          width={20}
          height={20}
          className="dark:invert"
        />
        <span className="text-xl font-semibold">Loci</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <Toaster />
    </div>
  );
}
