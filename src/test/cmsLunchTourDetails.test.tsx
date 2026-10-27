import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { CmsTourDetails } from "@/components/CmsTourDetails";
import type { CmsTour } from "@/lib/cms";

const lunchTour: CmsTour = {
  id: "lunch-detail", key: "almoco", nome_pt: "Almoço", nome_en: "Lunch", nome_es: "Almuerzo", nome_fr: "Déjeuner", nome_it: "Pranzo",
  descricao_pt: null, descricao_en: null, descricao_es: null, descricao_fr: null, descricao_it: null,
  preco: 65, imagem_url: null, gallery_imagens: [], video_url: null, video_2_url: null,
  destaque: false, ativo: true, ordem: 1, capacidade_max: null, duracao: null, horario: null,
  local_saida: null, info_adicional: null, observacoes: null, badge: null, urgencia: null,
};

describe("CMS lunch tour details", () => {
  it("opens the special booking form from the reserve button", () => {
    render(
      <MemoryRouter>
        <CmsTourDetails tour={lunchTour} lang="pt" onLangChange={vi.fn()} onBack={vi.fn()} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /reservar/i }));

    expect(screen.getByText("Quantas pessoas vão almoçar?")).toBeInTheDocument();
    expect(screen.getByText("Forma de pagamento")).toBeInTheDocument();
  });

  it("opens directly when the CMS card links to the booking query parameter", () => {
    render(
      <MemoryRouter initialEntries={["/passeios/almoco?reservar=1"]}>
        <CmsTourDetails tour={lunchTour} lang="pt" onLangChange={vi.fn()} onBack={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Quantas pessoas vão almoçar?")).toBeInTheDocument();
  });
});
