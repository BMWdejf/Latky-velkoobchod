import type { SearchResult } from "@/lib/products";
import { HiddenStateInputs } from "./hidden-state-inputs";
import {
  buildHref,
  hasFilters,
  type ListKey,
  type SearchState,
  toggleValue,
} from "./search-state";

type Facets = SearchResult["facets"];

const AVAILABILITY_LABELS: Record<string, string> = {
  in_stock: "Skladem ihned",
  low_stock: "Nízký stav",
  out_of_stock: "Očekáváme naskladnění",
};

type Option = { value: string; label: string; count: number };

const clearedState = (state: SearchState): SearchState => ({
  ...state,
  availability: [],
  fabricType: [],
  gsm: [],
  widthCm: [],
  certification: [],
  priceMin: "",
  priceMax: "",
  category: "",
  page: 1,
});

/**
 * Zero-count options are hidden unless selected, so the list only offers real choices.
 * An item's own `label` (from the API) wins over `format`.
 */
const options = (
  values: Array<{ value: string | number; label?: string; count: number }>,
  selected: string[],
  format: (value: string) => string,
): Option[] =>
  values
    .map((item) => ({
      value: String(item.value),
      label: item.label ?? format(String(item.value)),
      count: item.count,
    }))
    .filter((option) => option.count > 0 || selected.includes(option.value));

function FilterGroup({
  title,
  listKey,
  state,
  items,
  alwaysShow = false,
}: {
  title: string;
  listKey: ListKey;
  state: SearchState;
  items: Option[];
  alwaysShow?: boolean;
}) {
  // Groups without values in the results are hidden; availability always shows.
  if (items.length === 0 && !alwaysShow) {
    return null;
  }

  return (
    <fieldset className="flex flex-col gap-2 border-t border-hairline pt-4">
      <legend className="mb-1 text-sm font-semibold text-foreground">
        {title}
      </legend>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => {
          const selected = state[listKey].includes(item.value);
          return (
            <li key={item.value}>
              <a
                href={buildHref(toggleValue(state, listKey, item.value))}
                aria-current={selected ? "true" : undefined}
                className="flex items-center justify-between gap-2 text-sm text-foreground hover:text-brand"
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`flex size-4 items-center justify-center rounded-[2px] border text-[10px] ${
                      selected
                        ? "border-brand bg-brand text-primary-foreground"
                        : "border-hairline bg-card"
                    }`}
                  >
                    {selected ? "✓" : ""}
                  </span>
                  {item.label}
                </span>
                <span className="text-xs text-ink-muted">({item.count})</span>
              </a>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

export function SearchFilters({
  state,
  facets,
}: {
  state: SearchState;
  facets: Facets;
}) {
  const availability = options(
    facets.availability,
    state.availability,
    (value) => AVAILABILITY_LABELS[value] ?? value,
  );
  const fabricType = options(facets.fabricType, state.fabricType, (v) => v);
  const gsm = options(facets.gsm, state.gsm, (v) => `${v} g/m²`);
  const widthCm = options(facets.widthCm, state.widthCm, (v) => `${v} cm`);
  const certification = options(
    facets.certification,
    state.certification,
    (v) => v,
  );

  return (
    <aside
      aria-label="Filtry"
      className="flex flex-col gap-5 rounded-sm border border-hairline bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-foreground">Filtry</h2>
        {hasFilters(state) ? (
          <a
            href={buildHref(clearedState(state))}
            className="text-xs font-semibold text-brand underline"
          >
            Zrušit filtry
          </a>
        ) : null}
      </div>

      <FilterGroup
        title="Dostupnost"
        listKey="availability"
        state={state}
        items={availability}
        alwaysShow
      />
      <FilterGroup
        title="Typ metráže"
        listKey="fabricType"
        state={state}
        items={fabricType}
      />
      <FilterGroup title="Gramáž" listKey="gsm" state={state} items={gsm} />
      <FilterGroup
        title="Šířka role"
        listKey="widthCm"
        state={state}
        items={widthCm}
      />
      <FilterGroup
        title="Certifikace"
        listKey="certification"
        state={state}
        items={certification}
      />

      <form
        action="/hledat"
        method="get"
        className="flex flex-col gap-2 border-t border-hairline pt-4"
      >
        <p className="text-sm font-semibold text-foreground">
          Cena bez DPH (Kč/m)
        </p>
        <div className="flex items-center gap-2">
          <label className="flex flex-1 flex-col gap-1 text-xs text-ink-muted">
            Od
            <input
              type="number"
              name="priceMin"
              min={0}
              defaultValue={state.priceMin}
              placeholder={
                facets.price ? String(Math.floor(facets.price.min)) : ""
              }
              className="h-9 rounded-sm border border-hairline bg-background px-2 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs text-ink-muted">
            Do
            <input
              type="number"
              name="priceMax"
              min={0}
              defaultValue={state.priceMax}
              placeholder={
                facets.price ? String(Math.ceil(facets.price.max)) : ""
              }
              className="h-9 rounded-sm border border-hairline bg-background px-2 text-sm text-foreground"
            />
          </label>
        </div>
        <HiddenStateInputs
          state={state}
          omit={["priceMin", "priceMax", "page"]}
        />
        <button
          type="submit"
          className="mt-1 h-9 rounded-sm bg-brand text-sm font-semibold text-primary-foreground"
        >
          Filtrovat
        </button>
      </form>
    </aside>
  );
}
