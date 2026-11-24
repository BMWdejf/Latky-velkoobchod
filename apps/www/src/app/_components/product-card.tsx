import Image from "next/image";
import { formatCzk, formatQuantity } from "@/lib/format";
import type { Product } from "@/lib/products";
import { QuantityStepper } from "./quantity-stepper";

const stockLabel = (product: Product): string => {
  const unit = product.unit ?? "ks";
  const quantity = formatQuantity(product.stock);

  switch (product.stockStatus) {
    case "out_of_stock":
      return "Vyprodáno";
    case "low_stock":
      return `Nízký stav (${quantity} ${unit})`;
    case "in_stock":
      return `Skladem (${quantity} ${unit})`;
  }
};

const stockClasses: Record<Product["stockStatus"], string> = {
  in_stock: "bg-card text-brand",
  low_stock: "bg-[#fef3c7] text-[#78350f]",
  out_of_stock: "bg-muted text-ink-muted",
};

export function ProductCard({ product }: { product: Product }) {
  const unit = product.unit ?? "ks";
  const minOrder = product.minOrder ?? 1;
  const isAvailable = product.stockStatus !== "out_of_stock";

  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-hairline bg-card">
      <div className="relative flex aspect-square items-end justify-start bg-[#f5f5f5] p-3">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            unoptimized
            className="object-cover"
          />
        ) : null}
        <span
          className={`rounded-sm px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] ${stockClasses[product.stockStatus]}`}
        >
          {stockLabel(product)}
        </span>
        {product.weight ? (
          <span className="absolute right-3 top-3 rounded-sm bg-card px-2 py-1 text-[11px] font-semibold text-foreground">
            {product.weight}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
            SKU: {product.sku}
          </p>
          <h3 className="font-serif text-xl leading-tight text-foreground">
            {product.name}
          </h3>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {product.minOrder !== null ? (
            <li className="rounded-sm bg-sand px-2 py-1 text-[11px] font-semibold text-foreground">
              Min. odběr: {product.minOrder} {unit}
            </li>
          ) : null}
          {product.width ? (
            <li className="rounded-sm bg-sand px-2 py-1 text-[11px] font-semibold text-foreground">
              Šíře: {product.width}
            </li>
          ) : null}
          {product.composition ? (
            <li className="rounded-sm bg-sand px-2 py-1 text-[11px] font-semibold text-foreground">
              {product.composition}
            </li>
          ) : null}
        </ul>

        <div className="mt-auto flex flex-col gap-3 border-t border-hairline pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs text-ink-muted">Velkoobchodní cena</p>
            <p className="font-bold text-foreground">
              {formatCzk(product.unitPrice)}
              <span className="text-xs font-normal text-ink-muted">
                {" "}
                / {unit} bez DPH
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <QuantityStepper
              productName={product.name}
              min={minOrder}
              unit={product.unit}
            />
            <button
              type="button"
              disabled
              className="h-10 flex-1 rounded-sm bg-brand px-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAvailable
                ? "Do objednávky (brzy)"
                : "Upozornit na naskladnění"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
