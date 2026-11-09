import { describe, expect, it } from "vitest";
import { calculateBookingAmounts } from "@/lib/cruiseEmbarkation";
import { calculateRegionalBookingFees } from "@/lib/regionalBookingFees";

describe("taxas de embarque e jardineira para Arraial e Cabo Frio", () => {
  it("cobra a taxa integral por passageiro, incluindo crianças com passeio grátis", () => {
    expect(calculateRegionalBookingFees("arraial", 2, 2)).toEqual({
      passengerCount: 4,
      embarkationFee: 60,
      jardineiraFee: 40,
    });
    expect(calculateRegionalBookingFees("cabofrio", 1, 1)).toEqual({
      passengerCount: 2,
      embarkationFee: 30,
      jardineiraFee: 20,
    });
  });

  it("não aplica essas taxas aos demais passeios nem a uma quantidade inválida", () => {
    expect(calculateRegionalBookingFees("escuna", 2, 1)).toEqual({
      passengerCount: 0,
      embarkationFee: 0,
      jardineiraFee: 0,
    });
    expect(calculateRegionalBookingFees("arraial", -1, 2.5)).toEqual({
      passengerCount: 0,
      embarkationFee: 0,
      jardineiraFee: 0,
    });
  });

  it("aplica o preço de cartão somente ao passeio, sem multiplicar as duas taxas fixas", () => {
    const fees = calculateRegionalBookingFees("arraial", 2, 1);
    expect(calculateBookingAmounts(200, fees.embarkationFee + fees.jardineiraFee, true)).toEqual({
      subtotal: 275,
      fareForPayment: 220,
      cardPriceAdjustment: 20,
      total: 295,
    });
  });
});
