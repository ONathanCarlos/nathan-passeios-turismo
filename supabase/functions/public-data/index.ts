import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

// ============================================================
// public-data — operações públicas seguras (sem PII em massa).
// ------------------------------------------------------------
// Usa a service role APENAS no servidor para gravar leads, cupons
// e reservas e validar cupons. O cliente nunca lê dados de outros
// clientes: validate_coupon devolve só o desconto do código.
// ============================================================

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const str = (v: unknown, max = 500): string =>
  typeof v === "string" ? v.slice(0, max) : "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    // -------------------- LEADS --------------------
    if (action === "create_lead") {
      const nome = str(body?.nome, 200);
      const telefone = onlyDigits(str(body?.telefone, 40));
      if (!nome || !telefone) return json({ ok: false, error: "invalid_input" }, 400);
      const { error } = await supabase.from("leads").insert({
        nome,
        telefone,
        email: str(body?.email, 200) || null,
        origem: str(body?.origem, 100) || "site",
      });
      if (error) return json({ ok: false, error: "db_error" }, 500);
      return json({ ok: true });
    }

    // -------------------- CUPONS --------------------
    if (action === "sync_welcome_coupon") {
      const telefone = onlyDigits(str(body?.telefone, 40));
      const codigo = str(body?.codigo, 60).trim().toUpperCase();
      const expira_em = str(body?.expira_em, 60);
      const desconto = Math.max(1, Math.min(90, Number(body?.desconto_percentual) || 10));
      if (!telefone || !codigo || !expira_em) return json({ ok: false, error: "invalid_input" }, 400);

      const { data: existing } = await supabase
        .from("cupons")
        .select("*")
        .eq("telefone", telefone)
        .eq("usado", false)
        .gte("expira_em", new Date().toISOString())
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing) return json({ ok: true, cupom: existing });

      const { data: created, error } = await supabase
        .from("cupons")
        .insert({
          telefone,
          email: str(body?.email, 200) || null,
          codigo,
          desconto_percentual: desconto,
          expira_em,
        })
        .select()
        .maybeSingle();
      if (error) return json({ ok: false, error: "db_error" }, 500);
      return json({ ok: true, cupom: created });
    }

    if (action === "validate_coupon") {
      const codigo = str(body?.codigo, 60).trim().toUpperCase();
      const telefone = onlyDigits(str(body?.telefone, 40));
      if (!codigo) return json({ ok: false, reason: "not_found" });

      const { data, error } = await supabase
        .from("cupons")
        .select("*")
        .eq("codigo", codigo)
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return json({ ok: false, reason: "not_found" });
      if (!data) return json({ ok: false, reason: "not_found" });
      if (data.usado) return json({ ok: false, reason: "used" });
      if (new Date(data.expira_em).getTime() < Date.now())
        return json({ ok: false, reason: "expired" });
      if (telefone && data.telefone && data.telefone !== telefone)
        return json({ ok: false, reason: "wrong_phone" });
      // Devolve apenas o necessário (sem expor PII de outras pessoas)
      return json({
        ok: true,
        cupom: {
          codigo: data.codigo,
          desconto_percentual: data.desconto_percentual,
          expira_em: data.expira_em,
        },
      });
    }

    if (action === "mark_coupon_used") {
      const codigo = str(body?.codigo, 60).trim().toUpperCase();
      if (!codigo) return json({ ok: false, error: "invalid_input" }, 400);
      await supabase
        .from("cupons")
        .update({ usado: true, usado_em: new Date().toISOString() })
        .eq("codigo", codigo);
      return json({ ok: true });
    }

    // -------------------- RESERVAS --------------------
    if (action === "create_reserva") {
      const nome = str(body?.nome, 200);
      const telefone = onlyDigits(str(body?.telefone, 40));
      const destino = str(body?.destino, 200);
      if (!nome || !telefone || !destino) return json({ ok: false, error: "invalid_input" }, 400);
      const status = body?.status === "concluida" ? "concluida" : "pendente";
      const { data, error } = await supabase
        .from("reservas")
        .insert({
          nome,
          telefone,
          email: str(body?.email, 200) || null,
          destino,
          data_viagem: str(body?.data_viagem, 20) || null,
          passageiros: Number.isFinite(Number(body?.passageiros)) ? Number(body?.passageiros) : null,
          cupom_aplicado: str(body?.cupom_aplicado, 60) || null,
          valor_original: body?.valor_original != null ? Number(body.valor_original) : null,
          valor_com_desconto: body?.valor_com_desconto != null ? Number(body.valor_com_desconto) : null,
          status,
        })
        .select("id")
        .maybeSingle();
      if (error) return json({ ok: false, error: "db_error" }, 500);
      return json({ ok: true, id: data?.id ?? null });
    }

    // Marca uma reserva PENDENTE como concluída (transição única e segura).
    if (action === "complete_reserva") {
      const id = str(body?.id, 60);
      if (!id) return json({ ok: false, error: "invalid_input" }, 400);
      const { error } = await supabase
        .from("reservas")
        .update({ status: "concluida" })
        .eq("id", id)
        .eq("status", "pendente");
      if (error) return json({ ok: false, error: "db_error" }, 500);
      return json({ ok: true });
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (_e) {
    return json({ ok: false, error: "bad_request" }, 400);
  }
});
