import { TourKey } from "./tours";
import { Lang } from "./i18n";
import { getCachedTour } from "./cmsCache";

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

/**
 * TOUR_PRICES — fonte única: CMS (Supabase via cmsCache).
 * Sem fallback persistido; se o CMS ainda não respondeu, usa o default estático acima.
 */
export const TOUR_PRICES: Record<TourKey, { value: number; from?: boolean; note?: Record<Lang, string> }> =
  new Proxy(BASE_TOUR_PRICES, {
    get(target, prop: string) {
      const base = (target as any)[prop];
      if (!base) return base;
      const dbPrice = getCachedTour(prop as TourKey)?.preco;
      return dbPrice != null && dbPrice > 0 ? { ...base, value: dbPrice } : base;
    },
  }) as any;

const FROM: Record<Lang, string> = {
  pt: "A partir de", es: "A partir de", en: "From", fr: "À partir de", it: "A partire da",
};

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: v % 1 ? 2 : 0 });

import { loadQrPromo } from "./qrPromo";

export const tourPriceLabel = (key: TourKey, lang: Lang): string => {
  const p = TOUR_PRICES[key];
  const qr = loadQrPromo();
  if (qr) {
    const discounted = p.value - (p.value * qr.percent) / 100;
    return p.from ? `${FROM[lang]} ${formatBRL(discounted)}` : formatBRL(discounted);
  }
  return p.from ? `${FROM[lang]} ${formatBRL(p.value)}` : formatBRL(p.value);
};

/** Cards com cupom aplicável */
export const COUPON_ELIGIBLE: Set<TourKey> = new Set(["escuna", "arraial", "buggy", "cabofrio", "catamara"]);

