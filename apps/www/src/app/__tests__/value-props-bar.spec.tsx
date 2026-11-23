import { render, screen } from "@testing-library/react";
import { ValuePropsBar } from "../_components/value-props-bar";

describe("ValuePropsBar", () => {
  it("lists the four wholesale value propositions", () => {
    render(<ValuePropsBar />);

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(4);
    expect(
      screen.getByRole("heading", { name: "Fakturace net 60" }),
    ).toBeVisible();
  });
});
