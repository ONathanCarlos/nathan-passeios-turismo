import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { BOOKING_TERMS_VERSION, BOOKING_TERMS_TEXT } from "./bookingTermsContent.ts";

export const BOOKING_TERMS_ACTIONS = new Set(["create_reserva_terms", "accept_cms_terms"]);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const knownTours = new Set(["escuna","catamara","buggy","arraial","cabofrio","mergulho","jardineira","lancha","quadriciclo_nas_dunas"]);
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status, headers: {...corsHeaders, "Content-Type":"application/json", "Cache-Control":"no-store"}});
const text = (v: unknown, max = 200) => typeof v === "string" ? v.trim().slice(0,max) : "";
const hash = async (v: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v))), b=>b.toString(16).padStart(2,"0")).join("");
const normalize = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function validTermsConsent(value: unknown): value is {accepted: true; version: string; request_id: string; tour_keys: string[]; language: string; package_key?: string} {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.accepted === true && v.version === BOOKING_TERMS_VERSION && typeof v.request_id === "string" && uuid.test(v.request_id)
    && Array.isArray(v.tour_keys) && v.tour_keys.length > 0 && v.tour_keys.length <= 12
    && v.tour_keys.every(k=>typeof k === "string" && /^[a-z0-9_-]{1,80}$/.test(k))
    && new Set(v.tour_keys).size === v.tour_keys.length
    && typeof v.language === "string" && ["pt","es","en","fr","it"].includes(v.language);
}

export async function handleBookingTermsAction(action: string, body: Record<string, unknown>, db: SupabaseClient): Promise<Response> {
  if (!validTermsConsent(body.terms_acceptance)) return reply({ok:false,error:"terms_required"},400);
  const terms = body.terms_acceptance;
  try {
    const {data: rows, error} = await db.from("tours").select("key,nome_pt,nome_en,nome_es,nome_fr,nome_it").in("key",terms.tour_keys).limit(12);
    if (error) return reply({ok:false,error:"terms_service_unavailable"},503);
    for (const key of terms.tour_keys) {
      const tour = (rows || []).find(row=>row.key === key);
      const lunch = normalize(key) === "almoco" || (tour && [tour.nome_pt,tour.nome_en,tour.nome_es,tour.nome_fr,tour.nome_it].some(n=>/(^|[^a-z])(almoco|lunch|almuerzo|dejeuner|pranzo)([^a-z]|$)/.test(normalize(n||""))));
      if (!knownTours.has(key) && !tour) return reply({ok:false,error:"invalid_tour_selection"},400);
      if (lunch && terms.tour_keys.length === 1) return reply({ok:false,error:"lunch_excluded"},400);
    }
    if (terms.package_key) {
      const {data: pack, error: packError} = await db.from("pacotes").select("tour_keys").eq("key",terms.package_key).eq("ativo",true).maybeSingle();
      if (packError || JSON.stringify(pack?.tour_keys) !== JSON.stringify(terms.tour_keys)) return reply({ok:false,error:"invalid_tour_selection"},400);
    } else if (terms.tour_keys.length !== 1) return reply({ok:false,error:"invalid_tour_selection"},400);

    // A versão é publicada pelo servidor a partir do texto aprovado, nunca pelo navegador.
    const versionHash = await hash(BOOKING_TERMS_TEXT);
    const {error: versionError} = await db.from("booking_terms_versions").upsert({version:BOOKING_TERMS_VERSION,content:BOOKING_TERMS_TEXT,content_sha256:versionHash},{onConflict:"version",ignoreDuplicates:true});
    if (versionError) return reply({ok:false,error:"terms_service_unavailable"},503);
    const {data: version} = await db.from("booking_terms_versions").select("content_sha256").eq("version",BOOKING_TERMS_VERSION).maybeSingle();
    if (version?.content_sha256 !== versionHash) return reply({ok:false,error:"terms_version_mismatch"},409);

    if (action === "accept_cms_terms") {
      const {data, error: saveError} = await db.from("booking_terms_acceptances").upsert({request_id:terms.request_id,version:terms.version,tour_keys:terms.tour_keys,language:terms.language,context:"cms_inquiry"},{onConflict:"request_id,version",ignoreDuplicates:true}).select("id");
      if (saveError) return reply({ok:false,error:"terms_service_unavailable"},503);
      const {data: recorded, error: recordError} = await db.from("booking_terms_acceptances")
        .select("id,tour_keys,language,context").eq("request_id",terms.request_id).eq("version",terms.version).maybeSingle();
      if (recordError || !recorded) return reply({ok:false,error:"terms_service_unavailable"},503);
      if (recorded.context !== "cms_inquiry" || recorded.language !== terms.language || JSON.stringify(recorded.tour_keys) !== JSON.stringify(terms.tour_keys)) {
        return reply({ok:false,error:"terms_retry_mismatch"},409);
      }
      return reply({ok:true, recorded: true, id:data?.[0]?.id || null});
    }
    const nome = text(body.nome), telefone = text(body.telefone,40).replace(/\D/g,""), destino = text(body.destino);
    const date = text(body.data_viagem,10);
    const dateObj = new Date(`${date}T00:00:00Z`);
    const passengers = body.passageiros == null ? null : Number(body.passageiros);
    const amount = (v: unknown) => v == null ? null : Number(v);
    const original = amount(body.valor_original), discounted = amount(body.valor_com_desconto);
    if (!nome || !destino || telefone.length < 7 || telefone.length > 15 || !/^\d{4}-\d{2}-\d{2}$/.test(date)
      || !Number.isFinite(dateObj.getTime()) || dateObj.toISOString().slice(0,10) !== date
      || (passengers !== null && (!Number.isInteger(passengers) || passengers < 1 || passengers > 100))
      || [original,discounted].some(v=>v !== null && (!Number.isFinite(v) || v < 0 || v > 100000000))) return reply({ok:false,error:"invalid_input"},400);
    let voucher = null;
    if (body.voucher_request) {
      const v = body.voucher_request as Record<string,unknown>;
      if (!uuid.test(text(v.request_id,36)) || !/^[a-f0-9]{64}$/i.test(text(v.request_proof,64)) || v.idioma !== terms.language
        || !Number.isInteger(Number(v.total_pessoas)) || Number(v.total_pessoas) < 1 || Number(v.total_pessoas) > 100) return reply({ok:false,error:"invalid_input"},400);
      voucher = {request_id:v.request_id,proof_hash:await hash(`onix-voucher-request-v1:${text(v.request_proof,64).toLowerCase()}`),idioma:v.idioma,total_pessoas:v.total_pessoas};
    }
    const reservation = {nome,telefone,destino,email:text(body.email)||null,data_viagem:date,passageiros:passengers,cupom_aplicado:text(body.cupom_aplicado,60)||null,valor_original:original,valor_com_desconto:discounted};
    const {data: id, error: saveError} = await db.rpc("create_reserva_with_terms",{p_reserva:reservation,p_terms:{...terms,payload_hash:await hash(JSON.stringify(reservation))},p_voucher:voucher});
    if (saveError || !id) return reply({ok:false,error:"reservation_save_failed"},503);
    return reply({ok:true,id,terms_recorded:true});
  } catch {
    return reply({ok:false,error:"terms_service_unavailable"},503);
  }
}
