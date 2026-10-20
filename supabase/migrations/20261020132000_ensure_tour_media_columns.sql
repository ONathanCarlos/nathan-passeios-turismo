-- Garante que fotos extras e o segundo vídeo do CMS possam ser persistidos.
-- A migration anterior pode já existir no repositório sem ter sido aplicada
-- ao projeto Supabase que atende o site; IF NOT EXISTS torna esta correção segura.
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS gallery_imagens JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_2_url TEXT;

COMMENT ON COLUMN public.tours.gallery_imagens IS 'URLs das fotos adicionais do passeio; no máximo 3, além de imagem_url.';
COMMENT ON COLUMN public.tours.video_2_url IS 'URL opcional do segundo vídeo do passeio.';
