import { render, screen } from "@testing-library/react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

describe("UI primitives", () => {
  it("Input forwards props and className", () => {
    render(<Input placeholder="Email" className="custom" name="email" />);
    const input = screen.getByPlaceholderText("Email");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveClass("custom");
  });

  it("Label renders its children", () => {
    render(<Label htmlFor="email">E-mail</Label>);
    expect(screen.getByText("E-mail")).toBeInTheDocument();
  });

  it("Card composes header content", () => {
    render(
      <Card>
        <CardTitle>Title</CardTitle>
        <CardContent>Body</CardContent>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});
