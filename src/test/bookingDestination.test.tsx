import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SummaryOutput } from "@/components/SummaryOutput";

describe("booking WhatsApp destination", () => {
  it("sends the reservation to the confirmed DDD 22 number", () => {
    render(
      <SummaryOutput
        text="Reserva teste"
        lang="pt"
        onReset={() => undefined}
        rows={[]}
        tourTitle="Passeio de teste"
      />,
    );

    expect(screen.getByRole("link", { name: /confirmar e enviar para whatsapp/i }))
      .toHaveAttribute("href", "https://wa.me/5522998216796?text=Reserva%20teste");
  });
});
