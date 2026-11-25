import { ArrowRight } from "lucide-react";

/**
 * Forest-green editorial banner (1216×488, radius 16) from the Figma frame.
 * The image side is a placeholder until product photography is available.
 */
export function Hero() {
  return (
    <section className="px-4 pb-4 pt-6 md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1216px] overflow-hidden rounded-[16px] bg-brand text-primary-foreground lg:h-[488px] lg:grid-cols-[729px_1fr]">
        <div className="flex flex-col justify-center gap-5 p-8 md:p-10 lg:p-14">
          <h1 className="font-serif text-[28px] leading-[34px] tracking-tight md:text-[36px] md:leading-[44px]">
            Velkoobchodní dodávky
            <br className="hidden md:inline" /> prémiových textilií &amp;
            ložního <br className="hidden md:inline" />
            prádla
          </h1>

          <p className="max-w-xl text-base leading-6 text-white/80">
            Přímý dovoz látek v rolích, metráže a hotelových kolekcí pro oděvní
            značky, krejčovské ateliéry a ubytovací kapacity. Trvalé skladové
            zásoby v Praze a rychlá expedice.
          </p>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <a
              href="#katalog"
              className="flex h-11 items-center justify-center gap-2 rounded-sm bg-primary-foreground px-6 text-sm font-semibold text-brand"
            >
              Přejít do velkoobchodního katalogu
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              disabled
              className="h-11 rounded-sm border border-white/40 px-6 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              Rychlá objednávka podle SKU
            </button>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative hidden min-h-[360px] bg-gradient-to-br from-sand via-sage to-brand-soft lg:block"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand to-transparent" />
        </div>
      </div>
    </section>
  );
}
