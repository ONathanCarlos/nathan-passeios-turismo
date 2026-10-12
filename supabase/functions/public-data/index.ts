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

const rating = (v: unknown): number | null => {
  const value = Number(v);
  return Number.isFinite(value) && value >= 1 && value <= 5 && Number.isInteger(value * 2)
    ? value
    : null;
};

const sha256 = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const resolveReviewTourKeys = async (destinationType: string, destinationKey: string): Promise<string[]> => {
  if (!destinationKey) return [];
  if (destinationType === "tour") {
    const { data, error } = await supabase.from("tours").select("key").eq("key", destinationKey).maybeSingle();
    if (error) {
      console.error("review_tour_resolution_failed", { code: error.code });
      return [];
    }
    return data?.key ? [data.key] : [];
  }
  if (destinationType !== "package") return [];

  const { data: packageRow, error: packageError } = await supabase
    .from("pacotes").select("tour_keys").eq("key", destinationKey).maybeSingle();
  if (packageError || !packageRow) {
    if (packageError) console.error("review_package_resolution_failed", { code: packageError.code });
    return [];
  }
  const requestedKeys = Array.from(new Set((packageRow.tour_keys || []) as string[]))
    .filter((key) => key !== "almoco");
  if (requestedKeys.length === 0) return [];
  const { data: tours, error: toursError } = await supabase.from("tours").select("key").in("key", requestedKeys);
  if (toursError) {
    console.error("review_package_tour_validation_failed", { code: toursError.code });
    return [];
  }
  const validKeys = new Set((tours || []).map((tour) => tour.key));
  return requestedKeys.filter((key) => validKeys.has(key));
};

const findReviewInvite = async (token: string, shortCode: string) => {
  if (shortCode) {
    if (!/^[A-Za-z0-9]{10,16}$/.test(shortCode)) return null;
    const { data } = await supabase
      .from("convites_avaliacao")
      .select("id,reserva_id,passeio_keys,usado_em")
      .eq("codigo_curto", shortCode)
      .maybeSingle();
    return data;
  }
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const { data } = await supabase
    .from("convites_avaliacao")
    .select("id,reserva_id,passeio_keys,usado_em")
    .eq("token_hash", await sha256(token))
    .maybeSingle();
  return data;
};

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
      // A reserva nasce sempre pendente. Só complete_reserva registra o clique real no WhatsApp.
      const status = "pendente";
      const dataViagem = str(body?.data_viagem, 20) || null;
      // Deduplica somente tentativas repetidas de salvar o mesmo resumo; nunca cria convites aqui.
      const { data: recentReservations } = await supabase
        .from("reservas")
        .select("id,status,data_viagem,created_at")
        .eq("nome", nome)
        .eq("telefone", telefone)
        .eq("destino", destino)
        .order("created_at", { ascending: false })
        .limit(3);
      const duplicate = (recentReservations || []).find((item) =>
        item.data_viagem === dataViagem && Date.now() - new Date(item.created_at).getTime() < 10 * 60 * 1000
      );
      if (duplicate) {
        return json({ ok: true, id: duplicate.id, deduplicated: true });
      }
      const { data, error } = await supabase
        .from("reservas")
        .insert({
          nome,
          telefone,
          email: str(body?.email, 200) || null,
          destino,
          data_viagem: dataViagem,
          passageiros: Number.isFinite(Number(body?.passageiros)) ? Number(body?.passageiros) : null,
          cupom_aplicado: str(body?.cupom_aplicado, 60) || null,
          valor_original: body?.valor_original != null ? Number(body.valor_original) : null,
          valor_com_desconto: body?.valor_com_desconto != null ? Number(body.valor_com_desconto) : null,
          status,
        })
        .select("id")
        .maybeSingle();
      if (error) {
        console.error("create_reserva_insert_failed", { code: error.code });
        return json({ ok: false, error: "db_error" }, 500);
      }
      if (!data) return json({ ok: true, id: null });
      return json({ ok: true, id: data.id });
    }

    // O clique no WhatsApp é um evento auxiliar; falhas aqui não desfazem a reserva salva.
    if (action === "complete_reserva") {
      const id = str(body?.id, 60);
      if (!id) return json({ ok: false, error: "invalid_input" }, 400);
      const { data: reserva, error: statusError } = await supabase
        .from("reservas")
        .update({ status: "concluida" })
        .eq("id", id)
        .select("id")
        .maybeSingle();
      if (statusError || !reserva) {
        console.error("reservation_whatsapp_status_update_failed", { code: statusError?.code || "not_found" });
        return json({ ok: true, review_ready: false });
      }

      const destinationType = body?.destination_type === "package" || body?.destination_type === "tour"
        ? body.destination_type as string
        : "";
      const destinationKey = str(body?.destination_key, 100).trim();
      const reviewTourKeys = await resolveReviewTourKeys(destinationType, destinationKey);
      const { error: eligibilityError } = await supabase
        .from("reservas")
        .update({
          whatsapp_solicitado_em: new Date().toISOString(),
          review_tour_keys: reviewTourKeys,
        })
        .eq("id", id);
      if (eligibilityError) {
        console.error("reservation_review_eligibility_update_failed", { code: eligibilityError.code });
        return json({ ok: true, review_ready: false });
      }
      return json({ ok: true, review_ready: reviewTourKeys.length > 0 });
    }

    // -------------------- AVALIAÇÕES --------------------
    if (action === "get_public_reviews") {
      const passeioKey = str(body?.passeio_key, 100).trim();
      if (!passeioKey) return json({ ok: false, error: "invalid_input" }, 400);

      const { data: reviews, error } = await supabase
        .from("avaliacoes")
        .select("cliente_nome,nota_passeio,avaliacao_passeio,passeio_key")
        .eq("autorizacao_publicacao", true)
        .eq("status_publicacao", "publicada")
        .eq("passeio_key", passeioKey)
        .gte("nota_passeio", 4)
        .gt("expira_em", new Date().toISOString())
        .not("avaliado_em", "is", null)
        .order("avaliado_em", { ascending: false });

      if (error) return json({ ok: false, error: "db_error" }, 500);

      const publicReviews = (reviews || []).map((review) => {
        const normalizedName = typeof review.cliente_nome === "string"
          ? review.cliente_nome.trim().replace(/\\s+/g, " ")
          : "";
        return {
          nome: normalizedName ? normalizedName.split(" ")[0] : "Cliente",
          nota: Number(review.nota_passeio),
          comentario: review.avaliacao_passeio,
          passeio_key: review.passeio_key,
        };
      });

      return json({ ok: true, reviews: publicReviews });
    }

    if (action === "get_review_context") {
      const token = str(body?.token, 128).trim();
      const shortCode = str(body?.short_code, 16).trim();
      const invite = await findReviewInvite(token, shortCode);
      if (!invite) return json({ ok: false, error: "invalid_link" });
      if (invite.usado_em) return json({ ok: false, error: "already_submitted" });

      const { data: reserva } = await supabase
        .from("reservas")
        .select("nome,destino,status,data_viagem")
        .eq("id", invite.reserva_id)
        .in("status", ["pendente", "concluida"])
        .maybeSingle();
      if (!reserva) return json({ ok: false, error: "invalid_link" });

      const { data: tours } = await supabase
        .from("tours")
        .select("key,nome_pt")
        .in("key", invite.passeio_keys);
      const byKey = new Map((tours || []).map((tour) => [tour.key, tour.nome_pt]));
      const allowedTours = (invite.passeio_keys as string[]).flatMap((key) => {
        const nome = byKey.get(key);
        return nome ? [{ key, nome }] : [];
      });
      if (allowedTours.length === 0) return json({ ok: false, error: "invalid_link" });

      return json({
        ok: true,
        context: {
          cliente_nome: reserva.nome,
          reserva_destino: reserva.destino,
          data_viagem: reserva.data_viagem,
          passeios: allowedTours,
        },
      });
    }

    if (action === "submit_review") {
      const token = str(body?.token, 128).trim();
      const shortCode = str(body?.short_code, 16).trim();
      const notaAtendimento = rating(body?.nota_atendimento);
      const notaPlataforma = rating(body?.nota_plataforma);
      const notaPasseio = rating(body?.nota_passeio);
      const notaRecomendacao = rating(body?.nota_recomendacao);
      const passeioKey = str(body?.passeio_key, 100).trim();
      const avaliacaoPasseio = str(body?.avaliacao_passeio, 401).trim();
      const melhoria = str(body?.melhoria, 1001).trim();
      const observacoes = str(body?.observacoes, 1001).trim();
      const autorizado = body?.autorizacao_publicacao === true;
      if (!notaAtendimento || !notaPlataforma || !notaPasseio || !notaRecomendacao || !passeioKey ||
          !avaliacaoPasseio || avaliacaoPasseio.length > 400 || melhoria.length > 1000 ||
          observacoes.length > 1000 || (notaPasseio < 4 && !melhoria) || !autorizado) {
        return json({ ok: false, error: "invalid_input" });
      }

      const invite = await findReviewInvite(token, shortCode);
      if (!invite) return json({ ok: false, error: "invalid_link" });
      if (invite.usado_em) return json({ ok: false, error: "already_submitted" });
      if (!(invite.passeio_keys as string[]).includes(passeioKey)) {
        return json({ ok: false, error: "invalid_tour" });
      }

      const [{ data: reserva }, { data: tour }] = await Promise.all([
        supabase.from("reservas").select("nome,status").eq("id", invite.reserva_id).in("status", ["pendente", "concluida"]).maybeSingle(),
        supabase.from("tours").select("nome_pt").eq("key", passeioKey).maybeSingle(),
      ]);
      if (!reserva || !tour) return json({ ok: false, error: "invalid_link" });

      const now = new Date();
      const expires = new Date(now);
      expires.setUTCMonth(expires.getUTCMonth() + 6);
      const average = Number(((notaAtendimento + notaPlataforma + notaPasseio + notaRecomendacao) / 4).toFixed(2));
      const { data: created, error: insertError } = await supabase
        .from("avaliacoes")
        .insert({
          convite_id: invite.id,
          reserva_id: invite.reserva_id,
          cliente_nome: reserva.nome,
          passeio_key: passeioKey,
          passeio_nome: tour.nome_pt,
          nota_atendimento: notaAtendimento,
          nota_plataforma: notaPlataforma,
          nota_passeio: notaPasseio,
          avaliacao_passeio: avaliacaoPasseio,
          melhoria: melhoria || null,
          nota_recomendacao: notaRecomendacao,
          observacoes: observacoes || null,
          autorizacao_publicacao: true,
          autorizado_em: now.toISOString(),
          avaliado_em: now.toISOString(),
          expira_em: expires.toISOString(),
          media_final: average,
          status_publicacao: notaPasseio >= 4 ? "publicada" : "pendente",
        })
        .select("id")
        .maybeSingle();
      if (insertError) {
        if (insertError.code === "23505" || insertError.message.includes("convite_ja_utilizado")) {
          return json({ ok: false, error: "already_submitted" });
        }
        return json({ ok: false, error: "db_error" }, 500);
      }
      return json({ ok: true, review: { id: created?.id, passeio_nome: tour.nome_pt, media_final: average } });
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (_e) {
    return json({ ok: false, error: "bad_request" }, 400);
  }
});
