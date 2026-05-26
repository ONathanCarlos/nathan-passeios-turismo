ALTER TABLE public.pacotes ADD COLUMN IF NOT EXISTS preco_original numeric;
ALTER TABLE public.pacotes ADD COLUMN IF NOT EXISTS badge text;
ALTER TABLE public.pacotes ADD COLUMN IF NOT EXISTS urgencia text;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS badge text;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS urgencia text;