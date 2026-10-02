import { supabase } from "@/integrations/supabase/client";

export type PublicReview = {
  nome: string;
  nota: number;
  comentario: string;
  passeio_key: string;
};

type PublicReviewsResponse = {
  ok: boolean;
  reviews?: PublicReview[];
  error?: string;
};

export const getPublicReviews = async (passeioKey: string): Promise<PublicReview[]> => {
  const { data, error } = await supabase.functions.invoke("public-data", {
    body: { action: "get_public_reviews", passeio_key: passeioKey },
  });

  if (error && !data) throw new Error("service_unavailable");

  const response = data as PublicReviewsResponse;
  if (!response?.ok) return [];
  return response.reviews || [];
};