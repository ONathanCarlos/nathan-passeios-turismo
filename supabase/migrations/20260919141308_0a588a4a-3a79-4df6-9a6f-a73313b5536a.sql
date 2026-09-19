ALTER TABLE public.avaliacoes
ADD CONSTRAINT avaliacoes_convite_unico UNIQUE (convite_id);