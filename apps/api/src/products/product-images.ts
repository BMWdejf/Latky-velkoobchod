import { productIdFromRef } from "./warehouse-stock";

/**
 * Product photos are Flexibee attachments (`priloha`) linked to a price-list
 * item. An attachment with a web link (`link`) is used as the photo; the main
 * attachment wins when several exist. Field names are checked against the
 * demo instance; change them here only.
 */
export const FLEXIBEE_ATTACHMENT = {
  entity: "priloha",
  productRef: "cenik@ref",
  link: "link",
  mainAttachment: "mainAttachment",
} as const;

export const FLEXIBEE_ATTACHMENT_DETAIL = "custom:id,link,mainAttachment,cenik";

/**
 * Makes a Google Drive share link loadable by an `<img>`: the file id goes into
 * the lh3 image host with a width (`=w600`). Other links are returned unchanged.
 * Only https links are accepted. The file must be shared as "anyone with the link".
 */
export const toDirectImageUrl = (value: unknown): string | null => {
  const text = String(value ?? "").trim();
  if (!/^https:\/\//.test(text)) {
    return null;
  }

  const drive =
    /drive\.google\.com\/file\/d\/([\w-]+)/.exec(text) ??
    /drive\.google\.com\/open\?id=([\w-]+)/.exec(text);
  if (drive?.[1]) {
    return `https://lh3.googleusercontent.com/d/${drive[1]}=w600`;
  }

  return text;
};

/** Product id -> photo URL. Main attachments take precedence over the others. */
export const toImageByProductId = (
  rows: Record<string, unknown>[],
): Map<string, string> => {
  const images = new Map<string, { url: string; main: boolean }>();

  for (const row of rows) {
    const productId = productIdFromRef(row[FLEXIBEE_ATTACHMENT.productRef]);
    const url = toDirectImageUrl(row[FLEXIBEE_ATTACHMENT.link]);
    if (!productId || !url) {
      continue;
    }

    const main = row[FLEXIBEE_ATTACHMENT.mainAttachment] === "true";
    const current = images.get(productId);
    if (!current || (main && !current.main)) {
      images.set(productId, { url, main });
    }
  }

  return new Map([...images].map(([id, image]) => [id, image.url]));
};
