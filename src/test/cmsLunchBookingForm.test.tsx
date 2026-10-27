import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CmsLunchBookingForm } from "@/components/CmsLunchBookingForm";
import type { CmsTour } from "@/lib/cms";

const lunchTour: CmsTour = {
  id: "cms-lunch", key: "almoco", nome_pt: "Almoço", nome_en: "Lunch", nome_es: "Almuerzo", nome_fr: "Déjeuner", nome_it: "Pranzo",
  descricao_pt: null, descricao_en: null, descricao_es: null, descricao_fr: null, descricao_it: null,
  preco: 65, imagem_url: null, gallery_imagens: [], video_url: null, video_2_url: null,
  destaque: false, ativo: true, ordem: 1, capacidade_max: null, duracao: null, horario: null,
  local_saida: null, info_adicional: null, observacoes: null, badge: null, urgencia: null,
};

describe("CMS lunch booking form", () => {
  it("renders one responsible diner by default and adds name-and-age fields for each added diner", () => {
    render(<CmsLunchBookingForm tour={lunchTour} lang="pt" onLangChange={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Responsável · pessoa 1" })).toBeInTheDocument();
    expect(screen.getAllByText("Idade")).toHaveLength(1);

    fireEvent.change(screen.getAllByRole("spinbutton")[0], { target: { value: "3" } });

    expect(screen.getByRole("heading", { name: "Pessoa 2" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pessoa 3" })).toBeInTheDocument();
    expect(screen.getAllByText("Idade")).toHaveLength(3);
    expect(screen.getAllByText("Nome completo")).toHaveLength(2);
  });
});
