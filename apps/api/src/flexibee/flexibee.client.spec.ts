import { FlexibeeClient } from "./flexibee.client";

describe("FlexibeeClient", () => {
  const config = {
    url: "https://flexibee.example",
    company: "firma",
    user: "u",
    password: "p",
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("reads rows of a filtered path under the bare entity name", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          winstrom: { "skladova-karta": [{ id: "619" }] },
        }),
        { status: 200 },
      ),
    );

    const rows = await new FlexibeeClient().list(
      "skladova-karta/(sklad=38)",
      { detail: "full" },
      config,
    );

    expect(rows).toEqual([{ id: "619" }]);
    const requested = String(fetchMock.mock.calls[0]?.[0]);
    expect(requested).toContain("/c/firma/skladova-karta/(sklad=38).json");
  });
});
