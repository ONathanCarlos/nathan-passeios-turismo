import { describe, expect, it } from "vitest";
import { hasCardSurcharge } from "@/lib/payment";

describe("sobretaxa de pagamento com cartão", () => {
  it("aplica a regra igualmente para débito e crédito", () => {
    expect(hasCardSurcharge("debit")).toBe(true);
    expect(hasCardSurcharge("credit")).toBe(true);
  });

  it("não aplica a regra para dinheiro, Pix ou método ainda não selecionado", () => {
    expect(hasCardSurcharge("cash")).toBe(false);
    expect(hasCardSurcharge("pix")).toBe(false);
    expect(hasCardSurcharge("")).toBe(false);
  });
});
