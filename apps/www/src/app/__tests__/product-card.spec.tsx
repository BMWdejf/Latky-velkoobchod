import { fireEvent, render, screen } from "@testing-library/react";
import type { Product } from "@/lib/products";
import { ProductCard } from "../_components/product-card";

const product: Product = {
  id: "10",
  sku: "TEP-010",
  name: "Teplákovina Hořčicová",
  unitPrice: 185,
  currency: "CZK",
  unit: "m",
  stock: 1240,
  stockStatus: "in_stock",
  minOrder: 10,
  width: "160",
  weight: "240 g/m²",
  composition: "100% Bavlna",
  imageUrl: null,
  notice: null,
};

describe("ProductCard", () => {
  it("renders the product details and stock status", () => {
    render(<ProductCard product={product} />);

    expect(screen.getByRole("heading", { name: product.name })).toBeVisible();
    expect(screen.getByText("SKU: TEP-010")).toBeVisible();
    expect(screen.getByText("Skladem (1 240 m)")).toBeVisible();
    expect(screen.getByText("Min. odběr: 10 m")).toBeVisible();
    expect(screen.getByText("Šíře: 160")).toBeVisible();
  });

  it("shows the low-stock label", () => {
    render(
      <ProductCard
        product={{ ...product, stock: 85, stockStatus: "low_stock" }}
      />,
    );

    expect(screen.getByText("Nízký stav (85 m)")).toBeVisible();
  });

  it("shows sold-out state and the restock action", () => {
    render(
      <ProductCard
        product={{ ...product, stock: 0, stockStatus: "out_of_stock" }}
      />,
    );

    expect(screen.getByText("Vyprodáno")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Upozornit na naskladnění" }),
    ).toBeDisabled();
  });

  it("keeps the quantity stepper at or above the minimum order", () => {
    render(<ProductCard product={product} />);

    const quantity = screen.getByRole("spinbutton", {
      name: /Množství v m/,
    });
    const decrease = screen.getByRole("button", {
      name: /Snížit množství/,
    });

    expect(quantity).toHaveValue(10);
    expect(decrease).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Zvýšit množství/ }));
    expect(quantity).toHaveValue(11);

    fireEvent.click(decrease);
    fireEvent.click(decrease);
    expect(quantity).toHaveValue(10);
  });
});

describe("ProductCard photo", () => {
  it("shows the product photo when the product has one", () => {
    render(
      <ProductCard
        product={{
          ...product,
          imageUrl: "https://lh3.googleusercontent.com/d/abc=w600",
        }}
      />,
    );

    const image = screen.getByRole("img", { name: product.name });
    expect(image.getAttribute("src")).toContain(
      "lh3.googleusercontent.com/d/abc",
    );
  });

  it("renders no image without a photo", () => {
    render(<ProductCard product={product} />);

    expect(screen.queryByRole("img")).toBeNull();
  });
});
