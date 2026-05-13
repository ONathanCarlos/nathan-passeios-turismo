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
  nome: Partial<Record<"pt" | "en" | "es" | "fr" | "it", string>>;
  descricao: Partial<Record<"pt" | "en" | "es" | "fr" | "it", string>>;
  ativo: boolean;
  ordem: number;
};

const tours: Partial<Record<TourKey, TourCache>> = {};
const config: Record<string, string> = {};
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const subscribeCmsCache = (cb: () => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};

export const getCachedTour = (key: TourKey): TourCache | undefined => tours[key];
export const getCachedConfig = (chave: string): string | undefined => config[chave];

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
    .subscribe();
}

async function refreshAll() {
  await Promise.all([refreshTours(), refreshConfig()]);
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
