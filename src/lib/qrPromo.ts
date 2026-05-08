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
}

const EVT = "nathan-qr-promo-change";

export const parseQrFromUrl = (): { percent: number; campaign: string } | null => {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("promo");
  if (!raw) return null;
  const m = /^qr(\d{1,2})$/i.exec(raw.trim());
  if (!m) return null;
  const pct = parseInt(m[1], 10);
  if (!pct || pct < 1 || pct > 90) return null;
  return { percent: pct, campaign: `qr${pct}` };
};

export const urlHasPromoParam = (): boolean => {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("promo");
};

/** Verdadeiro só quando URL é exatamente "/" — sem query, hash ou rota extra. */
export const urlIsExactRoot = (): boolean => {
  if (typeof window === "undefined") return false;
  const { pathname, search, hash } = window.location;
  return pathname === "/" && !search && !hash;
};

export const loadQrPromo = (): QrPromo | null => {
  try {
    const raw = localStorage.getItem(QR_KEY);
    return raw ? (JSON.parse(raw) as QrPromo) : null;
  } catch { return null; }
};

export const saveQrPromo = (q: QrPromo) => {
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
  } catch {}
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
