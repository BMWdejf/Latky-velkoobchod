import { Hero } from "./_components/hero";
import { ProductCatalog } from "./_components/product-catalog";
import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";
import { ValuePropsBar } from "./_components/value-props-bar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <ValuePropsBar />
        <ProductCatalog />
      </main>
      <SiteFooter />
    </div>
  );
}
