import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

// ============================================================
// admin-data — operações administrativas protegidas por token.
// ------------------------------------------------------------
// Toda chamada exige um token HMAC válido emitido por `admin-auth`.
// Após validar o token, usamos a service role para ler PII (leads,
// reservas, cupons) e gravar conteúdo do CMS — nada disso é
// acessível pelo cliente anônimo via RLS.
// ============================================================

const enc = new TextEncoder();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

// ---- Verificação do token (mesma lógica de admin-auth) ----
const signingKey = async (): Promise<CryptoKey> => {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("ADMIN_PASSWORD") || "";
  return await crypto.subtle.importKey(
    "raw",
    enc.encode("admin-auth:" + secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
};

const b64url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const sign = async (payload: string): Promise<string> => {
  const key = await signingKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return b64url(new Uint8Array(sig));
};

const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

const verifyToken = async (token: string): Promise<boolean> => {
  if (typeof token !== "string" || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await sign(payload);
  if (!safeEqual(sig, expected)) return false;
  try {
    const j = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof j.exp === "number" && j.exp > Date.now();
  } catch {
    return false;
  }
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const CMS_TABLES = new Set([
  "tours", "pacotes", "home_content", "depoimentos", "config_global", "modais",
]);
const CONFLICT: Record<string, string> = {
  tours: "key", pacotes: "key", home_content: "secao",
  depoimentos: "id", config_global: "chave", modais: "key",
};

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const token = typeof body?.token === "string" ? body.token : "";

    // Toda ação exige token de admin válido
    if (!(await verifyToken(token))) {
      return json({ ok: false, error: "unauthorized" }, 401);
    }

    const limit = Math.max(1, Math.min(1000, Number(body?.limit) || 100));

    // -------------------- LEITURAS (PII) --------------------
    if (action === "list_leads") {
      const { data } = await supabase
        .from("leads").select("*")
        .order("created_at", { ascending: false }).limit(limit);
      return json({ ok: true, rows: data || [] });
    }

    if (action === "list_reservas") {
      const { data } = await supabase
        .from("reservas").select("*")
        .order("created_at", { ascending: false }).limit(limit);
      return json({ ok: true, rows: data || [] });
    }

    if (action === "list_avaliacoes") {
      const { data } = await supabase
        .from("avaliacoes")
        .select("*")
        .order("avaliado_em", { ascending: false })
        .limit(limit);
      return json({ ok: true, rows: data || [] });
    }

    if (action === "pending_reservation_phones") {
      const { data } = await supabase
        .from("reservas")
        .select("telefone, nome, destino, created_at")
        .eq("status", "pendente")
        .order("created_at", { ascending: false })
        .limit(limit);
      return json({ ok: true, rows: data || [] });
    }

    if (action === "admin_stats") {
      const [leads, cupons, reservas] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("cupons").select("id", { count: "exact", head: true })
          .eq("usado", false).gte("expira_em", new Date().toISOString()),
        supabase.from("reservas").select("id", { count: "exact", head: true })
          .eq("status", "pendente"),
      ]);
      const totalLeads = leads.count ?? 0;
      const cuponsAtivos = cupons.count ?? 0;
      const reservasPendentes = reservas.count ?? 0;
      const { count: totalReservas } = await supabase
        .from("reservas").select("id", { count: "exact", head: true });
      const tr = totalReservas ?? 0;
      const conversao = totalLeads > 0 ? Math.round((tr / totalLeads) * 100) : 0;
      return json({ ok: true, stats: { totalLeads, cuponsAtivos, reservasPendentes, totalReservas: tr, conversao } });
    }

    if (action === "admin_table") {
      const { data: leads } = await supabase
        .from("leads").select("nome, telefone, email, created_at")
        .order("created_at", { ascending: false }).limit(limit);
      const phones = (leads || []).map((l: any) => l.telefone);
      const [cuponsRes, reservasRes] = await Promise.all([
        phones.length
          ? supabase.from("cupons").select("telefone, codigo, usado, expira_em").in("telefone", phones)
          : Promise.resolve({ data: [] as any[] }),
        phones.length
          ? supabase.from("reservas").select("telefone, destino, status, created_at").in("telefone", phones)
          : Promise.resolve({ data: [] as any[] }),
      ]);
      const cuponsByPhone = new Map<string, any>();
      (cuponsRes.data || []).forEach((c: any) => { if (!cuponsByPhone.has(c.telefone)) cuponsByPhone.set(c.telefone, c); });
      const reservasByPhone = new Map<string, any>();
      (reservasRes.data || []).forEach((r: any) => { if (!reservasByPhone.has(r.telefone)) reservasByPhone.set(r.telefone, r); });
      const rows = (leads || []).map((l: any) => {
        const c = cuponsByPhone.get(l.telefone);
        const r = reservasByPhone.get(l.telefone);
        return {
          nome: l.nome, telefone: l.telefone, email: l.email,
          cupom: c ? c.codigo : null, reserva: r ? r.destino : null,
          status: r ? r.status : null, created_at: l.created_at,
        };
      });
      return json({ ok: true, rows });
    }

    // -------------------- RESERVAS (admin) --------------------
    if (action === "update_reserva_status") {
      const id = typeof body?.id === "string" ? body.id : "";
      const status = body?.status === "concluida" ? "concluida" : "pendente";
      if (!id) return json({ ok: false, error: "invalid_input" }, 400);
      const { error } = await supabase.from("reservas").update({ status }).eq("id", id);
      if (error) return json({ ok: false, error: "db_error" }, 500);
      return json({ ok: true });
    }

    // -------------------- CMS (escrita) --------------------
    if (action === "cms_upsert") {
      const table = str(body?.table, 40);
      if (!CMS_TABLES.has(table)) return json({ ok: false, error: "invalid_table" }, 400);
      const row = body?.row;
      if (!row || typeof row !== "object") return json({ ok: false, error: "invalid_input" }, 400);
      const { error } = await supabase.from(table).upsert(row, { onConflict: CONFLICT[table] });
      if (error) return json({ ok: false, error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === "cms_delete") {
      const table = str(body?.table, 40);
      if (!CMS_TABLES.has(table)) return json({ ok: false, error: "invalid_table" }, 400);
      const id = str(body?.id, 60);
      if (!id) return json({ ok: false, error: "invalid_input" }, 400);
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) return json({ ok: false, error: error.message }, 500);
      return json({ ok: true });
    }

    // -------------------- MEDIA --------------------
    if (action === "media_sign_upload") {
      const path = str(body?.path, 200);
      if (!path) return json({ ok: false, error: "invalid_input" }, 400);
      const { data, error } = await supabase.storage.from("media").createSignedUploadUrl(path);
      if (error || !data) return json({ ok: false, error: "storage_error" }, 500);
      return json({ ok: true, path: data.path, token: data.token });
    }

    if (action === "media_delete") {
      const path = str(body?.path, 300);
      if (!path) return json({ ok: false, error: "invalid_input" }, 400);
      await supabase.storage.from("media").remove([path]);
      return json({ ok: true });
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (_e) {
    return json({ ok: false, error: "bad_request" }, 400);
  }
});

function str(v: unknown, max = 500): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}
