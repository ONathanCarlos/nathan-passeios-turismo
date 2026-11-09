import { describe, expect, it } from "vitest";
import { buildBookingPriceBreakdown } from "@/lib/bookingPriceBreakdown";

const price = {
  fareFinal: 855,
  fareForPayment: 855,
  embarkationFee: 0,
  embarkationPassengerCount: 0,
  localEmbarkationFee: 0,
  jardineiraFee: 0,
  regionalFeePassengerCount: 0,
  cardPriceAdjustment: 0,
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

  it("não repete a tarifa em cartão quando não há taxas fixas adicionais", () => {
    expect(buildBookingPriceBreakdown({
      ...price,
      fareForPayment: 940.5,
      cardPriceAdjustment: 85.5,
      final: 940.5,
    })).toEqual([
      { kind: "total", amount: 940.5 },
    ]);
  });

  it("discrimina o preço selecionado do passeio e embarque como valores separados", () => {
    expect(buildBookingPriceBreakdown({
      ...price,
      fareFinal: 855,
      fareForPayment: 940.5,
      embarkationFee: 30,
      embarkationPassengerCount: 3,
      cardPriceAdjustment: 85.5,
      final: 970.5,
    })).toEqual([
      { kind: "fare", amount: 940.5 },
      { kind: "embarkation", amount: 30, passengers: 3 },
      { kind: "total", amount: 970.5 },
    ]);
  });

  it("discrimina embarque local e jardineira sem repetir o subtotal no total", () => {
    expect(buildBookingPriceBreakdown({
      ...price,
      fareFinal: 200,
      fareForPayment: 220,
      localEmbarkationFee: 45,
      jardineiraFee: 30,
      regionalFeePassengerCount: 3,
      cardPriceAdjustment: 20,
      final: 295,
    })).toEqual([
      { kind: "fare", amount: 220 },
      { kind: "localEmbarkation", amount: 45, passengers: 3 },
      { kind: "jardineira", amount: 30, passengers: 3 },
      { kind: "total", amount: 295 },
    ]);
  });

  it("mantém o desconto QR separado e não o transforma em cupom", () => {
    expect(buildBookingPriceBreakdown({ ...price, qrApplied: true, qrPercent: 10 })).toEqual([
      { kind: "qr", percent: 10 },
      { kind: "total", amount: 855 },
    ]);
  });
});
