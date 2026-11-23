import { ServiceUnavailableException } from "@nestjs/common";
import { loadFlexibeeConfig } from "./flexibee.config";

describe("loadFlexibeeConfig", () => {
  const env = {
    FLEXI_URL: "https://flexibee.example.test",
    FLEXI_COMPANY: "firma",
    FLEXI_USER: "reader",
    FLEXI_PASSWORD: "secret",
  };

  it("returns the settings when all variables are present", () => {
    expect(loadFlexibeeConfig(env)).toEqual({
      url: "https://flexibee.example.test",
      company: "firma",
      user: "reader",
      password: "secret",
    });
  });

  it("names every missing variable", () => {
    expect(() => loadFlexibeeConfig({ FLEXI_URL: env.FLEXI_URL })).toThrow(
      ServiceUnavailableException,
    );
    expect(() => loadFlexibeeConfig({ FLEXI_URL: env.FLEXI_URL })).toThrow(
      "FLEXI_COMPANY, FLEXI_USER, FLEXI_PASSWORD",
    );
  });
});
