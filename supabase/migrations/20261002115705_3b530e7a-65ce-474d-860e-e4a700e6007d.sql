ALTER TABLE public.convites_avaliacao
  ADD COLUMN codigo_curto text;

ALTER TABLE public.convites_avaliacao
  ADD CONSTRAINT convites_avaliacao_codigo_curto_formato
  CHECK (codigo_curto IS NULL OR codigo_curto ~ '^[A-Za-z0-9]{10,16}$');

CREATE UNIQUE INDEX convites_avaliacao_codigo_curto_unique
  ON public.convites_avaliacao (codigo_curto)
  WHERE codigo_curto IS NOT NULL;