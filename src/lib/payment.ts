export type PaymentMethod = "cash" | "debit" | "credit" | "pix";

export const hasCardSurcharge = (payment: PaymentMethod | ""): boolean =>
  payment === "debit" || payment === "credit";
