import { describe, expect, it } from "vitest";
import { buildCompactVoucherMessage } from "../../supabase/functions/_shared/voucherMessage";

describe("compact voucher WhatsApp message", () => {
  it("puts only the general code before the preserved booking text and one secure link", () => {
    const base = [
      "🚤 NOVA RESERVA — Passeio de Escuna em Búzios",
      "👤 Responsável: Cliente Teste",
      "💰 TOTAL A PAGAR: R$ 147",
      "💳 Forma de pagamento: Cartão de débito",
    ].join("\n");
    const message = buildCompactVoucherMessage(
      "pt",
      "ONX-2026-000001",
      base,
      "https://onixturismobuzios.com.br/v#Abcdef0123456789_-Abcdef0123456789_-Abcdef0",
    );
    const lines = message.split("\n");

    expect(lines[0]).toBe("🎟 Código geral da reserva: ONX-2026-000001");
    expect(message).toContain("NOVA RESERVA — Passeio de Escuna em Búzios");
    expect(message).toContain("TOTAL A PAGAR: R$ 147");
    expect(message).toContain("Forma de pagamento: Cartão de débito");
    expect(message).toContain("Seus vouchers virtuais: https://onixturismobuzios.com.br/v#");
    expect(message).toContain("Toque no link para visualizar, baixar, compartilhar ou imprimir.");
    expect(message).not.toContain("Identificadores dos passeios");
    expect(message).not.toContain("ESCUNA-2026-");
    expect(message).not.toContain("Olá Nathan!");
  });

  it("uses translated link labels in the five supported languages", () => {
    const expected: Record<"pt" | "es" | "en" | "fr" | "it", string> = {
      pt: "Seus vouchers virtuais",
      es: "Tus vouchers virtuales",
      en: "Your digital vouchers",
      fr: "Vos vouchers numériques",
      it: "I tuoi voucher digitali",
    };
    for (const language of Object.keys(expected) as Array<keyof typeof expected>) {
      const message = buildCompactVoucherMessage(language, "ONX-2026-000001", "RESERVA", "https://onixturismobuzios.com.br/v#token");
      expect(message).toContain(expected[language]);
    }
  });
});
