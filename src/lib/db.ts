// ============================================================
// Camada de serviço — leads, cupons e reservas no Lovable Cloud.
// Operações públicas vão pela edge function `public-data` e as
// administrativas (com PII) pela `admin-data`, ambas usando a
// service role no servidor. O cliente anônimo não acessa essas
// tabelas diretamente (RLS bloqueia tudo).
// Sempre best-effort: nunca quebra o fluxo do usuário.
// ============================================================
import { supabase } from "@/integrations/supabase/client";
import { getAdminToken } from "@/lib/adminAuth";

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");

async function callPublic<T = any>(action: string, payload: Record<string, unknown> = {}): Promise<T | null> {
  const { data, error } = await supabase.functions.invoke("public-data", {
    body: { action, ...payload },
  });
  if (error) throw error;
  return data as T;
}

async function callAdmin<T = any>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const token = getAdminToken();
  const { data, error } = await supabase.functions.invoke("admin-data", {
    body: { action, token, ...payload },
  });
  if (error) throw error;
  if (data?.ok === false) throw new Error(data?.error || "admin_error");
  return data as T;
}

type RealtimeCallback = () => void;

// Mantido por compatibilidade. As tabelas com PII não são mais
// publicadas no Realtime; a atualização ao vivo de conteúdo do CMS
// continua funcionando. As telas de admin têm botão de atualizar.
export const subscribeAdminRealtime = (cb: RealtimeCallback) => {
  const channel = supabase
    .channel(`admin-live-data-${Math.random().toString(36).slice(2)}-${Date.now()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "tours" }, cb)
    .on("postgres_changes", { event: "*", schema: "public", table: "config_global" }, cb)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// ---------------- LEADS ----------------
export async function syncLead(input: {
  nome: string;
  telefone: string;
  email?: string;
  origem?: string;
}) {
  try {
    await callPublic("create_lead", {
      nome: input.nome,
      telefone: onlyDigits(input.telefone),
      email: input.email || null,
      origem: input.origem || "site",
    });
  } catch (e) {
    console.warn("[db] syncLead falhou", e);
  }
}

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  origem: string | null;
  created_at: string;
}

/** Admin: lista leads (via edge function autenticada). */
export async function fetchLeads(limit = 300): Promise<Lead[]> {
  try {
    const res = await callAdmin<{ rows: Lead[] }>("list_leads", { limit });
    return res.rows || [];
  } catch (e) {
    console.warn("[db] fetchLeads falhou", e);
    return [];
  }
}

// ---------------- CUPONS ----------------
export interface DbCupom {
  id: string;
  telefone: string;
  email: string | null;
  codigo: string;
  desconto_percentual: number;
  criado_em: string;
  expira_em: string;
  usado: boolean;
}

/**
 * Garante que um cupom de boas-vindas exista no DB para o telefone.
 * Regras: 1 cupom ativo por telefone; reutiliza válido; se expirou/usado, cria novo.
 */
export async function syncWelcomeCoupon(input: {
  telefone: string;
  email?: string;
  codigo: string;
  desconto_percentual: number;
  expira_em: string;
}): Promise<DbCupom | null> {
  const phone = onlyDigits(input.telefone);
  if (!phone) return null;
  try {
    const res = await callPublic<{ ok: boolean; cupom?: DbCupom }>("sync_welcome_coupon", {
      telefone: phone,
      email: input.email || null,
      codigo: input.codigo,
      desconto_percentual: input.desconto_percentual,
      expira_em: input.expira_em,
    });
    return (res?.cupom as DbCupom) ?? null;
  } catch (e) {
    console.warn("[db] syncWelcomeCoupon falhou", e);
    return null;
  }
}

export interface CouponValidation {
  ok: boolean;
  reason?: "not_found" | "expired" | "used" | "wrong_phone";
  cupom?: Partial<DbCupom>;
}

export async function validateCouponInDb(
  codigo: string,
  telefone?: string,
): Promise<CouponValidation> {
  try {
    const res = await callPublic<CouponValidation>("validate_coupon", {
      codigo: codigo.trim().toUpperCase(),
      telefone: telefone ? onlyDigits(telefone) : "",
    });
    return res ?? { ok: false, reason: "not_found" };
  } catch (e) {
    console.warn("[db] validateCouponInDb falhou", e);
    return { ok: false, reason: "not_found" };
  }
}

export async function markCouponUsedInDb(codigo: string) {
  try {
    await callPublic("mark_coupon_used", { codigo: codigo.trim().toUpperCase() });
  } catch (e) {
    console.warn("[db] markCouponUsedInDb falhou", e);
  }
}

// ---------------- RESERVAS ----------------
export interface NewReserva {
  nome: string;
  telefone: string;
  email?: string;
  destino: string;
  data_viagem?: string | null;
  passageiros?: number | null;
  cupom_aplicado?: string | null;
  valor_original?: number | null;
  valor_com_desconto?: number | null;
}

export interface Reserva {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  destino: string;
  data_viagem: string | null;
  passageiros: number | null;
  cupom_aplicado: string | null;
  valor_original: number | null;
  valor_com_desconto: number | null;
  status: string;
  created_at: string;
}

export async function createReservaInDb(
  r: NewReserva,
  status: "pendente" | "concluida" = "pendente",
): Promise<string | null> {
  try {
    const res = await callPublic<{ id: string | null }>("create_reserva", {
      nome: r.nome,
      telefone: onlyDigits(r.telefone),
      email: r.email || null,
      destino: r.destino,
      data_viagem: r.data_viagem || null,
      passageiros: r.passageiros ?? null,
      cupom_aplicado: r.cupom_aplicado || null,
      valor_original: r.valor_original ?? null,
      valor_com_desconto: r.valor_com_desconto ?? null,
      status,
    });
    return res?.id ?? null;
  } catch (e) {
    console.warn("[db] createReservaInDb falhou", e);
    return null;
  }
}

/** Fluxo público: marca uma reserva PENDENTE como concluída. */
export async function completeReserva(id: string): Promise<boolean> {
  try {
    const res = await callPublic<{ ok: boolean }>("complete_reserva", { id });
    return res?.ok === true;
  } catch (e) {
    console.warn("[db] completeReserva falhou", e);
    return false;
  }
}

/** Admin: alterna o status de uma reserva (via edge function autenticada). */
export async function updateReservaStatus(
  id: string,
  status: "pendente" | "concluida",
): Promise<boolean> {
  try {
    await callAdmin("update_reserva_status", { id, status });
    return true;
  } catch (e) {
    console.warn("[db] updateReservaStatus falhou", e);
    return false;
  }
}

/** Admin: lista reservas (via edge function autenticada). */
export async function fetchReservas(limit = 200): Promise<Reserva[]> {
  try {
    const res = await callAdmin<{ rows: Reserva[] }>("list_reservas", { limit });
    return res.rows || [];
  } catch (e) {
    console.warn("[db] fetchReservas falhou", e);
    return [];
  }
}

// ---------------- ADMIN STATS ----------------
export async function fetchAdminStats() {
  try {
    const res = await callAdmin<{ stats: any }>("admin_stats");
    return res.stats;
  } catch (e) {
    console.warn("[db] fetchAdminStats falhou", e);
    return { totalLeads: 0, cuponsAtivos: 0, reservasPendentes: 0, totalReservas: 0, conversao: 0 };
  }
}

export interface AdminRow {
  nome: string;
  telefone: string;
  email: string | null;
  cupom: string | null;
  reserva: string | null;
  status: string | null;
  created_at: string;
}

export async function fetchAdminTable(limit = 100): Promise<AdminRow[]> {
  try {
    const res = await callAdmin<{ rows: AdminRow[] }>("admin_table", { limit });
    return res.rows || [];
  } catch (e) {
    console.warn("[db] fetchAdminTable falhou", e);
    return [];
  }
}

export interface PendingReservationPhone {
  telefone: string;
  nome: string;
  destino: string;
  created_at: string;
}

export async function fetchPendingReservationPhones(limit = 200): Promise<PendingReservationPhone[]> {
  try {
    const res = await callAdmin<{ rows: PendingReservationPhone[] }>("pending_reservation_phones", { limit });
    return res.rows || [];
  } catch (e) {
    console.warn("[db] fetchPendingReservationPhones falhou", e);
    return [];
  }
}
