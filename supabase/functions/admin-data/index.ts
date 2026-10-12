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

const reservationReviewToken = async (reservaId: string) => {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(`review-link:${secret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(reservaId));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const randomShortCode = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
};

const sameKeySet = (left: unknown, right: string[]) => {
  if (!Array.isArray(left) || left.length !== right.length) return false;
  const leftSet = new Set(left.filter((key): key is string => typeof key === "string"));
  return leftSet.size === right.length && right.every((key) => leftSet.has(key));
};

const ensureVerifiedShortCode = async (inviteId: string, reservaId: string, tourKeys: string[]) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: invite, error: inviteError } = await supabase
      .from("convites_avaliacao")
      .select("id,reserva_id,passeio_keys,codigo_curto,usado_em")
      .eq("id", inviteId)
      .maybeSingle();
    if (inviteError || !invite) continue;
    if (invite.usado_em) return { shortCode: null, error: "already_submitted" };
    if (invite.reserva_id !== reservaId || !sameKeySet(invite.passeio_keys, tourKeys)) continue;

    if (invite.codigo_curto && /^[A-Za-z0-9]{10,16}$/.test(invite.codigo_curto)) {
      const { data: currentCode, error: verifyCurrentError } = await supabase
        .from("convites_avaliacao")
        .select("id,reserva_id,passeio_keys,usado_em")
        .eq("codigo_curto", invite.codigo_curto)
        .maybeSingle();
      if (!verifyCurrentError && currentCode?.id === inviteId && currentCode.reserva_id === reservaId &&
          !currentCode.usado_em && sameKeySet(currentCode.passeio_keys, tourKeys)) {
        return { shortCode: invite.codigo_curto, error: null };
      }
    }

    const shortCode = randomShortCode();
    const assignment = invite.codigo_curto
      ? await supabase.from("convites_avaliacao").update({ codigo_curto: shortCode })
          .eq("id", inviteId).eq("codigo_curto", invite.codigo_curto).select("codigo_curto").maybeSingle()
      : await supabase.from("convites_avaliacao").update({ codigo_curto: shortCode })
          .eq("id", inviteId).is("codigo_curto", null).select("codigo_curto").maybeSingle();
    if (assignment.error) {
      if (assignment.error.code !== "23505") console.error("review_short_code_assignment_failed", { code: assignment.error.code });
      continue;
    }
    if (!assignment.data?.codigo_curto) continue;

    const { data: verified, error: verifyError } = await supabase
      .from("convites_avaliacao")
      .select("id,reserva_id,passeio_keys,usado_em")
      .eq("codigo_curto", assignment.data.codigo_curto)
      .maybeSingle();
    if (!verifyError && verified?.id === inviteId && verified.reserva_id === reservaId &&
        !verified.usado_em && sameKeySet(verified.passeio_keys, tourKeys)) {
      return { shortCode: assignment.data.codigo_curto, error: null };
    }
  }
  return { shortCode: null, error: "short_link_create_failed" };
};

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

    if (action === "update_review_status") {
      const id = str(body?.id, 60);
      const statusPublicacao = body?.status_publicacao;
      if (!id || !["publicada", "oculta"].includes(statusPublicacao)) {
        return json({ ok: false, error: "invalid_input" }, 400);
      }
      if (statusPublicacao === "publicada") {
        const { data: candidate, error: candidateError } = await supabase
          .from("avaliacoes").select("nota_passeio,autorizacao_publicacao").eq("id", id).maybeSingle();
        if (candidateError) return json({ ok: false, error: "db_error" }, 500);
        if (!candidate) return json({ ok: false, error: "review_not_found" }, 404);
        if (!candidate.autorizacao_publicacao || Number(candidate.nota_passeio) < 4) {
          return json({ ok: false, error: "rating_below_public_threshold" }, 400);
        }
      }
      const { data, error } = await supabase
        .from("avaliacoes")
        .update({ status_publicacao: statusPublicacao, status_admin: "visualizada" })
        .eq("id", id)
        .select("id,status_publicacao,status_admin")
        .maybeSingle();
      if (error) return json({ ok: false, error: "db_error" }, 500);
      if (!data) return json({ ok: false, error: "review_not_found" }, 404);
      return json({ ok: true, review: data });
    }

    if (action === "get_reserva_review_link") {
      const reservaId = str(body?.id, 60);
      if (!reservaId) return json({ ok: false, error: "invalid_input" }, 400);
      const { data: reserva, error: reservationError } = await supabase
        .from("reservas")
        .select("id,whatsapp_solicitado_em,review_tour_keys")
        .eq("id", reservaId)
        .maybeSingle();
      if (reservationError) {
        console.error("review_link_reservation_lookup_failed", { code: reservationError.code });
        const missingSchema = reservationError.code === "42703" || reservationError.code === "PGRST204";
        return json({ ok: false, error: missingSchema ? "review_schema_not_ready" : "db_error" }, 503);
      }
      if (!reserva) return json({ ok: false, error: "reservation_not_found" });
      if (!reserva.whatsapp_solicitado_em) return json({ ok: false, error: "reservation_not_sent_to_whatsapp" });
      const requestedKeys = Array.isArray(reserva.review_tour_keys)
        ? Array.from(new Set(reserva.review_tour_keys.filter((key: unknown): key is string => typeof key === "string" && key !== "almoco")))
        : [];
      if (requestedKeys.length === 0) return json({ ok: false, error: "no_reviewable_tours" });

      let tourLookup = await supabase.from("tours").select("key").in("key", requestedKeys);
      for (let attempt = 1; tourLookup.error && attempt < 3; attempt += 1) {
        console.error("review_link_tour_lookup_retry", { attempt, code: tourLookup.error.code });
        tourLookup = await supabase.from("tours").select("key").in("key", requestedKeys);
      }
      if (tourLookup.error) {
        console.error("review_link_tour_lookup_failed", { code: tourLookup.error.code });
        return json({ ok: false, error: "tour_lookup_failed" }, 503);
      }
      const validKeys = new Set((tourLookup.data || []).map((tour) => tour.key));
      const passeioKeys = requestedKeys.filter((key) => validKeys.has(key));
      if (passeioKeys.length === 0) return json({ ok: false, error: "no_reviewable_tours" });

      let inviteLookup = await supabase.from("convites_avaliacao")
        .select("id,usado_em,codigo_curto,passeio_keys").eq("reserva_id", reservaId).maybeSingle();
      for (let attempt = 1; inviteLookup.error && attempt < 3; attempt += 1) {
        console.error("review_invite_lookup_retry", { attempt, code: inviteLookup.error.code });
        inviteLookup = await supabase.from("convites_avaliacao")
          .select("id,usado_em,codigo_curto,passeio_keys").eq("reserva_id", reservaId).maybeSingle();
      }
      if (inviteLookup.error) {
        console.error("review_invite_lookup_failed", { code: inviteLookup.error.code });
        return json({ ok: false, error: "invite_lookup_failed" }, 503);
      }
      const existingInvite = inviteLookup.data;
      if (existingInvite?.usado_em) return json({ ok: false, error: "already_submitted" });

      let inviteId = existingInvite?.id || null;
      if (!inviteId) {
        const reviewToken = await reservationReviewToken(reservaId);
        const tokenHash = await sha256(reviewToken);
        for (let attempt = 1; !inviteId && attempt <= 3; attempt += 1) {
          const { data: createdInvite, error: inviteError } = await supabase
            .from("convites_avaliacao")
            .insert({ reserva_id: reservaId, token_hash: tokenHash, passeio_keys: passeioKeys })
            .select("id")
            .maybeSingle();
          if (createdInvite?.id) {
            inviteId = createdInvite.id;
            break;
          }
          if (inviteError && inviteError.code !== "23505") {
            console.error("review_invite_create_retry", { attempt, code: inviteError.code });
          }
          const { data: concurrentInvite, error: concurrentError } = await supabase
            .from("convites_avaliacao").select("id,usado_em").eq("reserva_id", reservaId).maybeSingle();
          if (concurrentError) {
            console.error("review_invite_recovery_retry", { attempt, code: concurrentError.code });
            continue;
          }
          if (concurrentInvite?.usado_em) return json({ ok: false, error: "already_submitted" });
          inviteId = concurrentInvite?.id || null;
        }
      }
      if (!inviteId) return json({ ok: false, error: "invite_create_failed" }, 503);

      let currentInviteLookup = await supabase.from("convites_avaliacao")
        .select("id,usado_em,passeio_keys").eq("id", inviteId).maybeSingle();
      for (let attempt = 1; currentInviteLookup.error && attempt < 3; attempt += 1) {
        console.error("review_invite_recheck_retry", { attempt, code: currentInviteLookup.error.code });
        currentInviteLookup = await supabase.from("convites_avaliacao")
          .select("id,usado_em,passeio_keys").eq("id", inviteId).maybeSingle();
      }
      const currentInvite = currentInviteLookup.data;
      if (currentInviteLookup.error || !currentInvite) {
        console.error("review_invite_recheck_failed", { code: currentInviteLookup.error?.code || "not_found" });
        return json({ ok: false, error: "invite_lookup_failed" }, 503);
      }
      if (currentInvite.usado_em) return json({ ok: false, error: "already_submitted" });
      if (!sameKeySet(currentInvite.passeio_keys, passeioKeys)) {
        let updateKeysError: { code: string } | null = null;
        for (let attempt = 1; attempt <= 3; attempt += 1) {
          const result = await supabase.from("convites_avaliacao")
            .update({ passeio_keys: passeioKeys }).eq("id", inviteId).is("usado_em", null);
          updateKeysError = result.error;
          if (!updateKeysError) break;
          console.error("review_invite_tour_snapshot_update_retry", { attempt, code: updateKeysError.code });
        }
        if (updateKeysError) {
          console.error("review_invite_tour_snapshot_update_failed", { code: updateKeysError.code });
          return json({ ok: false, error: "invite_update_failed" }, 503);
        }
      }

      const verifiedLink = await ensureVerifiedShortCode(inviteId, reservaId, passeioKeys);
      if (!verifiedLink.shortCode) return json({ ok: false, error: verifiedLink.error || "short_link_create_failed" }, 503);
      return json({ ok: true, short_code: verifiedLink.shortCode });
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
    if (action === "cms_list") {
      const table = str(body?.table, 40);
      if (!CMS_TABLES.has(table)) return json({ ok: false, error: "invalid_table" }, 400);
      const { data, error } = await supabase.from(table).select("*");
      if (error) return json({ ok: false, error: "db_error" }, 500);
      return json({ ok: true, rows: data || [] });
    }

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
