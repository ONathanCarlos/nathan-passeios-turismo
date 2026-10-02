import { describe, expect, it } from "vitest";
import { buildReviewWhatsAppMessage, buildShortReviewUrl } from "@/lib/reviewInvite";
import { getFirstName } from "@/lib/firstName";

describe("solicitação de avaliação", () => {
  const url = buildShortReviewUrl("7Kx92LmPab12");

  it("gera o link curto no domínio oficial", () => {
    expect(url).toBe("https://nathanturismo.com.br/a/7Kx92LmPab12");
  });

  it.each([
    ["João da Silva", "João"],
    [" Maria   Fernanda Souza ", "Maria"],
    ["Carlos", "Carlos"],
    ["", "Cliente"],
    [null, "Cliente"],
    [undefined, "Cliente"],
  ])("extrai o primeiro nome de %j", (value, expected) => {
    expect(getFirstName(value as string | null | undefined)).toBe(expected);
  });

  it.each([
    ["pt", "Olá, João! 😊", "Sua opinião é muito importante para nós!"],
    ["es", "¡Hola, João! 😊", "¡Tu opinión es muy importante para nosotros!"],
    ["en", "Hi, João! 😊", "Your opinion means a lot to us!"],
    ["fr", "Bonjour, João ! 😊", "Votre avis est très important pour nous !"],
    ["it", "Ciao, João! 😊", "La tua opinione è molto importante per noi!"],
  ])("gera a mensagem em %s", (language, greeting, body) => {
    const message = buildReviewWhatsAppMessage(url, "João Carlos da Silva", language);
    expect(message).toContain(greeting);
    expect(message).toContain(body);
    expect(message).toContain(url);
    expect(message).not.toContain("João Carlos da Silva");
  });

  it("usa português quando o idioma não está disponível", () => {
    const message = buildReviewWhatsAppMessage(url, "Maria Fernanda", "de");
    expect(message).toContain("Olá, Maria! 😊");
    expect(message).toContain("Sua opinião é muito importante para nós!");
  });

  it("mantém compatibilidade com a assinatura anterior", () => {
    expect(buildReviewWhatsAppMessage(url)).toContain(url);
  });
});
