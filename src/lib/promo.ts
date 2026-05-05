// ============================================================
// Sistema de Cupom Promocional — Nathan Passeios
// Armazenamento local, geração de cupom, validades, e helpers.
// ============================================================

export const PROMO_KEY = "nathan_promo_v1";
export const PROMO_DISCOUNT = 10; // % padrão
export const PROMO_VALIDITY_DAYS = 3;

export interface PromoData {
  nome: string;
  whatsapp: string;        // ex: "+55 22 99999 9999"
  email: string;
  aceitaLembretes: boolean;
  cupom: string;           // ex: NAT-4821
  percentualDesconto: number;
  cupomUsado: boolean;
  dataCadastro: string;    // ISO
  expiraEm: string;        // ISO
  lembrete24hEnviado: boolean;
  lembrete72hEnviado: boolean;
  respondeuLembrete: boolean;
}

export const loadPromo = (): PromoData | null => {
  try {
    const raw = localStorage.getItem(PROMO_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PromoData;
  } catch {
    return null;
  }
};

export const savePromo = (data: PromoData) => {
  localStorage.setItem(PROMO_KEY, JSON.stringify(data));
};

export const clearPromo = () => localStorage.removeItem(PROMO_KEY);

export const generateCoupon = (): string => {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `NAT-${n}`;
};

export const createPromo = (input: {
  nome: string;
  whatsapp: string;
  email: string;
  aceitaLembretes: boolean;
}): PromoData => {
  const now = new Date();
  const expira = new Date(now.getTime() + PROMO_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
  return {
    ...input,
    cupom: generateCoupon(),
    percentualDesconto: PROMO_DISCOUNT,
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

/** Returns "dd:hh:mm:ss" remaining */
export const formatCountdown = (p: PromoData): string => {
  const ms = Math.max(0, new Date(p.expiraEm).getTime() - Date.now());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
};

// ------------------------------------------------------------
// WHITELIST DE TESTADORES (cupons ilimitados)
// ------------------------------------------------------------
// Apenas dígitos, sem DDI. Comparação ignora formatação.
export const TESTER_PHONES: string[] = [
  "22998216796", // Nathan (admin/teste)
];

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

export const markCouponUsed = () => {
  const p = loadPromo();
  if (!p) return;
  // Testadores não consomem o cupom — uso ilimitado.
  if (isTester(p)) return;
  savePromo({ ...p, cupomUsado: true });
};

// ------------------------------------------------------------
// LÓGICA FUTURA DE RECUPERAÇÃO (estrutura comentada)
// ------------------------------------------------------------
// Se cliente aceitou lembretes E não concluiu reserva:
//   - 24h após cadastro → enviar mensagem amigável
//     "Olá, [nome]! Seu desconto ainda está disponível 😊"
//     marcar lembrete24hEnviado = true
//   - Se respondeu (respondeuLembrete) → interromper lembretes
//   - 72h (último dia) → "⏳ Última chance! Seu cupom expira hoje."
//     marcar lembrete72hEnviado = true
//   - NÃO enviar lembrete de 48h
// Implementação real exigirá backend (cron/job). Aqui ficam apenas
// as flags persistidas para uso futuro.
// ------------------------------------------------------------
