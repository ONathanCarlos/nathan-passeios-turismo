import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaymentPriceDisplay } from "@/components/PaymentPriceDisplay";

describe("exibição de preços por modalidade", () => {
  it("mostra os dois preços e identifica as modalidades sem exibir percentuais", () => {
    render(<PaymentPriceDisplay cashPixPrice={100} lang="pt" />);

    expect(screen.getByText("em dinheiro ou Pix")).toBeInTheDocument();
    expect(screen.getByText("no cartão de crédito ou débito")).toBeInTheDocument();
    const content = screen.getByTestId("payment-price-display").textContent?.replace(/\u00a0/g, " ") ?? "";
    expect(content).toContain("R$ 100");
    expect(content).toContain("R$ 110");
    expect(content).not.toMatch(/10\s?%|\+10/i);
  });
});
