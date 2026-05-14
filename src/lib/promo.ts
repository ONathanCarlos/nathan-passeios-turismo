// ============================================================
// Sistema de Cupom Promocional — Nathan Passeios
// Fonte única de configuração: CMS (Supabase, tabela `modais`).
// localStorage aqui guarda apenas estado per-usuário (cupom
// emitido, bloqueios por telefone, cupons especiais já usados).
// ============================================================
import { getAllCachedModais, type ModalCache } from "./cmsCache";
import { isQrActive } from "./qrPromo";

export const PROMO_KEY = "nathan_promo_v1";
export const SPECIAL_USED_KEY = "nathan_special_used_v1";
export const ADMIN_KEY = "nathan_admin_v1";
export const WELCOME_BLOCKED_KEY = "nathan_welcome_blocked_v1";
export const PROMO_DISCOUNT_DEFAULT = 10;
export const PROMO_VALIDITY_DAYS_DEFAULT = 3;
export const PROMO_DISCOUNT = PROMO_DISCOUNT_DEFAULT;
export const PROMO_VALIDITY_DAYS = PROMO_VALIDITY_DAYS_DEFAULT;

// Defaults estáticos. Sem leitura de localStorage para configuração.
const getWelcomePercent = () => PROMO_DISCOUNT_DEFAULT;
const getWelcomeDays = () => PROMO_VALIDITY_DAYS_DEFAULT;
const getWelcomeEnabled = () => !isQrActive();
const getRecoveryEnabled = () => !isQrActive();
const getHolidayEnabled = () => true;

export const isAllCouponsEnabled = () => true;

export interface PromoData {
  nome: string;
  whatsapp: string;
  email: string;
  aceitaLembretes: boolean;
  cupom: string;
  percentualDesconto: number;
  cupomUsado: boolean;
  dataCadastro: string;
  expiraEm: string;
  lembrete24hEnviado: boolean;
  lembrete72hEnviado: boolean;
  respondeuLembrete: boolean;
}

// ---------- Cupons especiais ----------
export interface SpecificCoupon {
  key?: string;
  code: string;
  percent: number;
  /** ISO date "YYYY-MM-DD" — disponível apenas neste dia */
  onlyDate?: string;
  /** Disponível somente após N horas sem reserva (recuperação) */
  afterHoursIdle?: number;
  /** Requer aceite de lembretes */
  requiresReminder?: boolean;
  /** Mensagem contextual para modal */
  message?: string;
}

const BUILTIN_SPECIAL: SpecificCoupon[] = [
  { code: "TODEVOLTA12",   percent: 12, afterHoursIdle: 72, requiresReminder: true,
    message: "Sentimos sua falta! Volte com 12% de desconto especial." },
  { code: "TOURDASMAES12", percent: 12, onlyDate: "2026-05-10",
    message: "Feliz Dia das Mães! Aproveite 12% de desconto especial 💐" },
  { code: "AMORTURISMO12", percent: 12, onlyDate: "2026-06-12",
    message: "Dia dos Namorados! Celebre com 12% de desconto ❤️" },
  { code: "PAITURISTA12",  percent: 12, onlyDate: "2026-08-09",
    message: "Feliz Dia dos Pais! 12% de desconto especial para você 🎉" },
  { code: "INDEPENDENCIA12", percent: 12, onlyDate: "2026-09-07",
    message: "7 de Setembro! Comemore com 12% de desconto 🇧🇷" },
];

/**
 * Mapeia `modais.key` (CMS) → metadados não-editáveis pelo CMS
 * (data/recovery), unindo com percent/code/message/ativo do CMS.
 * Modais sem entrada aqui são ignorados como cupom especial.
 */
const MODAL_KEY_META: Record<string, Partial<SpecificCoupon> & { fallbackCode: string }> = {
  todevolta:  { afterHoursIdle: 72, requiresReminder: true, fallbackCode: "TODEVOLTA12" },
  maes:       { onlyDate: "2026-05-10", fallbackCode: "TOURDASMAES12" },
  namorados:  { onlyDate: "2026-06-12", fallbackCode: "AMORTURISMO12" },
  pais:       { onlyDate: "2026-08-09", fallbackCode: "PAITURISTA12" },
  brasil:     { onlyDate: "2026-09-07", fallbackCode: "INDEPENDENCIA12" },
  natal:      { onlyDate: "2026-12-25", fallbackCode: "NATAL15" },
  anonovo:    { onlyDate: "2026-12-31", fallbackCode: "ANO15" },
  blackfri:   { fallbackCode: "BF20" },
  espanhol:   { fallbackCode: "HERMANO5" },
  qr5:        { fallbackCode: "QR5" },
  qr10:       { fallbackCode: "QR10" },
};

const pickModalText = (m: ModalCache, base: "titulo" | "mensagem") => {
  const key = `${base}_pt` as const;
  return m[key] || m[`${base}_en` as const] || m[`${base}_es` as const] || m[`${base}_fr` as const] || m[`${base}_it` as const] || "";
};

const extractRuleDate = (regra: any): string | undefined => {
  if (!regra || typeof regra !== "object") return undefined;
  const raw = regra.onlyDate || regra.only_date || regra.date || regra.data || regra.data_especifica;
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
};

const extractRuleHours = (regra: any): number | undefined => {
  if (!regra || typeof regra !== "object") return undefined;
  const raw = regra.afterHoursIdle ?? regra.after_hours_idle ?? regra.afterHours ?? regra.horas ?? regra.idleHours;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : undefined;
};

const extractRuleReminder = (regra: any): boolean | undefined => {
  if (!regra || typeof regra !== "object") return undefined;
  const raw = regra.requiresReminder ?? regra.requires_reminder ?? regra.lembretes ?? regra.optin;
  return typeof raw === "boolean" ? raw : undefined;
};

/** SPECIAL_COUPONS efetivos — fonte de verdade: CMS modais (Supabase). */
export const getSpecialCoupons = (): SpecificCoupon[] => {
  const cmsModais = getAllCachedModais();
  // Sem modais carregados → defaults estáticos (BUILTIN_SPECIAL).
  if (cmsModais.length === 0) return [...BUILTIN_SPECIAL];

  const merged: SpecificCoupon[] = [];
  for (const m of cmsModais) {
    if (!m.ativo) continue;
    const meta = MODAL_KEY_META[m.key];
    const ruleDate = extractRuleDate(m.regra);
    const ruleHours = extractRuleHours(m.regra);
    const ruleReminder = extractRuleReminder(m.regra);
    const isSpecial = !!meta || !!ruleDate || !!ruleHours || !!ruleReminder;
    if (!isSpecial) continue;
    merged.push({
      key: m.key,
      code: (m.codigo || meta.fallbackCode || m.key).toUpperCase(),
      percent: m.percentual || 0,
      onlyDate: ruleDate || meta?.onlyDate,
      afterHoursIdle: ruleHours ?? meta?.afterHoursIdle,
      requiresReminder: ruleReminder ?? meta?.requiresReminder,
      message: pickModalText(m, "mensagem") || meta?.message || pickModalText(m, "titulo") || "",
    });
  }
  return merged.length > 0 ? merged : [...BUILTIN_SPECIAL];
};

/** @deprecated use getSpecialCoupons() — mantido para compat */
export const SPECIAL_COUPONS: SpecificCoupon[] = BUILTIN_SPECIAL;

// ---------- Persistência ----------
export const loadPromo = (): PromoData | null => {
  try {
    const raw = localStorage.getItem(PROMO_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PromoData;
    // Migração: remove traço de cupons antigos NAT-XXXX → NATXXXX
    if (p && typeof p.cupom === "string" && p.cupom.includes("-")) {
      p.cupom = p.cupom.replace(/^NAT-/i, "NAT").toUpperCase();
      localStorage.setItem(PROMO_KEY, JSON.stringify(p));
    }
    // Limpeza pontual de cupom de teste já enviado
    if (p && p.cupom?.toUpperCase() === "NAT8523") {
      localStorage.removeItem(PROMO_KEY);
      return null;
    }
    return p;
  } catch { return null; }
};

export const savePromo = (data: PromoData) => {
  localStorage.setItem(PROMO_KEY, JSON.stringify(data));
};

export const clearPromo = () => localStorage.removeItem(PROMO_KEY);

export const generateCoupon = (): string => `BEMVINDO${Math.floor(1000 + Math.random() * 9000)}`;
/** Normaliza cupons antigos para o formato atual */
export const normalizeCoupon = (code: string): string => (code || "").replace(/^NAT-/i, "NAT").toUpperCase();

export const createPromo = (input: {
  nome: string; whatsapp: string; email: string; aceitaLembretes: boolean;
}): PromoData => {
  const now = new Date();
  const days = getWelcomeDays();
  const expira = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return {
    ...input,
    cupom: generateCoupon(),
    percentualDesconto: getWelcomePercent(),
    cupomUsado: false,
    dataCadastro: now.toISOString(),
    expiraEm: expira.toISOString(),
    lembrete24hEnviado: false,
    lembrete72hEnviado: false,
    respondeuLembrete: false,
  };
};

export const isExpired = (p: PromoData) => new Date(p.expiraEm).getTime() < Date.now();

export const hoursLeft = (p: PromoData) => {
  const ms = new Date(p.expiraEm).getTime() - Date.now();
  return Math.max(0, Math.floor(ms / 3600000));
};

export const formatCountdown = (p: PromoData): string => {
  const ms = Math.max(0, new Date(p.expiraEm).getTime() - Date.now());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
};

// ---------- Whitelist de testadores ----------
export const TESTER_PHONES: string[] = ["22998216796"];
const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");

export const isTesterPhone = (whatsapp: string): boolean => {
  const d = onlyDigits(whatsapp);
  return TESTER_PHONES.some((t) => {
    const td = onlyDigits(t);
    return d === td || d.endsWith(td) || td.endsWith(d);
  });
};

export const isTester = (p: PromoData | null): boolean =>
  !!p && isTesterPhone(p.whatsapp);

// ---------- Modo administrador ----------
export const isAdminMode = (): boolean => {
  try {
    if (typeof window === "undefined") return false;
    // Acesso administrativo só via /admin com senha — nunca via URL pública.
    return localStorage.getItem(ADMIN_KEY) === "1";
  } catch { return false; }
};

export const enableAdminMode = () => localStorage.setItem(ADMIN_KEY, "1");
export const disableAdminMode = () => localStorage.removeItem(ADMIN_KEY);

// ---------- Bloqueio definitivo do cupom de boas-vindas por telefone ----------
const loadWelcomeBlocked = (): string[] => {
  try { return JSON.parse(localStorage.getItem(WELCOME_BLOCKED_KEY) || "[]"); }
  catch { return []; }
};
const saveWelcomeBlocked = (list: string[]) =>
  localStorage.setItem(WELCOME_BLOCKED_KEY, JSON.stringify(list));

export const blockWelcomeForPhone = (whatsapp: string) => {
  const d = onlyDigits(whatsapp);
  if (!d) return;
  const list = loadWelcomeBlocked();
  if (!list.includes(d)) { list.push(d); saveWelcomeBlocked(list); }
};

export const unblockWelcomeForPhone = (whatsapp: string) => {
  const d = onlyDigits(whatsapp);
  if (!d) return;
  saveWelcomeBlocked(loadWelcomeBlocked().filter((x) => x !== d));
};

export const isWelcomeBlockedForPhone = (whatsapp: string): boolean => {
  const d = onlyDigits(whatsapp);
  if (!d) return false;
  return loadWelcomeBlocked().includes(d);
};

export const getBlockedWelcomePhones = (): string[] => loadWelcomeBlocked();

// ---------- Marcar cupom usado ----------
export const markCouponUsed = () => {
  const p = loadPromo();
  if (!p) return;
  if (isTester(p) || isAdminMode()) return;
  savePromo({ ...p, cupomUsado: true });
  blockWelcomeForPhone(p.whatsapp);
  // remove o cupom ativo do site para este cliente
  clearPromo();
};

export const isWelcomeCouponEnabled = () => getWelcomeEnabled();

interface SpecialUseRecord { code: string; phoneDigits: string; nameKey: string; usedAt: string; }

const loadSpecialUsed = (): SpecialUseRecord[] => {
  try {
    const raw = localStorage.getItem(SPECIAL_USED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveSpecialUsed = (list: SpecialUseRecord[]) =>
  localStorage.setItem(SPECIAL_USED_KEY, JSON.stringify(list));

const nameKey = (n: string) => (n || "").trim().toLowerCase().replace(/\s+/g, " ");

export const hasUsedSpecial = (code: string, name: string, whatsapp: string): boolean => {
  if (isAdminMode() || isTesterPhone(whatsapp)) return false;
  const d = onlyDigits(whatsapp);
  const k = nameKey(name);
  return loadSpecialUsed().some((r) =>
    r.code.toUpperCase() === code.toUpperCase() &&
    (r.phoneDigits === d || r.nameKey === k)
  );
};

export const markSpecialUsed = (code: string, name: string, whatsapp: string) => {
  if (isAdminMode() || isTesterPhone(whatsapp)) return;
  const list = loadSpecialUsed();
  list.push({
    code: code.toUpperCase(),
    phoneDigits: onlyDigits(whatsapp),
    nameKey: nameKey(name),
    usedAt: new Date().toISOString(),
  });
  saveSpecialUsed(list);
};

// ---------- Validação de cupom especial por código ----------
export interface SpecialValidation {
  ok: boolean;
  coupon?: SpecificCoupon;
  reason?: "not_found" | "wrong_date" | "needs_reminder" | "needs_idle" | "already_used";
}

const todayISO = () => {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
};

export const validateSpecialCoupon = (
  code: string,
  ctx: { promo?: PromoData | null; name?: string; whatsapp?: string }
): SpecialValidation => {
  const list = getSpecialCoupons();
  const c = list.find((x) => x.code.toUpperCase() === code.trim().toUpperCase());
  if (!c) return { ok: false, reason: "not_found" };
  if (c.onlyDate && !getHolidayEnabled()) return { ok: false, coupon: c, reason: "wrong_date" };
  if (c.afterHoursIdle && !getRecoveryEnabled()) return { ok: false, coupon: c, reason: "needs_idle" };

  if (!isAdminMode()) {
    if (c.onlyDate && c.onlyDate !== todayISO()) return { ok: false, coupon: c, reason: "wrong_date" };
    if (c.requiresReminder && !ctx.promo?.aceitaLembretes) return { ok: false, coupon: c, reason: "needs_reminder" };
    if (c.afterHoursIdle && ctx.promo) {
      const elapsedH = (Date.now() - new Date(ctx.promo.dataCadastro).getTime()) / 3600000;
      if (elapsedH < c.afterHoursIdle) return { ok: false, coupon: c, reason: "needs_idle" };
    }
    const name = ctx.name || ctx.promo?.nome || "";
    const wa = ctx.whatsapp || ctx.promo?.whatsapp || "";
    if (hasUsedSpecial(c.code, name, wa)) return { ok: false, coupon: c, reason: "already_used" };
  }
  return { ok: true, coupon: c };
};

/** Existe cupom comemorativo ativo HOJE? Se sim, padrão+recuperação ficam desativados. */
export const hasHolidayActiveToday = (): boolean => {
  if (!getHolidayEnabled()) return false;
  const today = todayISO();
  return getSpecialCoupons().some((c) => c.onlyDate === today);
};

/** Retorna o cupom especial disponível HOJE (se houver) — para modal automático */
export const getTodaySpecialCoupon = (promo: PromoData | null): SpecificCoupon | null => {
  const today = todayISO();
  const list = getSpecialCoupons();
  if (getHolidayEnabled()) {
    for (const c of list) {
      if (c.onlyDate !== today) continue;
      const v = validateSpecialCoupon(c.code, { promo });
      if (v.ok) return c;
    }
  }
  if (hasHolidayActiveToday()) return null;
  if (getRecoveryEnabled() && promo && promo.aceitaLembretes && !promo.cupomUsado) {
    const rec = list.find((c) => c.afterHoursIdle);
    if (rec) {
      const v = validateSpecialCoupon(rec.code, { promo });
      if (v.ok) return rec;
    }
  }
  return null;
};

