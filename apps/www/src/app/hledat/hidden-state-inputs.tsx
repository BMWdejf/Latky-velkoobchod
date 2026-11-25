import type { ListKey, SearchState } from "./search-state";

type Props = {
  state: SearchState;
  /** Fields the form changes itself, so their current values are left out. */
  omit?: Array<keyof SearchState>;
};

const LIST_KEYS: ListKey[] = [
  "availability",
  "fabricType",
  "gsm",
  "widthCm",
  "certification",
];

/** Keeps the other filters when a GET form is submitted. */
export function HiddenStateInputs({ state, omit = [] }: Props) {
  const skip = new Set<keyof SearchState>(omit);
  const scalars: Array<[keyof SearchState, string]> = [
    ["q", state.q],
    ["priceMin", state.priceMin],
    ["priceMax", state.priceMax],
    ["category", state.category],
    ["sort", state.sort],
  ];

  return (
    <>
      {scalars
        .filter(([key, value]) => !skip.has(key) && value !== "")
        .map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      {LIST_KEYS.filter((key) => !skip.has(key)).flatMap((key) =>
        state[key].map((value) => (
          <input
            key={`${key}-${value}`}
            type="hidden"
            name={key}
            value={value}
          />
        )),
      )}
    </>
  );
}
