import {
  buildHref,
  readSearchState,
  toApiParams,
  toggleValue,
} from "../hledat/search-state";

describe("search state", () => {
  it("reads repeated parameters and defaults the page to 1", () => {
    const state = readSearchState({
      q: "teplákovina",
      availability: ["in_stock", "low_stock"],
      strana: "abc",
    });

    expect(state.q).toBe("teplákovina");
    expect(state.availability).toEqual(["in_stock", "low_stock"]);
    expect(state.page).toBe(1);
  });

  it("builds the URL without empty values and keeps the page only when past 1", () => {
    const state = readSearchState({ q: "lem", strana: "3", category: "" });

    expect(buildHref(state)).toBe("/hledat?q=lem&strana=3");
    expect(buildHref(readSearchState({}))).toBe("/hledat");
  });

  it("toggles a filter value and resets the page", () => {
    const state = { ...readSearchState({ gsm: ["240"] }), page: 4 };

    const added = toggleValue(state, "gsm", "320");
    expect(added.gsm).toEqual(["240", "320"]);
    expect(added.page).toBe(1);

    expect(toggleValue(added, "gsm", "240").gsm).toEqual(["320"]);
  });

  it("converts the page into the API start offset", () => {
    const params = toApiParams({ ...readSearchState({}), page: 3 });

    expect(params.start).toBe("12");
    expect(params.limit).toBe("6");
  });
});
