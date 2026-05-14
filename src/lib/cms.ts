// ============================================================
// CMS Layer — fonte única de conteúdo administrável (Supabase)
// Hooks com React Query + helpers de mutação e upload de mídia.
// ============================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { forceRefreshCms } from "./cmsCache";
import type { Lang } from "./i18n";

// ----- Types -----
export type CmsTour = {
  id: string;
  key: string;
  nome_pt: string;
  nome_en: string | null;
  nome_es: string | null;
  nome_fr: string | null;
  nome_it: string | null;
  descricao_pt: string | null;
  descricao_en: string | null;
  descricao_es: string | null;
  descricao_fr: string | null;
  descricao_it: string | null;
  preco: number;
  imagem_url: string | null;
  video_url: string | null;
  destaque: boolean;
  ativo: boolean;
  ordem: number;
};

export type CmsHome = {
  id: string;
  secao: string;
  titulo_pt: string | null;
  titulo_en: string | null;
  titulo_es: string | null;
  titulo_fr: string | null;
  titulo_it: string | null;
  subtitulo_pt: string | null;
  subtitulo_en: string | null;
  subtitulo_es: string | null;
  subtitulo_fr: string | null;
  subtitulo_it: string | null;
  cta_texto_pt: string | null;
  cta_link: string | null;
  imagem_url: string | null;
  ativo: boolean;
  ordem: number;
};

export type CmsModal = {
  id: string;
  key: string;
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
  percentual: number;
  codigo: string | null;
  cor_borda: string | null;
  ativo: boolean;
};

export type CmsDepoimento = {
  id: string;
  nome: string;
  texto_pt: string | null;
  texto_en: string | null;
  texto_es: string | null;
  texto_fr: string | null;
  texto_it: string | null;
  avatar_url: string | null;
  nota: number;
  ativo: boolean;
  ordem: number;
};

export type CmsConfig = {
  chave: string;
  valor: string | null;
  valor_jsonb: any;
  descricao: string | null;
};

// ----- i18n helper: pega o campo no idioma com fallback para PT -----
export function pickLang<T extends Record<string, any>>(
  row: T,
  base: "nome" | "descricao" | "titulo" | "subtitulo" | "cta_texto" | "texto",
  lang: Lang
): string {
  return (row[`${base}_${lang}`] ?? row[`${base}_pt`] ?? "") as string;
}

// ============================================================
// QUERIES
// ============================================================
export const useTours = (onlyActive = true) =>
  useQuery({
    queryKey: ["cms", "tours", onlyActive],
    queryFn: async () => {
      let q = supabase.from("tours").select("*").order("ordem", { ascending: true });
      if (onlyActive) q = q.eq("ativo", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as CmsTour[];
    },
  });

export const useHomeContent = () =>
  useQuery({
    queryKey: ["cms", "home"],
    queryFn: async () => {
      const { data, error } = await supabase.from("home_content").select("*").order("ordem");
      if (error) throw error;
      return (data || []) as CmsHome[];
    },
  });

export const useModais = () =>
  useQuery({
    queryKey: ["cms", "modais"],
    queryFn: async () => {
      const { data, error } = await supabase.from("modais").select("*").order("key");
      if (error) throw error;
      return (data || []) as CmsModal[];
    },
  });

export const useDepoimentos = (onlyActive = true) =>
  useQuery({
    queryKey: ["cms", "depoimentos", onlyActive],
    queryFn: async () => {
      let q = supabase.from("depoimentos").select("*").order("ordem");
      if (onlyActive) q = q.eq("ativo", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as CmsDepoimento[];
    },
  });

export const useConfig = () =>
  useQuery({
    queryKey: ["cms", "config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("config_global").select("*");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => { map[r.chave] = r.valor ?? ""; });
      return map;
    },
  });

// ============================================================
// MUTATIONS
// ============================================================
export const useUpsertTour = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: Partial<CmsTour> & { key: string; nome_pt: string }) => {
      const { error } = await supabase.from("tours").upsert(t as any, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["cms", "tours"] });
      await forceRefreshCms.tours();
    },
  });
};

export const useDeleteTour = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tours").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "tours"] }),
  });
};

export const useUpsertHome = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (h: Partial<CmsHome> & { secao: string }) => {
      const { error } = await supabase.from("home_content").upsert(h as any, { onConflict: "secao" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "home"] }),
  });
};

export const useUpsertModal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: Partial<CmsModal> & { key: string }) => {
      const { error } = await supabase.from("modais").upsert(m as any, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["cms", "modais"] });
      await forceRefreshCms.modais();
    },
  });
};

export const useUpsertDepoimento = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Partial<CmsDepoimento> & { nome: string }) => {
      if (d.id) {
        const { error } = await supabase.from("depoimentos").update(d as any).eq("id", d.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("depoimentos").insert(d as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "depoimentos"] }),
  });
};

export const useDeleteDepoimento = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("depoimentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "depoimentos"] }),
  });
};

export const useUpsertConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ chave, valor }: { chave: string; valor: string }) => {
      const { error } = await supabase
        .from("config_global")
        .upsert({ chave, valor } as any, { onConflict: "chave" });
      if (error) throw error;
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["cms", "config"] });
      await forceRefreshCms.config();
    },
  });
};

// ============================================================
// MEDIA UPLOAD
// ============================================================
export async function uploadMedia(
  file: File,
  folder: "tours" | "home" | "modais" | "depoimentos" | "videos" = "tours"
): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteMedia(publicUrl: string): Promise<void> {
  // Extract path after "/media/"
  const idx = publicUrl.indexOf("/media/");
  if (idx === -1) return;
  const path = publicUrl.slice(idx + "/media/".length);
  await supabase.storage.from("media").remove([path]);
}
