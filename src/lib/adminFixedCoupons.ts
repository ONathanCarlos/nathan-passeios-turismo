/** Valores fixos por reserva (não por passageiro). Cupons manuais aplicados no formulário, sem autenticação administrativa. */
export const ADMIN_COUPON_AMOUNTS = {
  ADM5: 5,
  ADM10: 10,
  ADM15: 15,
  ADM20: 20,
  ADM25: 25,
  ADM30: 30,
} as const;

export type AdminCouponCode = keyof typeof ADMIN_COUPON_AMOUNTS;

export function adminCouponAmount(code: string): number | null {
  const normalized = code.trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(ADMIN_COUPON_AMOUNTS, normalized)
    ? ADMIN_COUPON_AMOUNTS[normalized as AdminCouponCode]
    : null;
}

/** Nunca deixa o valor do passeio negativo; taxas são cobradas à parte. */
export function applyFixedCoupon(fare: number, amount: number): { discount: number; fareFinal: number } {
  const validFare = Math.max(0, fare);
  const discount = Math.min(validFare, Math.max(0, amount));
  return { discount, fareFinal: Math.round((validFare - discount) * 100) / 100 };
}
