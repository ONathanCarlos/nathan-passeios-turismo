import { describe, expect, it } from "vitest";
import { buildBookingPriceBreakdown } from "@/lib/bookingPriceBreakdown";

const price = {
  fareFinal: 855,
  embarkationFee: 0,
  embarkationPassengerCount: 0,
  creditSurcharge: 0,
  final: 855,
  qrApplied: false,
  qrPercent: 0,
};

describe("discriminação do preço da reserva", () => {
  it("mostra apenas o total quando não existem taxas adicionais", () => {
    expect(buildBookingPriceBreakdown(price)).toEqual([
      { kind: "total", amount: 855 },
    ]);
  });

  it("mostra o código e mantém um único valor final para um cupom simples", () => {
    expect(buildBookingPriceBreakdown(price, { code: "HERMANO5", percent: 5 })).toEqual([
      { kind: "coupon", code: "HERMANO5", percent: 5 },
      { kind: "total", amount: 855 },
    ]);
  });

  it("discrimina tarifa, embarque e cartão sem repetir o subtotal", () => {
    expect(buildBookingPriceBreakdown({
      ...price,
      embarkationFee: 30,
      embarkationPassengerCount: 3,
      creditSurcharge: 44.25,
      final: 929.25,
    })).toEqual([
      { kind: "fare", amount: 855 },
      { kind: "embarkation", amount: 30, passengers: 3 },
      { kind: "credit", amount: 44.25 },
      { kind: "total", amount: 929.25 },
    ]);
  });

  it("discrimina embarque local e jardineira e mostra subtotal com as duas taxas incluídas", () => {
    expect(buildBookingPriceBreakdown({
      ...price,
      fareFinal: 200,
      localEmbarkationFee: 45,
      jardineiraFee: 30,
      regionalFeePassengerCount: 3,
      creditSurcharge: 13.75,
      final: 288.75,
    })).toEqual([
      { kind: "fare", amount: 200 },
      { kind: "localEmbarkation", amount: 45, passengers: 3 },
      { kind: "jardineira", amount: 30, passengers: 3 },
      { kind: "subtotal", amount: 275 },
      { kind: "credit", amount: 13.75 },
      { kind: "total", amount: 288.75 },
    ]);
  });

  it("mantém o desconto QR separado e não o transforma em cupom", () => {
    expect(buildBookingPriceBreakdown({ ...price, qrApplied: true, qrPercent: 10 })).toEqual([
      { kind: "qr", percent: 10 },
      { kind: "total", amount: 855 },
    ]);
  });
});
