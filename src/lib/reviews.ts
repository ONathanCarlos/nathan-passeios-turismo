import { supabase } from "@/integrations/supabase/client";

export type ReviewTour = { key: string; nome: string };

export type ReviewContext = {
  cliente_nome: string;
  reserva_destino: string;
  data_viagem: string | null;
  passeios: ReviewTour[];
};

export type ReviewSubmission = {
  passeio_key: string;
  nota_atendimento: number;
  nota_plataforma: number;
  nota_passeio: number;
  avaliacao_passeio: string;
  melhoria: string;
  nota_recomendacao: number;
  observacoes: string;
  autorizacao_publicacao: boolean;
};

type PublicReviewResponse<T> = { ok: boolean; error?: string } & T;

const callReviews = async <T>(action: string, payload: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("public-data", {
    body: { action, ...payload },
  });
  if (error && !data) throw new Error("service_unavailable");
  return data as PublicReviewResponse<T>;
};

export const getReviewContext = (token: string) =>
  callReviews<{ context?: ReviewContext }>("get_review_context", { token });

export const submitReview = (token: string, submission: ReviewSubmission) =>
  callReviews<{ review?: { id: string; passeio_nome: string; media_final: number } }>("submit_review", {
    token,
    ...submission,
  });