import type { LucideIcon } from "lucide-react";
import { Clock3, Landmark, Package, Truck } from "lucide-react";

type ValueProp = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const valueProps: ValueProp[] = [
  {
    title: "Minimální odběr od 1 role (10 m)",
    description: "Flexibilní šarže pro vzorování i velkosériovou výrobu.",
    icon: Package,
  },
  {
    title: "Doprava zdarma od 15 000 Kč",
    description: "Vlastní závozová linka i spolehlivá paletová doprava.",
    icon: Truck,
  },
  {
    title: "Expedice do 24 hodin",
    description: "98 % položek reálně skladem v centrálním skladu Praha.",
    icon: Clock3,
  },
  {
    title: "Fakturace net 60",
    description: "Individuální platební a kreditní limity pro partnery.",
    icon: Landmark,
  },
];

export function ValuePropsBar() {
  return (
    <section aria-label="Výhody pro velkoobchod" className="py-4">
      <ul className="mx-auto grid max-w-[1280px] grid-cols-2 gap-4 px-4 md:px-6 lg:grid-cols-4 lg:px-8">
        {valueProps.map(({ title, description, icon: Icon }) => (
          <li
            key={title}
            className="flex gap-3 rounded-sm border border-hairline bg-card px-4 py-[21px]"
          >
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-sm bg-sage text-brand">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-[11px] font-semibold uppercase leading-4 tracking-[0.04em] text-foreground">
                {title}
              </h2>
              <p className="text-xs leading-[18px] text-ink-muted">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
