CREATE TABLE public.convites_avaliacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id uuid NOT NULL UNIQUE REFERENCES public.reservas(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  passeio_keys text[] NOT NULL,
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  usado_em timestamp with time zone,
  CONSTRAINT convites_avaliacao_passeios_presentes CHECK (cardinality(passeio_keys) > 0),
  CONSTRAINT convites_avaliacao_token_hash_valido CHECK (char_length(token_hash) = 64)
);
GRANT ALL ON public.convites_avaliacao TO service_role;
ALTER TABLE public.convites_avaliacao ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  convite_id uuid NOT NULL REFERENCES public.convites_avaliacao(id) ON DELETE RESTRICT,
  reserva_id uuid NOT NULL REFERENCES public.reservas(id) ON DELETE RESTRICT,
  cliente_nome text NOT NULL,
  passeio_key text NOT NULL,
  passeio_nome text NOT NULL,
  nota_atendimento numeric(2,1) NOT NULL,
  nota_plataforma numeric(2,1) NOT NULL,
  nota_passeio numeric(2,1) NOT NULL,
  avaliacao_passeio text NOT NULL,
  melhoria text,
  nota_recomendacao numeric(2,1) NOT NULL,
  observacoes text,
  autorizacao_publicacao boolean NOT NULL,
  autorizado_em timestamp with time zone NOT NULL,
  avaliado_em timestamp with time zone NOT NULL DEFAULT now(),
  expira_em timestamp with time zone NOT NULL,
  status_admin text NOT NULL DEFAULT 'nova',
  status_publicacao text NOT NULL DEFAULT 'pendente',
  media_final numeric(3,2) NOT NULL,
  CONSTRAINT avaliacoes_convite_passeio_unico UNIQUE (convite_id, passeio_key),
  CONSTRAINT avaliacoes_reserva_passeio_unico UNIQUE (reserva_id, passeio_key),
  CONSTRAINT avaliacoes_cliente_nome_limite CHECK (char_length(btrim(cliente_nome)) BETWEEN 1 AND 200),
  CONSTRAINT avaliacoes_passeio_key_limite CHECK (char_length(btrim(passeio_key)) BETWEEN 1 AND 100),
  CONSTRAINT avaliacoes_passeio_nome_limite CHECK (char_length(btrim(passeio_nome)) BETWEEN 1 AND 200),
  CONSTRAINT avaliacoes_nota_atendimento_valida CHECK (nota_atendimento BETWEEN 1 AND 5 AND mod(nota_atendimento * 2, 1) = 0),
  CONSTRAINT avaliacoes_nota_plataforma_valida CHECK (nota_plataforma BETWEEN 1 AND 5 AND mod(nota_plataforma * 2, 1) = 0),
  CONSTRAINT avaliacoes_nota_passeio_valida CHECK (nota_passeio BETWEEN 1 AND 5 AND mod(nota_passeio * 2, 1) = 0),
  CONSTRAINT avaliacoes_nota_recomendacao_valida CHECK (nota_recomendacao BETWEEN 1 AND 5 AND mod(nota_recomendacao * 2, 1) = 0),
  CONSTRAINT avaliacoes_texto_obrigatorio CHECK (char_length(btrim(avaliacao_passeio)) BETWEEN 1 AND 400),
  CONSTRAINT avaliacoes_melhoria_limite CHECK (melhoria IS NULL OR char_length(melhoria) <= 1000),
  CONSTRAINT avaliacoes_melhoria_obrigatoria CHECK (nota_passeio >= 4 OR char_length(btrim(COALESCE(melhoria, ''))) > 0),
  CONSTRAINT avaliacoes_observacoes_limite CHECK (observacoes IS NULL OR char_length(observacoes) <= 1000),
  CONSTRAINT avaliacoes_autorizacao_obrigatoria CHECK (autorizacao_publicacao = true),
  CONSTRAINT avaliacoes_expiracao_valida CHECK (expira_em > avaliado_em),
  CONSTRAINT avaliacoes_status_admin_valido CHECK (status_admin IN ('nova', 'visualizada')),
  CONSTRAINT avaliacoes_status_publicacao_valido CHECK (status_publicacao IN ('pendente', 'publicada', 'oculta')),
  CONSTRAINT avaliacoes_media_valida CHECK (media_final BETWEEN 1 AND 5)
);
GRANT ALL ON public.avaliacoes TO service_role;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_avaliacoes_status_admin ON public.avaliacoes(status_admin, avaliado_em DESC);
CREATE INDEX idx_avaliacoes_publicacao ON public.avaliacoes(status_publicacao, expira_em);
CREATE INDEX idx_avaliacoes_reserva ON public.avaliacoes(reserva_id);

CREATE OR REPLACE FUNCTION public.validar_avaliacao_vinculada()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  convite public.convites_avaliacao%ROWTYPE;
BEGIN
  SELECT * INTO convite FROM public.convites_avaliacao WHERE id = NEW.convite_id;
  IF NOT FOUND OR convite.reserva_id <> NEW.reserva_id THEN
    RAISE EXCEPTION 'convite_reserva_invalido';
  END IF;
  IF NOT (NEW.passeio_key = ANY(convite.passeio_keys)) THEN
    RAISE EXCEPTION 'passeio_nao_autorizado';
  END IF;
  IF convite.usado_em IS NOT NULL THEN
    RAISE EXCEPTION 'convite_ja_utilizado';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_avaliacao_vinculada
BEFORE INSERT ON public.avaliacoes
FOR EACH ROW EXECUTE FUNCTION public.validar_avaliacao_vinculada();