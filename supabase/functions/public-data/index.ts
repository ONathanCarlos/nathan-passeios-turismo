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

const REVIEWABLE_PSEUDO_KEYS = new Set(["almoco"]);
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

const randomToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const resolveReservationTours = async (destino: string) => {
  const { data: tours } = await supabase
    .from("tours")
    .select("key,nome_pt,nome_en,nome_es,nome_fr,nome_it");
  const tourRows = tours || [];
  const directTour = tourRows.find((tour) =>
    [tour.nome_pt, tour.nome_en, tour.nome_es, tour.nome_fr, tour.nome_it].some((name) => name === destino)
  );
  if (directTour) return [{ key: directTour.key, nome: directTour.nome_pt }];

  const { data: packages } = await supabase
    .from("pacotes")
    .select("tour_keys,nome_pt,nome_en,nome_es,nome_fr,nome_it");
  const packageRow = (packages || []).find((item) =>
    [item.nome_pt, item.nome_en, item.nome_es, item.nome_fr, item.nome_it].some((name) => name === destino)
  );
  if (!packageRow) return [];

  const uniqueKeys = Array.from(new Set((packageRow.tour_keys || []) as string[]))
    .filter((key) => !REVIEWABLE_PSEUDO_KEYS.has(key));
  return uniqueKeys.flatMap((key) => {
    const tour = tourRows.find((item) => item.key === key);
    return tour ? [{ key, nome: tour.nome_pt }] : [];
  });
};

const createReviewInvite = async (reservaId: string, destino: string) => {
  const allowedTours = await resolveReservationTours(destino);
  if (allowedTours.length === 0) return { token: null, error: null };
  const reviewToken = randomToken();
  const { error } = await supabase.from("convites_avaliacao").insert({
    reserva_id: reservaId,
    token_hash: await sha256(reviewToken),
    passeio_keys: allowedTours.map((tour) => tour.key),
  });
  return { token: error ? null : reviewToken, error };
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
        .select("id,destino")
        .maybeSingle();
      if (error) return json({ ok: false, error: "db_error" }, 500);
      if (!data || status !== "concluida") return json({ ok: true, id: data?.id ?? null });
      const invite = await createReviewInvite(data.id, data.destino);
      if (invite.error && invite.error.code !== "23505") return json({ ok: false, error: "review_invite_error" }, 500);
      return json({ ok: true, id: data.id, review_token: invite.token });
    }

    // Marca uma reserva PENDENTE como concluída (transição única e segura).
    if (action === "complete_reserva") {
      const id = str(body?.id, 60);
      if (!id) return json({ ok: false, error: "invalid_input" }, 400);
      const { data: reserva, error } = await supabase
        .from("reservas")
        .update({ status: "concluida" })
        .eq("id", id)
        .eq("status", "pendente")
        .select("id,destino")
        .maybeSingle();
      if (error) return json({ ok: false, error: "db_error" }, 500);
      if (!reserva) return json({ ok: true });

      const invite = await createReviewInvite(reserva.id, reserva.destino);
      const inviteError = invite.error;
      if (inviteError && inviteError.code !== "23505") {
        return json({ ok: false, error: "review_invite_error" }, 500);
      }
      return json({ ok: true, review_token: invite.token });
    }

    // -------------------- AVALIAÇÕES --------------------
    if (action === "get_review_context") {
      const token = str(body?.token, 128).trim();
      if (!/^[a-f0-9]{64}$/.test(token)) return json({ ok: false, error: "invalid_link" }, 404);

      const { data: invite } = await supabase
        .from("convites_avaliacao")
        .select("id,reserva_id,passeio_keys,usado_em")
        .eq("token_hash", await sha256(token))
        .maybeSingle();
      if (!invite) return json({ ok: false, error: "invalid_link" }, 404);
      if (invite.usado_em) return json({ ok: false, error: "already_submitted" }, 409);

      const { data: reserva } = await supabase
        .from("reservas")
        .select("nome,destino,status,data_viagem")
        .eq("id", invite.reserva_id)
        .eq("status", "concluida")
        .maybeSingle();
      if (!reserva) return json({ ok: false, error: "invalid_link" }, 404);

      const { data: tours } = await supabase
        .from("tours")
        .select("key,nome_pt")
        .in("key", invite.passeio_keys);
      const byKey = new Map((tours || []).map((tour) => [tour.key, tour.nome_pt]));
      const allowedTours = (invite.passeio_keys as string[]).flatMap((key) => {
        const nome = byKey.get(key);
        return nome ? [{ key, nome }] : [];
      });
      if (allowedTours.length === 0) return json({ ok: false, error: "invalid_link" }, 404);

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
      if (!/^[a-f0-9]{64}$/.test(token)) return json({ ok: false, error: "invalid_link" }, 404);
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
        return json({ ok: false, error: "invalid_input" }, 400);
      }

      const { data: invite } = await supabase
        .from("convites_avaliacao")
        .select("id,reserva_id,passeio_keys,usado_em")
        .eq("token_hash", await sha256(token))
        .maybeSingle();
      if (!invite) return json({ ok: false, error: "invalid_link" }, 404);
      if (invite.usado_em) return json({ ok: false, error: "already_submitted" }, 409);
      if (!(invite.passeio_keys as string[]).includes(passeioKey)) {
        return json({ ok: false, error: "invalid_tour" }, 400);
      }

      const [{ data: reserva }, { data: tour }] = await Promise.all([
        supabase.from("reservas").select("nome,status").eq("id", invite.reserva_id).eq("status", "concluida").maybeSingle(),
        supabase.from("tours").select("nome_pt").eq("key", passeioKey).maybeSingle(),
      ]);
      if (!reserva || !tour) return json({ ok: false, error: "invalid_link" }, 404);

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
        })
        .select("id")
        .maybeSingle();
      if (insertError) {
        if (insertError.code === "23505" || insertError.message.includes("convite_ja_utilizado")) {
          return json({ ok: false, error: "already_submitted" }, 409);
        }
        return json({ ok: false, error: "db_error" }, 500);
      }
      await supabase.from("convites_avaliacao").update({ usado_em: now.toISOString() }).eq("id", invite.id).is("usado_em", null);
      return json({ ok: true, review: { id: created?.id, passeio_nome: tour.nome_pt, media_final: average } });
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (_e) {
    return json({ ok: false, error: "bad_request" }, 400);
  }
});
