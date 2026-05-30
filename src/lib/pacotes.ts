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

const DEFAULT_PACOTES: Pacote[] = [
  {
    id: "buzios_paradise",
    key: "buzios_paradise",
    nome_pt: "Pacote Búzios Paradise",
    nome_en: "Búzios Paradise Package",
    nome_es: "Paquete Búzios Paradise",
    nome_fr: "Forfait Búzios Paradise",
    nome_it: "Pacchetto Búzios Paradise",
    descricao_pt: "Passeio de Escuna + Buggy Off-Road + Almoço",
    descricao_en: "Schooner Tour + Off-Road Buggy + Lunch",
    descricao_es: "Paseo en Goleta + Buggy Off-Road + Almuerzo",
    descricao_fr: "Tour en Goélette + Buggy Tout-Terrain + Déjeuner",
    descricao_it: "Tour in Goletta + Buggy Off-Road + Pranzo",
    preco: 205,
    preco_original: null,
    tour_keys: ["escuna", "buggy", "almoco"],
    imagem_url: null,
    video_url: null,
    destaque: false,
    ativo: true,
    ordem: 1,
    info_adicional: null,
    observacoes: null,
    badge: null,
    urgencia: null,
  },
  {
    id: "mar_terra",
    key: "mar_terra",
    nome_pt: "Pacote Mar & Terra",
    nome_en: "Sea & Land Package",
    nome_es: "Paquete Mar y Tierra",
    nome_fr: "Forfait Mer & Terre",
    nome_it: "Pacchetto Mare & Terra",
    descricao_pt: "Passeio de Escuna + Buggy Off-Road",
    descricao_en: "Schooner Tour + Off-Road Buggy",
    descricao_es: "Paseo en Goleta + Buggy Off-Road",
    descricao_fr: "Tour en Goélette + Buggy Tout-Terrain",
    descricao_it: "Tour in Goletta + Buggy Off-Road",
    preco: 160,
    preco_original: null,
    tour_keys: ["escuna", "buggy"],
    imagem_url: null,
    video_url: null,
    destaque: false,
    ativo: true,
    ordem: 2,
    info_adicional: null,
    observacoes: null,
    badge: null,
    urgencia: null,
  },
  {
    id: "buggy_food",
    key: "buggy_food",
    nome_pt: "Pacote Buggy & Food",
    nome_en: "Buggy & Food Package",
    nome_es: "Paquete Buggy & Food",
    nome_fr: "Forfait Buggy & Food",
    nome_it: "Pacchetto Buggy & Food",
    descricao_pt: "Buggy Off-Road + Almoço",
    descricao_en: "Off-Road Buggy + Lunch",
    descricao_es: "Buggy Off-Road + Almuerzo",
    descricao_fr: "Buggy Tout-Terrain + Déjeuner",
    descricao_it: "Buggy Off-Road + Pranzo",
    preco: 150,
    preco_original: null,
    tour_keys: ["buggy", "almoco"],
    imagem_url: null,
    video_url: null,
    destaque: false,
    ativo: true,
    ordem: 3,
    info_adicional: null,
    observacoes: null,
    badge: null,
    urgencia: null,
  },
  {
    id: "perfeicao_buzios",
    key: "perfeicao_buzios",
    nome_pt: "Pacote Perfeição de Búzios",
    nome_en: "Perfect Búzios Package",
    nome_es: "Paquete Perfección de Búzios",
    nome_fr: "Forfait Perfection de Búzios",
    nome_it: "Pacchetto Perfezione di Búzios",
    descricao_pt: "Passeio de Escuna + Almoço",
    descricao_en: "Schooner Tour + Lunch",
    descricao_es: "Paseo en Goleta + Almuerzo",
    descricao_fr: "Tour en Goélette + Déjeuner",
    descricao_it: "Tour in Goletta + Pranzo",
    preco: 110,
    preco_original: null,
    tour_keys: ["escuna", "almoco"],
    imagem_url: null,
    video_url: null,
    destaque: false,
    ativo: true,
    ordem: 4,
    info_adicional: null,
    observacoes: null,
    badge: null,
    urgencia: null,
  },
  {
    id: "dive_drive",
    key: "dive_drive",
    nome_pt: "Pacote Dive & Drive",
    nome_en: "Dive & Drive Package",
    nome_es: "Paquete Dive & Drive",
    nome_fr: "Forfait Dive & Drive",
    nome_it: "Pacchetto Dive & Drive",
    descricao_pt: "Mergulho + Buggy Off-Road",
    descricao_en: "Diving + Off-Road Buggy",
    descricao_es: "Buceo + Buggy Off-Road",
    descricao_fr: "Plongée + Buggy Tout-Terrain",
    descricao_it: "Immersione + Buggy Off-Road",
    preco: 280,
    preco_original: null,
    tour_keys: ["mergulho", "buggy"],
    imagem_url: null,
    video_url: null,
    destaque: false,
    ativo: true,
    ordem: 5,
    info_adicional: null,
    observacoes: null,
    badge: null,
    urgencia: null,
  },
  {
    id: "brigitte_bardot",
    key: "brigitte_bardot",
    nome_pt: "Pacote Brigitte Bardot",
    nome_en: "Brigitte Bardot Package",
    nome_es: "Paquete Brigitte Bardot",
    nome_fr: "Forfait Brigitte Bardot",
    nome_it: "Pacchetto Brigitte Bardot",
    descricao_pt: "Passeio de Catamarã + Jardineira",
    descricao_en: "Catamaran Tour + Trolley",
    descricao_es: "Paseo en Catamarán + Jardinera",
    descricao_fr: "Tour en Catamaran + Petit Train",
    descricao_it: "Tour in Catamarano + Trenino",
    preco: 200,
    preco_original: null,
    tour_keys: ["catamara", "jardineira"],
    imagem_url: null,
    video_url: null,
    destaque: false,
    ativo: true,
    ordem: 6,
    info_adicional: null,
    observacoes: null,
    badge: null,
    urgencia: null,
  },
];

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
      if (error) {
        return DEFAULT_PACOTES.filter((p) => (onlyActive ? p.ativo : true));
      }
      return ((data as unknown) as Pacote[]) || [];
    },
  });

export const usePacote = (key: string | undefined) =>
  useQuery({
    enabled: !!key,
    queryKey: ["pacotes", "one", key],
    queryFn: async () => {
      const { data, error } = await db().select("*").eq("key", key as string).maybeSingle();
      if (error) {
        return DEFAULT_PACOTES.find((p) => p.key === key) || null;
      }
      return ((data as unknown) as Pacote | null) || DEFAULT_PACOTES.find((p) => p.key === key) || null;
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
