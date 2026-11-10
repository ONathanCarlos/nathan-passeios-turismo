import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const promo = {
    nome: "Ana Costa",
    whatsapp: "+5522998001234",
    email: "",
    aceitaLembretes: false,
    cupom: "BEMVINDO1234",
    percentualDesconto: 10,
    cupomUsado: false,
    dataCadastro: "2026-11-10T10:00:00.000Z",
    expiraEm: "2026-11-13T10:00:00.000Z",
    lembrete24hEnviado: false,
    lembrete72hEnviado: false,
    respondeuLembrete: false,
  };
  return {
    promo,
    createPromo: vi.fn(() => promo),
    savePromo: vi.fn(),
    loadPromo: vi.fn(() => null),
    isExpired: vi.fn(() => false),
    isAdminMode: vi.fn(() => false),
    isWelcomeBlockedForPhone: vi.fn(() => false),
    isWelcomeCouponEnabled: vi.fn(() => true),
    getTodaySpecialCoupon: vi.fn(() => null),
    hasHolidayActiveToday: vi.fn(() => false),
    formatCountdown: vi.fn(() => "3d 00:00:00"),
    hoursLeft: vi.fn(() => 72),
    syncLead: vi.fn().mockResolvedValue(undefined),
    syncWelcomeCoupon: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
    toastInfo: vi.fn(),
  };
});

vi.mock("@/lib/promo", () => ({
  createPromo: mocks.createPromo,
  formatCountdown: mocks.formatCountdown,
  hoursLeft: mocks.hoursLeft,
  isExpired: mocks.isExpired,
  loadPromo: mocks.loadPromo,
  savePromo: mocks.savePromo,
  getTodaySpecialCoupon: mocks.getTodaySpecialCoupon,
  isAdminMode: mocks.isAdminMode,
  hasHolidayActiveToday: mocks.hasHolidayActiveToday,
  isWelcomeBlockedForPhone: mocks.isWelcomeBlockedForPhone,
  isWelcomeCouponEnabled: mocks.isWelcomeCouponEnabled,
}));
vi.mock("@/lib/qrPromo", () => ({
  loadQrPromoForTour: () => null,
  subscribeQrPromo: () => () => undefined,
  urlIsExactRoot: () => false,
}));
vi.mock("@/lib/cmsCache", () => ({ subscribeCmsCache: () => () => undefined }));
vi.mock("@/lib/db", () => ({ syncLead: mocks.syncLead, syncWelcomeCoupon: mocks.syncWelcomeCoupon }));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess, error: mocks.toastError, info: mocks.toastInfo } }));
vi.mock("@/components/ui/dialog", async () => {
  const React = await import("react");
  return {
    Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) => open ? React.createElement("div", { role: "dialog" }, children) : null,
    DialogContent: ({ children }: { children: React.ReactNode }) => React.createElement("div", null, children),
    DialogHeader: ({ children }: { children: React.ReactNode }) => React.createElement("div", null, children),
    DialogTitle: ({ children }: { children: React.ReactNode }) => React.createElement("h2", null, children),
    DialogDescription: ({ children }: { children: React.ReactNode }) => React.createElement("p", null, children),
  };
});

import { PromoBanner } from "@/components/PromoBanner";

describe("emissão do cupom de boas-vindas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.syncWelcomeCoupon.mockResolvedValue({
      id: "coupon-id",
      telefone: "5522998001234",
      email: null,
      codigo: "BEMVINDOJAEXISTE",
      desconto_percentual: 15,
      criado_em: "2026-11-10T10:00:00.000Z",
      expira_em: "2026-11-13T10:00:00.000Z",
      usado: false,
    });
  });

  const fillForm = () => {
    fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "Ana Costa" } });
    fireEvent.change(screen.getByPlaceholderText("DDD + seu telefone"), { target: { value: "22998001234" } });
  };

  it("entrega e salva o código retornado pelo banco, não um código local diferente", async () => {
    const onPromoCreated = vi.fn();
    render(<PromoBanner lang="pt" tourKey="escuna" forceOpen onPromoCreated={onPromoCreated} />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Liberar meu desconto" }));

    await waitFor(() => expect(mocks.syncWelcomeCoupon).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onPromoCreated).toHaveBeenCalledTimes(1));
    expect(onPromoCreated).toHaveBeenCalledWith(expect.objectContaining({
      cupom: "BEMVINDOJAEXISTE",
      percentualDesconto: 15,
      expiraEm: "2026-11-13T10:00:00.000Z",
    }));
    expect(mocks.savePromo).toHaveBeenCalledWith(expect.objectContaining({ cupom: "BEMVINDOJAEXISTE" }));
  });

  it("não salva nem oferece um cupom se a gravação no banco falhar", async () => {
    mocks.syncWelcomeCoupon.mockResolvedValue(null);
    const onPromoCreated = vi.fn();
    render(<PromoBanner lang="pt" tourKey="escuna" forceOpen onPromoCreated={onPromoCreated} />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Liberar meu desconto" }));

    await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith(expect.stringContaining("Não foi possível ativar")));
    expect(mocks.savePromo).not.toHaveBeenCalled();
    expect(onPromoCreated).not.toHaveBeenCalled();
  });
});
