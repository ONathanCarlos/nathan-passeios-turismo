import { describe, expect, it } from "vitest";
import { isCardPayment } from "@/lib/payment";

describe("identificação de pagamento com cartão", () => {
  it("classifica crédito e débito como cartão", () => {
    expect(isCardPayment("debit")).toBe(true);
    expect(isCardPayment("credit")).toBe(true);
  });

  it("classifica dinheiro, Pix ou método não selecionado como não cartão", () => {
    expect(isCardPayment("cash")).toBe(false);
    expect(isCardPayment("pix")).toBe(false);
    expect(isCardPayment("")).toBe(false);
  });
});
