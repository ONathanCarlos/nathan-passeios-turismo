import { describe, expect, it } from "vitest";
import type { ModalCache } from "@/lib/cmsCache";
import { mapCmsModalCoupons } from "@/lib/promo";

const modal = (overrides: Partial<ModalCache>): ModalCache => ({
  key: "campanha",
  percentual: 10,
  codigo: "CAMPANHA10",
  regra: null,
  titulo_pt: "Oferta",
  titulo_en: null,
  titulo_es: null,
  titulo_fr: null,
  titulo_it: null,
  mensagem_pt: null,
  mensagem_en: null,
  mensagem_es: null,
  mensagem_fr: null,
  mensagem_it: null,
  ativo: true,
  ...overrides,
});

describe("cupons de modais CMS", () => {
  it("permite aplicar manualmente um código de qualquer modal ativo configurado no CMS", () => {
    const coupons = mapCmsModalCoupons([
      modal({ key: "blackfri", codigo: "BLACK20", percentual: 20 }),
    ]);

    expect(coupons).toContainEqual(expect.objectContaining({ key: "blackfri", code: "BLACK20", percent: 20 }));
  });

  it("não inclui descontos QR no catálogo de códigos digitáveis", () => {
    const coupons = mapCmsModalCoupons([
      modal({ key: "qr10", codigo: "QR10", percentual: 10 }),
      modal({ key: "oferta", codigo: "OFF5", percentual: 5 }),
    ]);

    expect(coupons.map((coupon) => coupon.code)).toEqual(["OFF5", "HERMANO5"]);
    expect(coupons.some((coupon) => coupon.code === "QR10")).toBe(false);
  });

  it("usa o código, percentual e ativação configurados para o modal espanhol", () => {
    const coupons = mapCmsModalCoupons([
      modal({ key: "espanhol", codigo: "HERMANO8", percentual: 8 }),
      modal({ key: "off", codigo: "OFF5", percentual: 5, ativo: false }),
    ]);

    expect(coupons).toEqual([expect.objectContaining({ key: "espanhol", code: "HERMANO8", percent: 8 })]);
  });

  it("não inclui um modal espanhol desativado como cupom de fallback", () => {
    const coupons = mapCmsModalCoupons([
      modal({ key: "espanhol", codigo: "HERMANO5", percentual: 5, ativo: false }),
      modal({ key: "outra", codigo: "OUTRA10", percentual: 10 }),
    ]);

    expect(coupons.map((coupon) => coupon.code)).toEqual(["OUTRA10"]);
  });
});
