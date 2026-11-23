import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-[1fr_0.8fr] lg:gap-16 lg:px-10 lg:py-20">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-sm bg-brand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-primary-foreground">
              Partner Gold
            </span>
            <span className="rounded-sm border border-hairline bg-card px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-foreground">
              -15% sleva pro velkoobchod
            </span>
          </div>

          <h1 className="font-serif text-4xl leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-[52px]">
            Velkoobchodní dodávky prémiových textilií &amp; ložního prádla
          </h1>

          <p className="max-w-xl text-base leading-6 text-ink-muted md:text-lg">
            Přímý dovoz látek v rolích, metráže a hotelových kolekcí pro oděvní
            značky, krejčovské ateliéry a ubytovací kapacity. Trvalé skladové
            zásoby v Praze a rychlá expedice.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button asChild size="lg" className="h-11 rounded-sm px-6">
              <a href="#katalog">
                Přejít do velkoobchodního katalogu
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled
              className="h-11 rounded-sm px-6"
            >
              Rychlá objednávka podle SKU
            </Button>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative hidden aspect-[4/5] overflow-hidden rounded-lg border border-hairline bg-gradient-to-br from-sage via-sand to-brand-soft lg:block"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3f3512_1px,transparent_1px),linear-gradient(to_bottom,#1e3f3512_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
      </div>
    </section>
  );
}
