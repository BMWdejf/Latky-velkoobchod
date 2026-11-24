import { toDirectImageUrl, toImageByProductId } from "./product-images";

describe("toDirectImageUrl", () => {
  it("turns a Google Drive file link into a direct image URL", () => {
    expect(
      toDirectImageUrl(
        "https://drive.google.com/file/d/abc_123-XY/view?usp=sharing",
      ),
    ).toBe("https://lh3.googleusercontent.com/d/abc_123-XY=w600");
  });

  it("turns an open?id Google Drive link into a direct image URL", () => {
    expect(toDirectImageUrl("https://drive.google.com/open?id=FILE1")).toBe(
      "https://lh3.googleusercontent.com/d/FILE1=w600",
    );
  });

  it("keeps other https links and rejects everything else", () => {
    expect(toDirectImageUrl("https://cdn.example.com/a.jpg")).toBe(
      "https://cdn.example.com/a.jpg",
    );
    expect(toDirectImageUrl("http://insecure.example.com/a.jpg")).toBeNull();
    expect(toDirectImageUrl("javascript:alert(1)")).toBeNull();
    expect(toDirectImageUrl("")).toBeNull();
  });
});

describe("toImageByProductId", () => {
  it("maps each product to its photo, preferring the main attachment", () => {
    const images = toImageByProductId([
      {
        "cenik@ref": "/c/demo/cenik/10.json",
        link: "https://cdn.example.com/other.jpg",
        mainAttachment: "false",
      },
      {
        "cenik@ref": "/c/demo/cenik/10.json",
        link: "https://drive.google.com/file/d/MAIN/view",
        mainAttachment: "true",
      },
    ]);

    expect(images.get("10")).toBe(
      "https://lh3.googleusercontent.com/d/MAIN=w600",
    );
  });

  it("ignores attachments without a product or a valid link", () => {
    const images = toImageByProductId([
      { link: "https://cdn.example.com/a.jpg" },
      { "cenik@ref": "/c/demo/cenik/11.json", link: "" },
      {
        "cenik@ref": "/c/demo/cenik/12.json",
        link: "http://plain.example.com",
      },
    ]);

    expect(images.size).toBe(0);
  });
});

describe("toImageByProductId with the Flexibee attachment of product 10", () => {
  it("uses the Google Drive link of attachment 5930 as the photo", () => {
    const images = toImageByProductId([
      {
        id: "5930",
        link: "https://drive.google.com/file/d/1gkMR4pmrRXKbCo8hGkIx_1Zqp-OPF2zE/view?usp=sharing",
        mainAttachment: "false",
        "cenik@ref": "/c/demo/cenik/10.json",
      },
    ]);

    expect(images.get("10")).toBe(
      "https://lh3.googleusercontent.com/d/1gkMR4pmrRXKbCo8hGkIx_1Zqp-OPF2zE=w600",
    );
  });
});
