const czkFormatter = new Intl.NumberFormat("cs-CZ", {
  maximumFractionDigits: 0,
});

/** `185` -> `185 Kč`. Non-breaking space keeps the amount and currency together. */
export const formatCzk = (amount: number): string =>
  `${czkFormatter.format(amount)} Kč`;

/** `1240` -> `1 240`. */
export const formatQuantity = (value: number): string =>
  new Intl.NumberFormat("cs-CZ").format(value);
