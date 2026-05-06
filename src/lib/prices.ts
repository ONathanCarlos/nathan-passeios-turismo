import { TourKey } from "./tours";
import { Lang } from "./i18n";
import { loadAdminConfig } from "./adminConfig";

/** Preços base por passageiro (BRL). Lancha é especial: "A partir de". */
const BASE_TOUR_PRICES: Record<TourKey, { value: number; from?: boolean; note?: Record<Lang, string> }> = {
  escuna:     { value: 80 },
  arraial:    { value: 220 },
  cabofrio:   { value: 220 },
  buggy:      { value: 120 },
  jardineira: { value: 100 },
  catamara:   { value: 130 },
  mergulho:   { value: 220 },
  lancha: {
    value: 1300,
    from: true,
    note: {
      pt: "Valor variável conforme o modelo da lancha.",
      es: "Valor variable según el modelo de la lancha.",
      en: "Price varies depending on the boat model.",
      fr: "Le prix varie selon le modèle du bateau.",
      it: "Prezzo variabile in base al modello della barca.",
    },
  },
};

const FROM: Record<Lang, string> = {
  pt: "A partir de", es: "A partir de", en: "From", fr: "À partir de", it: "A partire da",
};

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: v % 1 ? 2 : 0 });

export const tourPriceLabel = (key: TourKey, lang: Lang): string => {
  const p = TOUR_PRICES[key];
  return p.from ? `${FROM[lang]} ${formatBRL(p.value)}` : formatBRL(p.value);
};

/** Cards com cupom aplicável */
export const COUPON_ELIGIBLE: Set<TourKey> = new Set(["escuna", "arraial", "buggy", "cabofrio", "catamara"]);
