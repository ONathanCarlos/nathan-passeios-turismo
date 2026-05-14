// ============================================================
// Admin Config Layer — DESCONTINUADO
// ------------------------------------------------------------
// Anteriormente armazenava overrides em localStorage
// (preços, textos, imagens, vídeos, cupons). Agora a fonte
// de verdade única é o Supabase (tabelas tours, modais,
// config_global), lido pelo cmsCache + hooks de cms.ts.
//
// Este módulo é mantido como stub somente para preservar
// assinaturas de import. Não lê nem escreve em localStorage.
// ============================================================
import { useState } from "react";
import { TourKey } from "./tours";
import { Lang } from "./i18n";

const LEGACY_KEY = "nathan_admin_config_v1";

export interface AdminConfig {
  prices: Partial<Record<TourKey, number>>;
  descriptions: Partial<Record<TourKey, Partial<Record<Lang, string>>>>;
  titles: Partial<Record<TourKey, Partial<Record<Lang, string>>>>;
  images: Partial<Record<TourKey, string>>;
  videos: { mobile?: string; desktop?: string };
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

// Limpa qualquer resíduo legado uma única vez.
try { if (typeof localStorage !== "undefined") localStorage.removeItem(LEGACY_KEY); } catch {}

export const loadAdminConfig = (): AdminConfig => DEFAULT;
export const saveAdminConfig = (_cfg: AdminConfig) => { /* no-op: CMS é a fonte oficial */ };
export const updateAdminConfig = (_patch: Partial<AdminConfig>) => { /* no-op */ };

/** Hook estático: retorna sempre os defaults; a reatividade real vem do cmsCache. */
export const useAdminConfig = (): AdminConfig => {
  const [cfg] = useState<AdminConfig>(DEFAULT);
  return cfg;
};

export const adminGetPrice = (_key: TourKey, fallback: number): number => fallback;
export const adminGetImage = (_key: TourKey, fallback: string): string => fallback;
export const adminGetDesc = (_key: TourKey, _lang: Lang, fallback: string): string => fallback;
export const adminGetTitle = (_key: TourKey, _lang: Lang, fallback: string): string => fallback;
export const adminGetVideo = (_which: "mobile" | "desktop", fallback: string): string => fallback;
