// ============================================================
// Sistema de promoção via QR Code (?promo=qrN)
// Detecta parâmetro, salva no localStorage, expõe helpers.
// ============================================================
const QR_KEY = "nathan_qr_promo_v1";
const QR_SEEN_KEY = "nathan_qr_seen_v1";

export interface QrPromo {
  percent: number;
  campaign: string; // ex: "qr10"
  activatedAt: string;
  /** Quando presente, o desconto vale somente para este passeio. */
  tourKey?: string;
}

const EVT = "nathan-qr-promo-change";
const TOUR_QR_KEYS = new Set([
  "escuna", "arraial", "buggy", "cabofrio", "jardineira", "catamara", "mergulho", "lancha",
]);

const parseTourQrPath = (pathname: string) => {
  const match = /^\/passeios\/([a-z0-9-]+)\/qr(5|10)$/i.exec(pathname);
  if (!match) return null;
  const tourKey = match[1].toLowerCase();
  if (!TOUR_QR_KEYS.has(tourKey)) return null;
  const percent = Number(match[2]);
  return { percent, campaign: `qr${percent}-${tourKey}`, tourKey };
};

const isValidQrPromo = (q: QrPromo): boolean => {
  if (!q || typeof q !== "object") return false;
  const percentValid = Number.isInteger(q.percent) && q.percent >= 1 && q.percent <= 90;
  const campaign = typeof q.campaign === "string" ? q.campaign.toLowerCase() : "";
  const globalQr = q.tourKey === undefined && campaign === `qr${q.percent}`;
  const targetedQr = typeof q.tourKey === "string"
    && TOUR_QR_KEYS.has(q.tourKey.toLowerCase())
    && (q.percent === 5 || q.percent === 10)
    && campaign === `qr${q.percent}-${q.tourKey.toLowerCase()}`;
  return percentValid && (globalQr || targetedQr);
};

export const parseQrFromUrl = (): { percent: number; campaign: string; tourKey?: string } | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const tourPromo = parseTourQrPath(window.location.pathname);
  if (tourPromo) return tourPromo;
  const pathMatch = /^\/qr(\d{1,2})$/i.exec(window.location.pathname);
  const raw = params.get("promo") ?? params.get("qr") ?? pathMatch?.[1] ?? null;
  if (!raw) return null;
  const m = pathMatch ? pathMatch : /^qr?(\d{1,2})$/i.exec(raw.trim());
  if (!m) return null;
  const pct = parseInt(m[1], 10);
  if (!pct || pct < 1 || pct > 90) return null;
  return { percent: pct, campaign: `qr${pct}` };
};

export const urlHasPromoParam = (): boolean => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.has("promo") || params.has("qr")
    || /^\/qr\d{1,2}$/i.test(window.location.pathname)
    || !!parseTourQrPath(window.location.pathname);
};

/** QR antigo sem passeio é global; um QR novo só corresponde ao passeio explícito. */
export const qrPromoForTour = <T extends QrPromo>(promo: T | null, tourKey?: string): T | null => {
  if (!promo) return null;
  if (!promo.tourKey) return promo;
  return tourKey && promo.tourKey.toLowerCase() === tourKey.toLowerCase() ? promo : null;
};

export const loadQrPromoForTour = (tourKey?: string): QrPromo | null =>
  qrPromoForTour(loadQrPromo(), tourKey);

/** Verdadeiro só quando URL é exatamente "/" — sem query, hash ou rota extra. */
export const urlIsExactRoot = (): boolean => {
  if (typeof window === "undefined") return false;
  const { pathname, search, hash } = window.location;
  return pathname === "/" && !search && !hash;
};

export const loadQrPromo = (): QrPromo | null => {
  try {
    const raw = localStorage.getItem(QR_KEY);
    if (!raw) return null;
    const q = JSON.parse(raw) as QrPromo;
    if (isValidQrPromo(q)) return q;
    localStorage.removeItem(QR_KEY);
    return null;
  } catch {
    try { localStorage.removeItem(QR_KEY); } catch { /* storage may be unavailable */ }
    return null;
  }
};

export const saveQrPromo = (q: QrPromo) => {
  if (!isValidQrPromo(q)) return;
  localStorage.setItem(QR_KEY, JSON.stringify(q));
  window.dispatchEvent(new CustomEvent(EVT));
};

export const clearQrPromo = () => {
  localStorage.removeItem(QR_KEY);
  window.dispatchEvent(new CustomEvent(EVT));
};

export const isQrActive = (): boolean => !!loadQrPromo();

export const hasSeenCampaign = (campaign: string): boolean => {
  try {
    const raw = localStorage.getItem(QR_SEEN_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list.includes(campaign);
  } catch { return false; }
};

export const markSeenCampaign = (campaign: string) => {
  try {
    const raw = localStorage.getItem(QR_SEEN_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(campaign)) {
      list.push(campaign);
      localStorage.setItem(QR_SEEN_KEY, JSON.stringify(list));
    }
  } catch { /* local storage may be unavailable */ }
};

/** Subscreve mudanças no QR promo (storage + custom event) */
export const subscribeQrPromo = (cb: () => void): (() => void) => {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
};

/** Aplica o desconto QR (se ativo) sobre um valor numérico. */
export const applyQrDiscount = (value: number): number => {
  const q = loadQrPromo();
  if (!q) return value;
  return value - (value * q.percent) / 100;
};

/** Bloqueio de recursos admin enquanto QR promo estiver presente */
export const adminBlockedByQr = (): boolean => urlHasPromoParam() || isQrActive();
