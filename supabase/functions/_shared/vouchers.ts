import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

const enc = new TextEncoder();
const OFFICIAL_ORIGIN = "https://onixturismobuzios.com.br";
const TOKEN_RE = /^[a-f0-9]{64}$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const VOUCHER_ACTIONS = new Set([
  "create_reserva_voucher",
  "issue_reserva_vouchers",
  "save_voucher_message",
  "get_voucher",
]);

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    ...corsHeaders,
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    "Pragma": "no-cache",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  },
});

const str = (value: unknown, max = 500): string => typeof value === "string" ? value.trim().slice(0, max) : "";
const onlyDigits = (value: unknown): string => str(value, 80).replace(/\D/g, "");
const isLang = (value: unknown): value is "pt" | "es" | "en" | "fr" | "it" =>
  value === "pt" || value === "es" || value === "en" || value === "fr" || value === "it";

const sha256 = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const base64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

const encryptMessage = async (message: string): Promise<{ ciphertext: string; iv: string }> => {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!serviceKey) throw new Error("voucher_encryption_unavailable");
  // A chave derivada nunca deixa a Edge Function; a mensagem guardada contém
  // o link-bearer, por isso o snapshot é cifrado mesmo na tabela privada.
  const seed = await crypto.subtle.digest(
    "SHA-256",
    enc.encode(`onix-voucher-message-v1:${serviceKey}`),
  );
  const key = await crypto.subtle.importKey("raw", seed, { name: "AES-GCM" }, false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(message));
  return { ciphertext: base64(new Uint8Array(cipher)), iv: base64(iv) };
};

const builtInNames: Record<string, Record<string, string>> = {
  escuna: { pt: "Passeio de Escuna em Búzios", es: "Paseo en Goleta en Búzios", en: "Schooner Tour in Búzios", fr: "Excursion en goélette à Búzios", it: "Tour in goletta a Búzios" },
  arraial: { pt: "Passeio em Arraial do Cabo", es: "Paseo en Arraial do Cabo", en: "Arraial do Cabo Tour", fr: "Excursion à Arraial do Cabo", it: "Tour ad Arraial do Cabo" },
  buggy: { pt: "Passeio de Buggy", es: "Paseo en Buggy", en: "Buggy Tour", fr: "Excursion en Buggy", it: "Tour in Buggy" },
  cabofrio: { pt: "Passeio em Cabo Frio", es: "Paseo en Cabo Frio", en: "Cabo Frio Tour", fr: "Excursion à Cabo Frio", it: "Tour a Cabo Frio" },
  jardineira: { pt: "Passeio de Jardineira", es: "Paseo en Jardinera", en: "Open-Bus Tour", fr: "Excursion en bus découvert", it: "Tour in bus aperto" },
  catamara: { pt: "Passeio de Catamarã", es: "Paseo en Catamarán", en: "Catamaran Tour", fr: "Excursion en catamaran", it: "Tour in catamarano" },
  mergulho: { pt: "Mergulho no Parque dos Corais", es: "Buceo en el Parque de los Corales", en: "Diving at Coral Park", fr: "Plongée au Parc des Coraux", it: "Immersione al Parco dei Coralli" },
  lancha: { pt: "Lancha Privada", es: "Lancha Privada", en: "Private Speedboat", fr: "Bateau privé", it: "Motoscafo privato" },
  almoco: { pt: "Almoço", es: "Almuerzo", en: "Lunch", fr: "Déjeuner", it: "Pranzo" },
  quadriciclo_nas_dunas: { pt: "Quadriciclo nas Dunas", es: "Cuatrimoto en las Dunas", en: "ATV Ride on the Dunes", fr: "Quad dans les dunes", it: "Quad sulle dune" },
};
const ART_KEYS = new Set(["escuna", "arraial", "buggy", "cabofrio", "catamara", "mergulho", "quadriciclo_nas_dunas"]);
const KNOWN_KEYS = new Set(Object.keys(builtInNames));
const templateKeyFor = (tourKey: string): string | null => {
  const normalized = tourKey.toLowerCase().replace(/-/g, "_");
  return ART_KEYS.has(normalized) ? normalized : null;
};

const scheduleFor = (key: string, lang: "pt" | "es" | "en" | "fr" | "it") => {
  if (key === "escuna") return "11:00h";
  if (key === "arraial" || key === "cabofrio") {
    const prefix = { pt: "A partir das", es: "A partir de las", en: "From", fr: "À partir de", it: "Dalle" }[lang];
    return `${prefix} 8:30h*`;
  }
  return { pt: "A confirmar", es: "A confirmar", en: "To be confirmed", fr: "À confirmer", it: "Da confermare" }[lang];
};

const localizedLabels = (lang: "pt" | "es" | "en" | "fr" | "it") => ({
  reservation: {
    pt: "Código geral da reserva", es: "Código general de la reserva", en: "Booking reference", fr: "Code général de réservation", it: "Codice generale della prenotazione",
  }[lang],
  items: {
    pt: "Identificadores dos passeios", es: "Identificadores de los paseos", en: "Tour references", fr: "Références des excursions", it: "Codici dei tour",
  }[lang],
  link: {
    pt: "Vouchers seguros", es: "Vouchers seguros", en: "Secure vouchers", fr: "Vouchers sécurisés", it: "Voucher sicuri",
  }[lang],
  instructions: {
    pt: "Acesse o link para visualizar, baixar, compartilhar ou imprimir seus vouchers.",
    es: "Abre el enlace para ver, descargar, compartir o imprimir tus vouchers.",
    en: "Open the link to view, download, share or print your vouchers.",
    fr: "Ouvrez le lien pour consulter, télécharger, partager ou imprimer vos vouchers.",
    it: "Apri il link per visualizzare, scaricare, condividere o stampare i voucher.",
  }[lang],
});

const makeProofHash = async (proof: string) => await sha256(`onix-voucher-request-v1:${proof}`);
const errorCode = (error: unknown) => typeof error === "object" && error !== null && "code" in error ? String((error as { code: unknown }).code) : "unknown";

interface CmsTourNames {
  key: string;
  nome_pt: string | null;
  nome_es: string | null;
  nome_en: string | null;
  nome_fr: string | null;
  nome_it: string | null;
}

interface IssuedVoucherItem {
  order: number;
  tour_key: string;
  code: string;
  name: string;
  date: string;
  schedule: string;
  template_key: string | null;
}

const validateTourKeys = async (
  supabase: SupabaseClient,
  body: Record<string, unknown>,
): Promise<{ keys: string[]; packageKey: string | null; cmsTours: Map<string, CmsTourNames> } | null> => {
  const keysRaw = body.tour_keys;
  if (!Array.isArray(keysRaw) || keysRaw.length < 1 || keysRaw.length > 12) return null;
  const keys = keysRaw.map((key) => str(key, 80).toLowerCase());
  if (keys.some((key) => !/^[a-z0-9_-]{1,80}$/.test(key)) || new Set(keys).size !== keys.length) return null;

  const packageKey = str(body.package_key, 120) || null;
  if (packageKey) {
    const { data: pack, error } = await supabase.from("pacotes").select("tour_keys").eq("key", packageKey).eq("ativo", true).maybeSingle();
    if (error || !pack || !Array.isArray(pack.tour_keys)) return null;
    const canonical = pack.tour_keys.map((key: unknown) => String(key).toLowerCase());
    if (canonical.length !== keys.length || canonical.some((key: string, index: number) => key !== keys[index])) return null;
  } else if (keys.length !== 1) {
    return null;
  }

  const { data: rows, error } = await supabase
    .from("tours")
    .select("key,nome_pt,nome_es,nome_en,nome_fr,nome_it")
    .in("key", keys);
  if (error) return null;
  const cmsTours = new Map<string, CmsTourNames>((rows || []).map((row: CmsTourNames) => [String(row.key).toLowerCase(), row]));
  for (const key of keys) if (!KNOWN_KEYS.has(key) && !cmsTours.has(key)) return null;
  if (!packageKey && !KNOWN_KEYS.has(keys[0]) && !cmsTours.has(keys[0])) return null;
  return { keys, packageKey, cmsTours };
};

const localizedTourName = (key: string, lang: "pt" | "es" | "en" | "fr" | "it", cmsTours: Map<string, CmsTourNames>) => {
  const cms = cmsTours.get(key);
  const cmsName = cms?.[`nome_${lang}`] || cms?.nome_pt;
  return str(cmsName, 200) || builtInNames[key]?.[lang] || builtInNames[key]?.pt || key;
};

export const handleVoucherAction = async (action: string, body: Record<string, unknown>, supabase: SupabaseClient): Promise<Response> => {
  try {
    if (action === "create_reserva_voucher") {
      const nome = str(body.nome, 200);
      const telefone = onlyDigits(body.telefone);
      const destino = str(body.destino, 200);
      const date = str(body.data_viagem, 10);
      const requestId = str(body.request_id, 36);
      const proof = str(body.request_proof, 64).toLowerCase();
      const lang = body.idioma;
      const totalPeople = Number(body.total_pessoas);
      const parsedDate = new Date(`${date}T00:00:00.000Z`);
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
        && Number.isFinite(parsedDate.getTime())
        && parsedDate.toISOString().slice(0, 10) === date;
      const passengers = body.passageiros == null ? null : Number(body.passageiros);
      const originalAmount = body.valor_original == null ? null : Number(body.valor_original);
      const discountedAmount = body.valor_com_desconto == null ? null : Number(body.valor_com_desconto);
      const validOptionalAmount = (value: number | null) => value === null || (Number.isFinite(value) && value >= 0 && value <= 100_000_000);
      if (!nome || !telefone || telefone.length < 7 || telefone.length > 15 || !destino || !validDate
        || !UUID_RE.test(requestId) || !TOKEN_RE.test(proof) || !isLang(lang)
        || (passengers !== null && (!Number.isInteger(passengers) || passengers < 1 || passengers > 100))
        || !validOptionalAmount(originalAmount) || !validOptionalAmount(discountedAmount)
        || !Number.isInteger(totalPeople) || totalPeople < 1 || totalPeople > 100) {
        return json({ ok: false, error: "invalid_input" }, 400);
      }
      const { data, error } = await supabase.rpc("create_reserva_voucher_request", {
        p_request_id: requestId,
        p_proof_hash: await makeProofHash(proof),
        p_nome: nome,
        p_telefone: telefone,
        p_email: str(body.email, 200) || null,
        p_destino: destino,
        p_data_viagem: date,
        p_passageiros: passengers,
        p_cupom_aplicado: str(body.cupom_aplicado, 60) || null,
        p_valor_original: originalAmount,
        p_valor_com_desconto: discountedAmount,
        p_idioma: lang,
        p_total_pessoas: totalPeople,
      });
      if (error || !data) {
        console.error("create_reserva_voucher_failed", { code: errorCode(error) });
        return json({ ok: false, error: "reservation_save_failed" }, 500);
      }
      return json({ ok: true, id: data });
    }

    if (action === "issue_reserva_vouchers") {
      const reservationId = str(body.reservation_id, 36);
      const requestId = str(body.request_id, 36);
      const proof = str(body.request_proof, 64).toLowerCase();
      const token = str(body.access_token, 64).toLowerCase();
      const lang = body.idioma;
      const totalPeople = Number(body.total_pessoas);
      const baseMessage = str(body.message_base, 12000);
      if (!UUID_RE.test(reservationId) || !UUID_RE.test(requestId) || !TOKEN_RE.test(proof)
        || !TOKEN_RE.test(token) || !isLang(lang) || !Number.isInteger(totalPeople)
        || totalPeople < 1 || totalPeople > 100 || !baseMessage) {
        return json({ ok: false, error: "invalid_input" }, 400);
      }
      const proofHash = await makeProofHash(proof);
      const { data: issuance, error: issueLookupError } = await supabase
        .from("reserva_voucher_emissoes")
        .select("id,reserva_id,request_id,request_proof_hash,request_expires_at,status")
        .eq("reserva_id", reservationId)
        .eq("request_id", requestId)
        .eq("request_proof_hash", proofHash)
        .maybeSingle();
      if (issueLookupError || !issuance || new Date(issuance.request_expires_at).getTime() <= Date.now()) {
        return json({ ok: false, error: "voucher_request_invalid" }, 403);
      }
      const { data: reservation, error: reservationError } = await supabase
        .from("reservas")
        .select("id,nome,data_viagem")
        .eq("id", reservationId)
        .maybeSingle();
      if (reservationError || !reservation || !reservation.data_viagem) return json({ ok: false, error: "reservation_not_found" }, 404);

      const validated = await validateTourKeys(supabase, body);
      if (!validated) return json({ ok: false, error: "invalid_tour_selection" }, 400);
      const items = validated.keys.map((key, index) => ({
        tour_key: key,
        nome_snapshot: localizedTourName(key, lang, validated.cmsTours),
        data_viagem: reservation.data_viagem,
        horario_snapshot: scheduleFor(key, lang),
        template_key: templateKeyFor(key),
        order: index + 1,
      }));

      const { data: issued, error: issueError } = await supabase.rpc("issue_reserva_vouchers", {
        p_reserva_id: reservationId,
        p_request_id: requestId,
        p_proof_hash: proofHash,
        p_access_token_hash: await sha256(token),
        p_idioma: lang,
        p_total_pessoas: totalPeople,
        p_items: items,
      });
      const issuedItems = (issued as { items?: IssuedVoucherItem[] } | null)?.items;
      const reservationCode = (issued as { reservation_code?: string } | null)?.reservation_code;
      if (issueError || !reservationCode || !Array.isArray(issuedItems)) {
        console.error("issue_reserva_vouchers_failed", { code: errorCode(issueError) });
        return json({ ok: false, error: "voucher_issue_failed" }, 500);
      }

      const publicUrl = `${OFFICIAL_ORIGIN}/vouchers#token=${token}`;
      const labels = localizedLabels(lang);
      const messageLines = [
        baseMessage,
        "",
        `🎟 ${labels.reservation}: ${reservationCode}`,
        labels.items + ":",
        ...issuedItems.map((item) => `• ${str(item.name, 200)}: ${str(item.code, 120)}`),
        `🔐 ${labels.link}: ${publicUrl}`,
        labels.instructions,
      ];
      const finalMessage = messageLines.join("\n");
      const encrypted = await encryptMessage(finalMessage);
      const { data: stored, error: saveError } = await supabase.rpc("save_reserva_voucher_message", {
        p_reserva_id: reservationId,
        p_request_id: requestId,
        p_proof_hash: proofHash,
        p_ciphertext: encrypted.ciphertext,
        p_iv: encrypted.iv,
      });
      if (saveError || stored !== true) {
        console.error("voucher_message_snapshot_failed", { code: errorCode(saveError) });
        return json({ ok: false, error: "voucher_snapshot_failed" }, 500);
      }
      return json({
        ok: true,
        message: finalMessage,
        reservation_code: reservationCode,
        voucher_url: publicUrl,
        items: issuedItems,
      });
    }

    if (action === "save_voucher_message") {
      const reservationId = str(body.reservation_id, 36);
      const requestId = str(body.request_id, 36);
      const proof = str(body.request_proof, 64).toLowerCase();
      const message = str(body.message, 12000);
      if (!UUID_RE.test(reservationId) || !UUID_RE.test(requestId) || !TOKEN_RE.test(proof) || !message) {
        return json({ ok: false, error: "invalid_input" }, 400);
      }
      const proofHash = await makeProofHash(proof);
      const encrypted = await encryptMessage(message);
      const { data, error } = await supabase.rpc("save_reserva_voucher_message", {
        p_reserva_id: reservationId,
        p_request_id: requestId,
        p_proof_hash: proofHash,
        p_ciphertext: encrypted.ciphertext,
        p_iv: encrypted.iv,
      });
      if (error || data !== true) return json({ ok: false, error: "voucher_message_save_failed" }, 403);
      return json({ ok: true });
    }

    if (action === "get_voucher") {
      const token = str(body.access_token, 64).toLowerCase();
      if (!TOKEN_RE.test(token)) return json({ ok: false, error: "not_found" }, 404);
      const tokenHash = await sha256(token);
      const { data: access, error: accessError } = await supabase
        .from("reserva_voucher_acessos")
        .select("emissao_id")
        .eq("token_hash", tokenHash)
        .is("revogado_em", null)
        .maybeSingle();
      if (accessError || !access) return json({ ok: false, error: "not_found" }, 404);
      const { data: issuance, error } = await supabase
        .from("reserva_voucher_emissoes")
        .select("id,codigo_reserva,idioma,total_pessoas,reserva_id")
        .eq("id", access.emissao_id)
        .eq("status", "issued")
        .maybeSingle();
      if (error || !issuance) return json({ ok: false, error: "not_found" }, 404);

      const [{ data: reservation, error: reservationError }, { data: items, error: itemsError }] = await Promise.all([
        supabase.from("reservas").select("nome,data_viagem").eq("id", issuance.reserva_id).maybeSingle(),
        supabase.from("reserva_passeios")
          .select("ordem,tour_key,codigo_passeio,nome_snapshot,data_viagem,horario_snapshot,template_key")
          .eq("emissao_id", issuance.id).order("ordem", { ascending: true }),
      ]);
      if (reservationError || itemsError || !reservation || !Array.isArray(items) || items.length === 0) {
        return json({ ok: false, error: "not_found" }, 404);
      }
      return json({
        ok: true,
        voucher: {
          reservation_code: issuance.codigo_reserva,
          language: issuance.idioma,
          passenger_name: reservation.nome,
          travel_date: reservation.data_viagem,
          total_people: issuance.total_pessoas,
          items: items.map((item: { ordem: number; tour_key: string; codigo_passeio: string; nome_snapshot: string; data_viagem: string; horario_snapshot: string; template_key: string | null }) => ({
            order: item.ordem,
            tour_key: item.tour_key,
            code: item.codigo_passeio,
            name: item.nome_snapshot,
            date: item.data_viagem,
            schedule: item.horario_snapshot,
            template_key: item.template_key,
          })),
        },
      });
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (error) {
    console.error("voucher_action_failed", { code: errorCode(error) });
    return json({ ok: false, error: "voucher_service_error" }, 500);
  }
};
