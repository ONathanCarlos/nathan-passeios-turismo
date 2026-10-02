import { describe, expect, it } from "vitest";
import { buildReviewWhatsAppMessage, buildShortReviewUrl } from "@/lib/reviewInvite";

describe("solicitação de avaliação", () => {
  it("gera o link curto no domínio oficial", () => {
    expect(buildShortReviewUrl("7Kx92LmPab12")).toBe("https://nathanturismo.com.br/a/7Kx92LmPab12");
  });

  it("gera a mensagem exata com o link em linha separada", () => {
    const url = buildShortReviewUrl("7Kx92LmPab12");
    expect(buildReviewWhatsAppMessage(url)).toBe(`Oi! 😊 Aqui é o Nathan, tudo bem?

Queria saber como foi sua experiência com a gente! 🌊☀️

Leva só 1 minutinho pra contar o que você achou e, como agradecimento, você ganha 5% de desconto na próxima reserva. 🎁

👉 AVALIE AQUI:
https://nathanturismo.com.br/a/7Kx92LmPab12

Valeu por confiar na gente! ❤️`);
  });
});