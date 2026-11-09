export type PaymentMethod = "cash" | "debit" | "credit" | "pix";

export const isCardPayment = (payment: PaymentMethod | ""): boolean =>
  payment === "debit" || payment === "credit";
