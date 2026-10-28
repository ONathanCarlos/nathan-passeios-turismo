export interface BookingPriceAmounts {
  fareFinal: number;
  embarkationFee: number;
  embarkationPassengerCount: number;
  creditSurcharge: number;
  final: number;
  qrApplied: boolean;
  qrPercent: number;
}

export interface BookingCouponSummary {
  code: string;
  percent: number;
}

export type BookingPriceLine =
  | { kind: "coupon"; code: string; percent: number }
  | { kind: "qr"; percent: number }
  | { kind: "fare"; amount: number }
  | { kind: "embarkation"; amount: number; passengers: number }
  | { kind: "credit"; amount: number }
  | { kind: "total"; amount: number };

/**
 * A linha do passeio só aparece quando há taxas extras para explicar.
 * Sem adicionais, o total final é suficiente e evita duplicar o mesmo valor.
 */
export const buildBookingPriceBreakdown = (
  price: BookingPriceAmounts,
  coupon?: BookingCouponSummary | null,
): BookingPriceLine[] => {
  const lines: BookingPriceLine[] = [];
  if (coupon) lines.push({ kind: "coupon", code: coupon.code, percent: coupon.percent });
  else if (price.qrApplied) lines.push({ kind: "qr", percent: price.qrPercent });

  const hasAdditionalCharges = price.embarkationFee > 0 || price.creditSurcharge > 0;
  if (hasAdditionalCharges) lines.push({ kind: "fare", amount: price.fareFinal });
  if (price.embarkationFee > 0) {
    lines.push({
      kind: "embarkation",
      amount: price.embarkationFee,
      passengers: price.embarkationPassengerCount,
    });
  }
  if (price.creditSurcharge > 0) lines.push({ kind: "credit", amount: price.creditSurcharge });
  lines.push({ kind: "total", amount: price.final });
  return lines;
};
