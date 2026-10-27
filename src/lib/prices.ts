import { TourKey } from "./tours";
import { Lang } from "./i18n";
import { getCachedTour, type CmsTourPriceStatus } from "./cmsCache";

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
    get(target, prop) {
      if (typeof prop !== "string" || !Object.prototype.hasOwnProperty.call(target, prop)) return undefined;
      const key = prop as TourKey;
      const base = target[key];
      const dbPrice = getCachedTour(key)?.preco;
      return dbPrice != null && dbPrice > 0 ? { ...base, value: dbPrice } : base;
    },
  });

const FROM: Record<Lang, string> = {
  pt: "A partir de", es: "A partir de", en: "From", fr: "À partir de", it: "A partire da",
};

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: v % 1 ? 2 : 0 });

const PRICE_STATUS_TEXT: Record<Lang, Record<CmsTourPriceStatus, string>> = {
  pt: { loading: "Carregando preço atualizado…", ready: "", error: "Não foi possível confirmar o preço. Tente novamente.", unavailable: "Preço ainda não configurado no CMS." },
  es: { loading: "Cargando el precio actualizado…", ready: "", error: "No fue posible confirmar el precio. Inténtalo de nuevo.", unavailable: "Precio aún no configurado en el CMS." },
  en: { loading: "Loading updated price…", ready: "", error: "Could not confirm the price. Please try again.", unavailable: "Price is not configured in the CMS yet." },
  fr: { loading: "Chargement du prix actualisé…", ready: "", error: "Impossible de confirmer le prix. Réessayez.", unavailable: "Prix pas encore configuré dans le CMS." },
  it: { loading: "Caricamento del prezzo aggiornato…", ready: "", error: "Impossibile confermare il prezzo. Riprova.", unavailable: "Prezzo non ancora configurato nel CMS." },
};

export const tourPriceStatusText = (status: CmsTourPriceStatus, lang: Lang) =>
  PRICE_STATUS_TEXT[lang][status];

import { loadQrPromoForTour } from "./qrPromo";

export const tourPriceLabel = (key: TourKey, lang: Lang): string => {
  const p = TOUR_PRICES[key];
  const qr = loadQrPromoForTour(key);
  if (qr) {
    const discounted = p.value - (p.value * qr.percent) / 100;
    return p.from ? `${FROM[lang]} ${formatBRL(discounted)}` : formatBRL(discounted);
  }
  return p.from ? `${FROM[lang]} ${formatBRL(p.value)}` : formatBRL(p.value);
};

/** Cards com cupom aplicável */
export const COUPON_ELIGIBLE: Set<TourKey> = new Set(["escuna", "arraial", "buggy", "cabofrio", "catamara"]);
