// ============================================================
// Admin Config Layer — overrides locais (localStorage)
// Substitui dinamicamente preços, descrições, imagens, vídeos
// e parâmetros de cupons sem alterar código fonte.
// ============================================================
import { useEffect, useState } from "react";
import { TourKey } from "./tours";
import { Lang } from "./i18n";

const KEY = "nathan_admin_config_v1";
const EVT = "nathan-admin-config-change";

export interface AdminConfig {
  prices: Partial<Record<TourKey, number>>;
  descriptions: Partial<Record<TourKey, Partial<Record<Lang, string>>>>;
  titles: Partial<Record<TourKey, Partial<Record<Lang, string>>>>;
  images: Partial<Record<TourKey, string>>;       // dataURL ou URL
  videos: { mobile?: string; desktop?: string };  // dataURL ou URL
  coupon: {
    allEnabled?: boolean;
    welcomePercent?: number;
    welcomeValidityDays?: number;
    welcomeEnabled?: boolean;
    recoveryEnabled?: boolean;
    recoveryPercent?: number;
    recoveryAfterHours?: number;
    holidayEnabled?: boolean;
    holidayPercent?: number;
  };
  specials: Array<{
    code: string; percent: number; onlyDate?: string;
    afterHoursIdle?: number; requiresReminder?: boolean;
    message?: string; enabled?: boolean;
  }>;
}

const DEFAULT: AdminConfig = {
  prices: {},
  descriptions: {},
  titles: {},
  images: {},
  videos: {},
  coupon: {},
  specials: [],
};

export const loadAdminConfig = (): AdminConfig => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch { return DEFAULT; }
};

export const saveAdminConfig = (cfg: AdminConfig) => {
  localStorage.setItem(KEY, JSON.stringify(cfg));
  window.dispatchEvent(new CustomEvent(EVT));
};

export const updateAdminConfig = (patch: Partial<AdminConfig>) => {
  const cur = loadAdminConfig();
  saveAdminConfig({ ...cur, ...patch });
};

/** Hook: re-renderiza quando a config mudar */
export const useAdminConfig = (): AdminConfig => {
  const [cfg, setCfg] = useState<AdminConfig>(() => loadAdminConfig());
  useEffect(() => {
    const fn = () => setCfg(loadAdminConfig());
    window.addEventListener(EVT, fn);
    window.addEventListener("storage", fn);
    return () => {
      window.removeEventListener(EVT, fn);
      window.removeEventListener("storage", fn);
    };
  }, []);
  return cfg;
};

// ----- Getters utilitários (não-reativos) -----
export const adminGetPrice = (key: TourKey, fallback: number): number =>
  loadAdminConfig().prices[key] ?? fallback;

export const adminGetImage = (key: TourKey, fallback: string): string =>
  loadAdminConfig().images[key] || fallback;

export const adminGetDesc = (key: TourKey, lang: Lang, fallback: string): string =>
  loadAdminConfig().descriptions[key]?.[lang] || fallback;

export const adminGetTitle = (key: TourKey, lang: Lang, fallback: string): string =>
  loadAdminConfig().titles[key]?.[lang] || fallback;

export const adminGetVideo = (which: "mobile" | "desktop", fallback: string): string =>
  loadAdminConfig().videos[which] || fallback;
