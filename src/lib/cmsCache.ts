// ============================================================
// CMS Cache (não-React) — espelho leve do conteúdo administrável
// vindo do Supabase. Usado por módulos sync como prices.ts e
// tours.ts, que não podem usar hooks. Sincroniza no boot e
// escuta mudanças em realtime.
// ============================================================
import { supabase } from "@/integrations/supabase/client";
import type { TourKey } from "./tours";

type TourCache = {
  preco: number | null;
  imagem_url: string | null;
  video_url: string | null;
  nome: Partial<Record<"pt" | "en" | "es" | "fr" | "it", string>>;
  descricao: Partial<Record<"pt" | "en" | "es" | "fr" | "it", string>>;
  ativo: boolean;
  ordem: number;
};

export type ModalCache = {
  key: string;
  percentual: number;
  codigo: string | null;
  regra: any;
  titulo_pt: string | null;
  titulo_en: string | null;
  titulo_es: string | null;
  titulo_fr: string | null;
  titulo_it: string | null;
  mensagem_pt: string | null;
  mensagem_en: string | null;
  mensagem_es: string | null;
  mensagem_fr: string | null;
  mensagem_it: string | null;
  ativo: boolean;
};

const tours: Partial<Record<TourKey, TourCache>> = {};
const config: Record<string, string> = {};
const modais: Record<string, ModalCache> = {};
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const subscribeCmsCache = (cb: () => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};

export const getCachedTour = (key: TourKey): TourCache | undefined => tours[key];
export const getCachedConfig = (chave: string): string | undefined => config[chave];
export const getCachedModal = (key: string): ModalCache | undefined => modais[key];
export const getAllCachedModais = (): ModalCache[] => Object.values(modais);

let booted = false;
export async function bootCmsCache() {
  if (booted) return;
  booted = true;
  await refreshAll();
  // realtime
  supabase
    .channel("cms-cache")
    .on("postgres_changes", { event: "*", schema: "public", table: "tours" }, () => refreshTours())
    .on("postgres_changes", { event: "*", schema: "public", table: "config_global" }, () => refreshConfig())
    .on("postgres_changes", { event: "*", schema: "public", table: "modais" }, () => refreshModais())
    .subscribe();
}

async function refreshAll() {
  await Promise.all([refreshTours(), refreshConfig(), refreshModais()]);
}

// Exposed so mutations can force-refresh as a fallback if realtime is slow.
export const forceRefreshCms = { tours: () => refreshTours(), config: () => refreshConfig(), modais: () => refreshModais() };

async function refreshModais() {
  const { data } = await supabase.from("modais").select("key,percentual,codigo,regra,titulo_pt,titulo_en,titulo_es,titulo_fr,titulo_it,mensagem_pt,mensagem_en,mensagem_es,mensagem_fr,mensagem_it,ativo");
  if (!data) return;
  // clear stale
  for (const k of Object.keys(modais)) delete modais[k];
  for (const r of data as any[]) {
    modais[r.key] = {
      key: r.key,
      percentual: Number(r.percentual) || 0,
      codigo: r.codigo ?? null,
      regra: r.regra ?? null,
      titulo_pt: r.titulo_pt ?? null,
      titulo_en: r.titulo_en ?? null,
      titulo_es: r.titulo_es ?? null,
      titulo_fr: r.titulo_fr ?? null,
      titulo_it: r.titulo_it ?? null,
      mensagem_pt: r.mensagem_pt ?? null,
      mensagem_en: r.mensagem_en ?? null,
      mensagem_es: r.mensagem_es ?? null,
      mensagem_fr: r.mensagem_fr ?? null,
      mensagem_it: r.mensagem_it ?? null,
      ativo: !!r.ativo,
    };
  }
  emit();
}

async function refreshTours() {
  const { data } = await supabase.from("tours").select("*");
  if (!data) return;
  for (const r of data as any[]) {
    tours[r.key as TourKey] = {
      preco: r.preco != null ? Number(r.preco) : null,
      imagem_url: r.imagem_url ?? null,
      nome: { pt: r.nome_pt, en: r.nome_en, es: r.nome_es, fr: r.nome_fr, it: r.nome_it },
      descricao: { pt: r.descricao_pt, en: r.descricao_en, es: r.descricao_es, fr: r.descricao_fr, it: r.descricao_it },
      ativo: !!r.ativo,
      ordem: r.ordem ?? 0,
    };
  }
  emit();
}

async function refreshConfig() {
  const { data } = await supabase.from("config_global").select("chave,valor");
  if (!data) return;
  for (const r of data as any[]) config[r.chave] = r.valor ?? "";
  emit();
}
