import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BookingTerms from "@/pages/BookingTerms";
import { BookingTermsConsent } from "@/components/BookingTermsConsent";
import {
  BOOKING_TERMS_PATH,
  BOOKING_TERMS_TEXT,
  BOOKING_TERMS_VERSION,
  getBookingTermsDocument,
} from "@/lib/bookingTerms";

describe("booking terms", () => {
  it("resolves the archived version and refuses unknown versions", () => {
    expect(getBookingTermsDocument(BOOKING_TERMS_VERSION)?.text).toBe(BOOKING_TERMS_TEXT);
    expect(getBookingTermsDocument("unknown-version")).toBeNull();
    window.history.replaceState({}, "", "/termos-de-uso?version=unknown-version");
    render(<BookingTerms />);
    expect(screen.getByRole("heading", { name: "Versão dos termos indisponível" })).toBeInTheDocument();
    window.history.replaceState({}, "", "/");
  });
  it("keeps the approved public text archived without internal review notes", () => {
    expect(BOOKING_TERMS_TEXT).toContain("O site não realiza retenções automáticas");
    expect(BOOKING_TERMS_TEXT).toContain("O serviço de almoço não está abrangido por esta política.");
    expect(BOOKING_TERMS_TEXT).toContain("O artigo 740, § 3º, do Código Civil trata de retenção de até 5% no âmbito dos contratos de transporte");
    expect(BOOKING_TERMS_TEXT).toContain("https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm");
    expect(BOOKING_TERMS_TEXT.toLowerCase()).not.toContain("minuta");
    expect(BOOKING_TERMS_TEXT.toLowerCase()).not.toContain("observações para a revisão");
    expect(BOOKING_TERMS_TEXT.toLowerCase()).not.toContain("data da proposta");
  });

  it("renders the public page with stable version and official source links", () => {
    render(<BookingTerms />);

    expect(screen.getByRole("heading", { name: /Termos de Uso, Política de Cancelamento e Reembolso/ })).toBeInTheDocument();
    expect(screen.getByText(`Versão ${BOOKING_TERMS_VERSION}`)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar aos passeios" })).toHaveAttribute("href", "/passeios");
    expect(screen.getByRole("link", { name: /Código de Defesa do Consumidor/ })).toHaveAttribute(
      "href",
      "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm",
    );
    expect(screen.getByText(/não realiza retenções automáticas/)).toBeInTheDocument();
  });

  it("starts unchecked, opens the versioned terms link and reports an accessible error", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <BookingTermsConsent checked={false} onChange={onChange} lang="pt" />,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    expect(screen.getByRole("link", { name: /^Termos de Uso/ })).toHaveAttribute(
      "href",
      `${BOOKING_TERMS_PATH}?version=${BOOKING_TERMS_VERSION}`,
    );
    expect(screen.getByRole("link", { name: /^Termos de Uso/ })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: /^Termos de Uso/ })).toHaveAttribute("rel", "noopener noreferrer");

    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(<BookingTermsConsent checked={false} onChange={onChange} lang="pt" error />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert").parentElement).toHaveClass("field-error");
    screen.getByRole("checkbox").focus();
    expect(screen.getByRole("checkbox")).toHaveFocus();
  });

  it("does not perform automatic pricing, retention or payment processing", () => {
    render(<BookingTerms />);
    expect(screen.getByText(/A análise manual não afasta os direitos/)).toBeInTheDocument();
    expect(screen.getByText(/Nenhuma alteração ou cobrança será executada automaticamente pelo site/)).toBeInTheDocument();
    expect(screen.getByText(/O artigo 740, § 3º, do Código Civil trata de retenção de até 5%/)).toBeInTheDocument();
    expect(screen.getByText(/O serviço de almoço não está abrangido por esta política/)).toBeInTheDocument();
  });
});
