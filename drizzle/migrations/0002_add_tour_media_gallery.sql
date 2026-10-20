-- Galeria progressiva de mídia dos passeios.
-- Mantém imagem_url e video_url para compatibilidade com o conteúdo existente.
ALTER TABLE public.tours
  ADD COLUMN IF NOT EXISTS gallery_imagens JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_2_url TEXT;

COMMENT ON COLUMN public.tours.gallery_imagens IS 'URLs das fotos adicionais do passeio; no máximo 3, além de imagem_url.';
COMMENT ON COLUMN public.tours.video_2_url IS 'URL opcional do segundo vídeo do passeio.';
