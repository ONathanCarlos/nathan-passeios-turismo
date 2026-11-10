import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PaymentMethodCards } from "@/components/PaymentMethodCards";

describe("PaymentMethodCards", () => {
  it("mostra preços e totais nas duas opções sem mostrar acréscimo percentual", () => {
    render(
      <PaymentMethodCards
        lang="pt"
        payment=""
        onChange={vi.fn()}
        cashPixUnitPrice={70}
        cashPixTotal={150}
        cardTotal={164}
      />,
    );

    expect(screen.getByText("Dinheiro ou Pix")).toBeInTheDocument();
    expect(screen.getByText("Cartão de crédito ou débito")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*70/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*77/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*150/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*164/)).toBeInTheDocument();
    expect(screen.queryByText(/10\s*%/)).not.toBeInTheDocument();
  });

  it("seleciona a forma concreta de pagamento dentro de cada modalidade", () => {
    const onChange = vi.fn();
    render(
      <PaymentMethodCards
        lang="pt"
        payment=""
        onChange={onChange}
        cashPixUnitPrice={70}
        cashPixTotal={70}
        cardTotal={77}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pix" }));
    expect(onChange).toHaveBeenLastCalledWith("pix");
    fireEvent.click(screen.getByRole("button", { name: "Débito" }));
    expect(onChange).toHaveBeenLastCalledWith("debit");
  });
});
