// ============================================================
// Pacotes promocionais — combos de passeios com preço reduzido.
// Cupons NÃO se aplicam aqui (já têm desconto embutido).
// ============================================================
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Lang } from "./i18n";

export type Pacote = {
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
  preco_original: number | null;
  tour_keys: string[];
  imagem_url: string | null;
  video_url: string | null;
  destaque: boolean;
  ativo: boolean;
  ordem: number;
  info_adicional: string | null;
  observacoes: string | null;
  badge: string | null;
  urgencia: string | null;
};

const db = () => supabase.from("pacotes" as any);

export const pickPacoteLang = (
  p: Pacote,
  base: "nome" | "descricao",
  lang: Lang,
): string => (p as any)[`${base}_${lang}`] ?? (p as any)[`${base}_pt`] ?? "";

export const usePacotes = (onlyActive = true) =>
  useQuery({
    queryKey: ["pacotes", onlyActive],
    queryFn: async () => {
      let q = db().select("*").order("ordem", { ascending: true });
      if (onlyActive) q = q.eq("ativo", true);
      const { data, error } = await q;
      if (error) throw error;
      return ((data as unknown) as Pacote[]) || [];
    },
  });

export const usePacote = (key: string | undefined) =>
  useQuery({
    enabled: !!key,
    queryKey: ["pacotes", "one", key],
    queryFn: async () => {
      const { data, error } = await db().select("*").eq("key", key as string).maybeSingle();
      if (error) throw error;
      return data as unknown as Pacote | null;
    },
  });

export const useUpsertPacote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Partial<Pacote> & { key: string; nome_pt: string }) => {
      const { error } = await db().upsert(p as any, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pacotes"] }),
  });
};

export const useDeletePacote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db().delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pacotes"] }),
  });
};
