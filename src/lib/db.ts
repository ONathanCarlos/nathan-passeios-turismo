// ============================================================
// Camada de serviço — sincroniza leads, cupons e reservas no
// Lovable Cloud (Supabase). Sempre best-effort: nunca quebra
// o fluxo do usuário se a rede falhar.
// ============================================================
import { supabase } from "@/integrations/supabase/client";

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");

// ---------------- LEADS ----------------
export async function syncLead(input: {
  nome: string;
  telefone: string;
  email?: string;
  origem?: string;
}) {
  try {
    await supabase.from("leads").insert({
      nome: input.nome,
      telefone: onlyDigits(input.telefone),
      email: input.email || null,
      origem: input.origem || "site",
    });
  } catch (e) {
    console.warn("[db] syncLead falhou", e);
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
    // Existe ativo?
    const { data: existing } = await supabase
      .from("cupons")
      .select("*")
      .eq("telefone", phone)
      .eq("usado", false)
      .gte("expira_em", new Date().toISOString())
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) return existing as DbCupom;

    const { data: created } = await supabase
      .from("cupons")
      .insert({
        telefone: phone,
        email: input.email || null,
        codigo: input.codigo,
        desconto_percentual: input.desconto_percentual,
        expira_em: input.expira_em,
      })
      .select()
      .maybeSingle();
    return (created as DbCupom) ?? null;
  } catch (e) {
    console.warn("[db] syncWelcomeCoupon falhou", e);
    return null;
  }
}

export interface CouponValidation {
  ok: boolean;
  reason?: "not_found" | "expired" | "used" | "wrong_phone";
  cupom?: DbCupom;
}

export async function validateCouponInDb(
  codigo: string,
  telefone?: string,
): Promise<CouponValidation> {
  try {
    const { data, error } = await supabase
      .from("cupons")
      .select("*")
      .eq("codigo", codigo.trim().toUpperCase())
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, reason: "not_found" };
    const c = data as DbCupom;
    if (c.usado) return { ok: false, reason: "used", cupom: c };
    if (new Date(c.expira_em).getTime() < Date.now())
      return { ok: false, reason: "expired", cupom: c };
    if (telefone) {
      const p = onlyDigits(telefone);
      if (p && c.telefone && c.telefone !== p)
        return { ok: false, reason: "wrong_phone", cupom: c };
    }
    return { ok: true, cupom: c };
  } catch (e) {
    console.warn("[db] validateCouponInDb falhou", e);
    return { ok: false, reason: "not_found" };
  }
}

export async function markCouponUsedInDb(codigo: string) {
  try {
    await supabase
      .from("cupons")
      .update({ usado: true, usado_em: new Date().toISOString() })
      .eq("codigo", codigo.trim().toUpperCase());
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

export async function createReservaInDb(r: NewReserva) {
  try {
    await supabase.from("reservas").insert({
      nome: r.nome,
      telefone: onlyDigits(r.telefone),
      email: r.email || null,
      destino: r.destino,
      data_viagem: r.data_viagem || null,
      passageiros: r.passageiros ?? null,
      cupom_aplicado: r.cupom_aplicado || null,
      valor_original: r.valor_original ?? null,
      valor_com_desconto: r.valor_com_desconto ?? null,
      status: "pendente",
    });
  } catch (e) {
    console.warn("[db] createReservaInDb falhou", e);
  }
}

// ---------------- ADMIN STATS ----------------
export async function fetchAdminStats() {
  const [leads, cupons, reservas] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase
      .from("cupons")
      .select("id", { count: "exact", head: true })
      .eq("usado", false)
      .gte("expira_em", new Date().toISOString()),
    supabase
      .from("reservas")
      .select("id", { count: "exact", head: true })
      .eq("status", "pendente"),
  ]);
  const totalLeads = leads.count ?? 0;
  const cuponsAtivos = cupons.count ?? 0;
  const reservasPendentes = reservas.count ?? 0;
  // taxa de conversão = reservas / leads
  const { count: totalReservas = 0 } = await supabase
    .from("reservas")
    .select("id", { count: "exact", head: true });
  const conversao =
    totalLeads > 0 ? Math.round(((totalReservas || 0) / totalLeads) * 100) : 0;
  return { totalLeads, cuponsAtivos, reservasPendentes, totalReservas: totalReservas || 0, conversao };
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
  // Une leads + reservas + cupons por telefone
  const { data: leads = [] } = await supabase
    .from("leads")
    .select("nome, telefone, email, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  const phones = (leads || []).map((l) => l.telefone);
  const [cuponsRes, reservasRes] = await Promise.all([
    phones.length
      ? supabase.from("cupons").select("telefone, codigo, usado, expira_em").in("telefone", phones)
      : Promise.resolve({ data: [] as any[] }),
    phones.length
      ? supabase.from("reservas").select("telefone, destino, status, created_at").in("telefone", phones)
      : Promise.resolve({ data: [] as any[] }),
  ]);
  const cuponsByPhone = new Map<string, any>();
  (cuponsRes.data || []).forEach((c: any) => {
    if (!cuponsByPhone.has(c.telefone)) cuponsByPhone.set(c.telefone, c);
  });
  const reservasByPhone = new Map<string, any>();
  (reservasRes.data || []).forEach((r: any) => {
    if (!reservasByPhone.has(r.telefone)) reservasByPhone.set(r.telefone, r);
  });

  return (leads || []).map((l) => {
    const c = cuponsByPhone.get(l.telefone);
    const r = reservasByPhone.get(l.telefone);
    return {
      nome: l.nome,
      telefone: l.telefone,
      email: l.email,
      cupom: c ? c.codigo : null,
      reserva: r ? r.destino : null,
      status: r ? r.status : null,
      created_at: l.created_at,
    };
  });
}
