import { describe, expect, it } from "vitest";
import {
  calculateCardPrice,
  calculateCardPriceIncrease,
  calculatePriceForPayment,
  CARD_PRICE_INCREASE_PERCENT,
  PAYMENT_PRICE_LABELS,
} from "@/lib/paymentPricing";

describe("preços por modalidade de pagamento", () => {
  it("mantém o preço do CMS como base para dinheiro e Pix", () => {
    expect(calculatePriceForPayment(70, false)).toBe(70);
    expect(calculateCardPriceIncrease(70, false)).toBe(0);
  });

  it("calcula 10% a mais no crédito e débito e arredonda para centavos", () => {
    expect(CARD_PRICE_INCREASE_PERCENT).toBe(10);
    expect(calculateCardPrice(70)).toBe(77);
    expect(calculatePriceForPayment(70, true)).toBe(77);
    expect(calculateCardPriceIncrease(70, true)).toBe(7);
    expect(calculateCardPrice(66.67)).toBe(73.34);
  });

  it("fornece rótulos por modalidade sem revelar percentual de acréscimo", () => {
    for (const lang of ["pt", "es", "en", "fr", "it"] as const) {
      expect(PAYMENT_PRICE_LABELS[lang].cardNotice).not.toMatch(/10\s?%|\+10/i);
      expect(PAYMENT_PRICE_LABELS[lang].cardPrice).not.toMatch(/10\s?%|\+10/i);
      expect(PAYMENT_PRICE_LABELS[lang].tourFareCard).not.toMatch(/10\s?%|\+10/i);
      expect(PAYMENT_PRICE_LABELS[lang].cashPixPrice).toBeTruthy();
      expect(PAYMENT_PRICE_LABELS[lang].card).toBeTruthy();
      expect(PAYMENT_PRICE_LABELS[lang].unitPrice).toBeTruthy();
      expect(PAYMENT_PRICE_LABELS[lang].discountedUnitPrice).toBeTruthy();
    }
  });
});
