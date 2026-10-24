import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TourDatePicker } from "@/components/TourDatePicker";

describe("tour date picker cruise legend", () => {
  it("shows separate accessible markers for today, the selected date, and cruise dates", async () => {
    render(<TourDatePicker lang="pt" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /selecione a data/i }));

    const legend = await screen.findByRole("group", { name: "Legenda do calendário" });
    expect(legend).toHaveTextContent("Hoje");
    expect(legend).toHaveTextContent("Data escolhida");
    expect(legend).toHaveTextContent("Dia de cruzeiro");
  });
});
