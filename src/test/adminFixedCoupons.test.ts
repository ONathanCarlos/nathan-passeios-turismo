import { describe, expect, it } from "vitest";
import { ADMIN_COUPON_AMOUNTS, adminCouponAmount, applyFixedCoupon } from "@/lib/adminFixedCoupons";
import { buildBookingPriceBreakdown } from "@/lib/bookingPriceBreakdown";

describe("cupons ADM de desconto fixo", () => {
  it("tem exatamente os seis valores solicitados", () => {
    expect(ADMIN_COUPON_AMOUNTS).toEqual({
      ADM5: 5, ADM10: 10, ADM15: 15, ADM20: 20, ADM25: 25, ADM30: 30,
    });
  });

  it("normaliza maiúsculas e espaços e rejeita códigos desconhecidos", () => {
    expect(adminCouponAmount(" adm20 ")).toBe(20);
    expect(adminCouponAmount("ADM35")).toBeNull();
    expect(adminCouponAmount("CLIENTE20")).toBeNull();
  });

  it("desconta uma vez do total da reserva", () => {
    expect(applyFixedCoupon(200, 20)).toEqual({ discount: 20, fareFinal: 180 });
    expect(applyFixedCoupon(200, 30)).toEqual({ discount: 30, fareFinal: 170 });
  });

  it("mostra o valor fixo no resumo da reserva", () => {
    const lines = buildBookingPriceBreakdown({ fareFinal: 180, fareForPayment: 180, embarkationFee: 0, embarkationPassengerCount: 0, cardPriceAdjustment: 0, final: 180, qrApplied: false, qrPercent: 0 }, { code: "ADM20", fixedAmount: 20 });
    expect(lines[0]).toEqual({ kind: "coupon", code: "ADM20", percent: undefined, fixedAmount: 20 });
  });

  it("não deixa o valor do passeio negativo", () => {
    expect(applyFixedCoupon(15, 30)).toEqual({ discount: 15, fareFinal: 0 });
  });
});
