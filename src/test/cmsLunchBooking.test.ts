import { describe, expect, it } from "vitest";
import { buildLunchBookingMessage, calculateLunchBookingAmounts, isLunchCmsTour } from "@/lib/cmsLunchBooking";
import type { CmsTour } from "@/lib/cms";
import { hasCardSurcharge } from "@/lib/payment";

const tour = (overrides: Partial<CmsTour> = {}): CmsTour => ({
  id: "cms-lunch",
  key: "almoco",
  nome_pt: "Almoço",
  nome_en: "Lunch",
  nome_es: "Almuerzo",
  nome_fr: "Déjeuner",
  nome_it: "Pranzo",
  descricao_pt: null, descricao_en: null, descricao_es: null, descricao_fr: null, descricao_it: null,
  preco: 65,
  imagem_url: null, gallery_imagens: [], video_url: null, video_2_url: null,
  destaque: false, ativo: true, ordem: 1, capacidade_max: null, duracao: null, horario: null,
  local_saida: null, info_adicional: null, observacoes: null, badge: null, urgencia: null,
  ...overrides,
});

describe("CMS lunch booking", () => {
  it("recognizes the lunch tour by CMS key or localized name, not unrelated tours", () => {
    expect(isLunchCmsTour(tour())).toBe(true);
    expect(isLunchCmsTour(tour({ key: "almoco-buffet", nome_pt: "Almoço Buffet Livre" }))).toBe(true);
    expect(isLunchCmsTour(tour({ key: "lunch-buffet", nome_pt: "Buffet", nome_en: "Lunch Buffet" }))).toBe(true);
    expect(isLunchCmsTour(tour({ key: "transfer", nome_pt: "Transfer", nome_en: "Airport transfer", nome_es: "Traslado", nome_fr: "Transfert", nome_it: "Trasferimento" }))).toBe(false);
  });

  it("calculates the per-person subtotal and adds five percent only for card payments", () => {
    expect(calculateLunchBookingAmounts(66.67, 3, false)).toEqual({
      guestCount: 3, unitPrice: 66.67, subtotal: 200.01, creditSurcharge: 0, total: 200.01,
    });
    expect(calculateLunchBookingAmounts(66.67, 3, true)).toEqual({
      guestCount: 3, unitPrice: 66.67, subtotal: 200.01, creditSurcharge: 10, total: 210.01,
    });
    expect(calculateLunchBookingAmounts(66.67, 9, true).guestCount).toBe(0);
  });

  it("includes responsible, all guests, ages, date, payment, and itemized values without unrelated fields", () => {
    const amounts = calculateLunchBookingAmounts(65, 2, true);
    const message = buildLunchBookingMessage({
      tourTitle: "Almoço Buffet",
      responsibleName: "Ana Lima",
      phone: "+55 22 99999 1111",
      date: "27/10/2026",
      guests: [{ name: "Ana Lima", age: "35" }, { name: "João Lima", age: "12" }],
      paymentLabel: "Cartão de crédito",
      amounts,
    });

    expect(message).toContain("Responsável: Ana Lima");
    expect(message).toContain("1. Ana Lima — 35 anos (responsável)");
    expect(message).toContain("2. João Lima — 12 anos");
    expect(message).toContain("Data: 27/10/2026");
    const normalizedMessage = message.replace(/\u00a0/g, " ");
    expect(normalizedMessage).toContain("Taxa do cartão (5%): R$ 6,50");
    expect(normalizedMessage).toContain("TOTAL A PAGAR: R$ 136,50");
    expect(normalizedMessage).toContain("Forma de pagamento: Cartão de crédito");
    expect(message).toContain("Reserva feita pelo site - https://onixturismobuzios.com.br");
    expect(normalizedMessage).not.toMatch(/pousada|nacionalidade|CPF/i);
  });

  it("includes the same 5% surcharge and confirmation note for debit card bookings", () => {
    const amounts = calculateLunchBookingAmounts(65, 2, hasCardSurcharge("debit"));
    const message = buildLunchBookingMessage({
      tourTitle: "Almoço Buffet",
      responsibleName: "Ana Lima",
      phone: "+55 22 99999 1111",
      date: "27/10/2026",
      guests: [{ name: "Ana Lima", age: "35" }, { name: "João Lima", age: "12" }],
      paymentLabel: "Cartão de débito",
      amounts,
    });

    const normalizedMessage = message.replace(/\u00a0/g, " ");
    expect(normalizedMessage).toContain("Taxa do cartão (5%): R$ 6,50");
    expect(normalizedMessage).toContain("TOTAL A PAGAR: R$ 136,50");
    expect(normalizedMessage).toContain("Forma de pagamento: Cartão de débito");
    expect(normalizedMessage).toContain("A taxa de 5% do cartão já está incluída no total acima.");
  });

  it("shows only one amount for cash bookings without additional fees", () => {
    const amounts = calculateLunchBookingAmounts(65, 2, false);
    const message = buildLunchBookingMessage({
      tourTitle: "Almoço Buffet",
      responsibleName: "Ana Lima",
      phone: "+55 22 99999 1111",
      date: "27/10/2026",
      guests: [{ name: "Ana Lima", age: "35" }, { name: "João Lima", age: "12" }],
      paymentLabel: "Dinheiro",
      amounts,
    });

    const normalizedMessage = message.replace(/\u00a0/g, " ");
    expect(normalizedMessage).toContain("TOTAL A PAGAR: R$ 130");
    expect(normalizedMessage).not.toContain("Almoço (2 ×");
  });
});
