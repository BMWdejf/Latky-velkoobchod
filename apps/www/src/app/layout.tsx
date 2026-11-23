import "./globals.css";
import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-switcher";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-plus-jakarta",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-newsreader",
  display: "swap",
});

const title = "Látky Velkoobchod";
const description =
  "Velkoobchodní dodávky prémiových textilií a ložního prádla z centrálního skladu v Praze";

export const metadata: Metadata = {
  title,
  description,
  icons: "/favicon.svg",
  openGraph: {
    title,
    type: "website",
    siteName: title,
    locale: "cs-CZ",
    description,
    images: "/og-banner.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  twitter: {
    title,
    images: "/og-banner.png",
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${newsreader.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          forcedTheme="light"
          defaultTheme="light"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
