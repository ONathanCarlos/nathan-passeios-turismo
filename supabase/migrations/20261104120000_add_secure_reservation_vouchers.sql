-- Vouchers digitais privados e aditivos, conforme plano aprovado.
-- Preparada no repositório; esta migration NÃO foi aplicada ao Supabase.
-- Não modifica nem faz backfill nas reservas históricas.

CREATE SEQUENCE IF NOT EXISTS public.reserva_voucher_code_seq AS BIGINT START WITH 1 INCREMENT BY 1 NO CYCLE;

CREATE TABLE IF NOT EXISTS public.reserva_voucher_emissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id UUID NOT NULL UNIQUE REFERENCES public.reservas(id) ON DELETE CASCADE,
  request_id UUID NOT NULL UNIQUE,
  request_proof_hash TEXT NOT NULL,
  request_expires_at TIMESTAMPTZ NOT NULL,
  codigo_reserva TEXT UNIQUE,
  codigo_numero BIGINT UNIQUE,
  idioma TEXT NOT NULL CHECK (idioma IN ('pt', 'es', 'en', 'fr', 'it')),
  total_pessoas INTEGER NOT NULL CHECK (total_pessoas BETWEEN 1 AND 100),
  template_version SMALLINT NOT NULL DEFAULT 1 CHECK (template_version > 0),
  contract_version SMALLINT NOT NULL DEFAULT 1 CHECK (contract_version > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'issued')),
  mensagem_ciphertext TEXT,
  mensagem_iv TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reserva_voucher_issue_shape CHECK (
    (status = 'pending' AND codigo_reserva IS NULL AND codigo_numero IS NULL)
    OR (status = 'issued' AND codigo_reserva IS NOT NULL AND codigo_numero IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.reserva_passeios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emissao_id UUID NOT NULL REFERENCES public.reserva_voucher_emissoes(id) ON DELETE CASCADE,
  ordem SMALLINT NOT NULL CHECK (ordem BETWEEN 1 AND 12),
  tour_key TEXT NOT NULL CHECK (length(tour_key) BETWEEN 1 AND 80),
  codigo_passeio TEXT NOT NULL UNIQUE,
  nome_snapshot TEXT NOT NULL CHECK (length(nome_snapshot) BETWEEN 1 AND 200),
  data_viagem DATE NOT NULL,
  horario_snapshot TEXT NOT NULL CHECK (length(horario_snapshot) BETWEEN 1 AND 160),
  template_key TEXT,
  template_version SMALLINT NOT NULL DEFAULT 1 CHECK (template_version > 0),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reserva_passeios_emissao_ordem_unique UNIQUE (emissao_id, ordem)
);

CREATE TABLE IF NOT EXISTS public.reserva_voucher_acessos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emissao_id UUID NOT NULL REFERENCES public.reserva_voucher_emissoes(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  revogado_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS reserva_passeios_emissao_idx ON public.reserva_passeios (emissao_id, ordem);
CREATE INDEX IF NOT EXISTS reserva_voucher_request_expiry_idx ON public.reserva_voucher_emissoes (request_expires_at);
CREATE INDEX IF NOT EXISTS reserva_voucher_access_emission_idx ON public.reserva_voucher_acessos (emissao_id, revogado_em);

ALTER TABLE public.reserva_voucher_emissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserva_passeios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserva_voucher_acessos ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.reserva_voucher_emissoes FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.reserva_passeios FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.reserva_voucher_acessos FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.reserva_voucher_emissoes TO service_role;
GRANT ALL ON TABLE public.reserva_passeios TO service_role;
GRANT ALL ON TABLE public.reserva_voucher_acessos TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.reserva_voucher_code_seq TO service_role;

-- Cria reserva + desafio em uma transação, com prova secreta e chave de retry.
-- O ID retornado só é conhecido pelo cliente que iniciou a solicitação.
CREATE OR REPLACE FUNCTION public.create_reserva_voucher_request(
  p_request_id UUID,
  p_proof_hash TEXT,
  p_nome TEXT,
  p_telefone TEXT,
  p_email TEXT,
  p_destino TEXT,
  p_data_viagem DATE,
  p_passageiros INTEGER,
  p_cupom_aplicado TEXT,
  p_valor_original NUMERIC,
  p_valor_com_desconto NUMERIC,
  p_idioma TEXT,
  p_total_pessoas INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_reserva_id UUID;
  v_existing_proof TEXT;
BEGIN
  IF p_proof_hash IS NULL OR length(p_proof_hash) <> 64
    OR p_idioma NOT IN ('pt', 'es', 'en', 'fr', 'it')
    OR p_total_pessoas < 1 OR p_total_pessoas > 100 THEN
    RAISE EXCEPTION 'voucher_request_invalid' USING ERRCODE = '22023';
  END IF;

  SELECT reserva_id, request_proof_hash
    INTO v_reserva_id, v_existing_proof
  FROM public.reserva_voucher_emissoes
  WHERE request_id = p_request_id
  FOR UPDATE;
  IF v_reserva_id IS NOT NULL THEN
    IF v_existing_proof <> p_proof_hash THEN
      RAISE EXCEPTION 'voucher_request_invalid' USING ERRCODE = '42501';
    END IF;
    RETURN v_reserva_id;
  END IF;

  INSERT INTO public.reservas (
    nome, telefone, email, destino, data_viagem, passageiros,
    cupom_aplicado, valor_original, valor_com_desconto, status
  ) VALUES (
    p_nome, p_telefone, p_email, p_destino, p_data_viagem, p_passageiros,
    p_cupom_aplicado, p_valor_original, p_valor_com_desconto, 'pendente'
  ) RETURNING id INTO v_reserva_id;

  INSERT INTO public.reserva_voucher_emissoes (
    reserva_id, request_id, request_proof_hash, request_expires_at,
    idioma, total_pessoas, status
  ) VALUES (
    v_reserva_id, p_request_id, p_proof_hash, now() + interval '30 minutes',
    p_idioma, p_total_pessoas, 'pending'
  );

  RETURN v_reserva_id;
END;
$$;

-- Emissão transacional e idempotente. Cada retry revoga o bearer-token anterior,
-- mantém código/itens e cria um novo token-hash caso a resposta anterior tenha sido perdida.
CREATE OR REPLACE FUNCTION public.issue_reserva_vouchers(
  p_reserva_id UUID,
  p_request_id UUID,
  p_proof_hash TEXT,
  p_access_token_hash TEXT,
  p_idioma TEXT,
  p_total_pessoas INTEGER,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_issue public.reserva_voucher_emissoes%ROWTYPE;
  v_number BIGINT;
  v_year TEXT;
  v_item JSONB;
  v_key TEXT;
  v_prefix TEXT;
  v_code TEXT;
  v_index INTEGER := 0;
  v_existing_items JSONB;
  v_requested_items JSONB;
BEGIN
  SELECT * INTO v_issue
  FROM public.reserva_voucher_emissoes
  WHERE reserva_id = p_reserva_id
  FOR UPDATE;

  IF NOT FOUND
    OR v_issue.request_id <> p_request_id
    OR v_issue.request_proof_hash <> p_proof_hash
    OR v_issue.request_expires_at <= now() THEN
    RAISE EXCEPTION 'voucher_request_invalid' USING ERRCODE = '42501';
  END IF;

  IF p_access_token_hash IS NULL OR length(p_access_token_hash) <> 64
    OR p_idioma NOT IN ('pt', 'es', 'en', 'fr', 'it')
    OR p_total_pessoas < 1 OR p_total_pessoas > 100
    OR p_items IS NULL OR jsonb_typeof(p_items) <> 'array'
    OR jsonb_array_length(p_items) < 1 OR jsonb_array_length(p_items) > 12 THEN
    RAISE EXCEPTION 'voucher_payload_invalid' USING ERRCODE = '22023';
  END IF;

  IF v_issue.codigo_reserva IS NULL THEN
    v_number := nextval('public.reserva_voucher_code_seq');
    v_year := to_char(now() AT TIME ZONE 'UTC', 'YYYY');
    UPDATE public.reserva_voucher_emissoes
    SET codigo_numero = v_number,
        codigo_reserva = 'ONX-' || v_year || '-' || lpad(v_number::TEXT, 6, '0'),
        idioma = p_idioma,
        total_pessoas = p_total_pessoas,
        status = 'issued',
        atualizado_em = now()
    WHERE id = v_issue.id
    RETURNING * INTO v_issue;

    FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
      v_index := v_index + 1;
      v_key := lower(coalesce(v_item->>'tour_key', ''));
      IF v_key = '' OR length(v_key) > 80
        OR coalesce(v_item->>'nome_snapshot', '') = ''
        OR coalesce(v_item->>'horario_snapshot', '') = '' THEN
        RAISE EXCEPTION 'voucher_item_invalid' USING ERRCODE = '22023';
      END IF;
      v_prefix := left(regexp_replace(upper(v_key), '[^A-Z0-9]', '', 'g'), 18);
      IF v_prefix = '' THEN v_prefix := 'TOUR'; END IF;
      v_code := v_prefix || '-' || v_year || '-' || lpad(v_number::TEXT, 6, '0') || '-' || lpad(v_index::TEXT, 2, '0');

      INSERT INTO public.reserva_passeios (
        emissao_id, ordem, tour_key, codigo_passeio, nome_snapshot,
        data_viagem, horario_snapshot, template_key, template_version
      ) VALUES (
        v_issue.id, v_index, v_key, v_code,
        left(v_item->>'nome_snapshot', 200),
        (v_item->>'data_viagem')::DATE,
        left(v_item->>'horario_snapshot', 160),
        nullif(left(coalesce(v_item->>'template_key', ''), 80), ''),
        1
      );
    END LOOP;
  ELSE
    SELECT jsonb_agg(jsonb_build_object(
      'tour_key', tour_key,
      'nome_snapshot', nome_snapshot,
      'data_viagem', data_viagem,
      'horario_snapshot', horario_snapshot,
      'template_key', template_key,
      'ordem', ordem
    ) ORDER BY ordem) INTO v_existing_items
    FROM public.reserva_passeios
    WHERE emissao_id = v_issue.id;

    SELECT jsonb_agg(jsonb_build_object(
      'tour_key', lower(coalesce(value->>'tour_key', '')),
      'nome_snapshot', left(coalesce(value->>'nome_snapshot', ''), 200),
      'data_viagem', (value->>'data_viagem')::DATE,
      'horario_snapshot', left(coalesce(value->>'horario_snapshot', ''), 160),
      'template_key', nullif(left(coalesce(value->>'template_key', ''), 80), ''),
      'ordem', ordinality
    ) ORDER BY ordinality) INTO v_requested_items
    FROM jsonb_array_elements(p_items) WITH ORDINALITY AS requested(value, ordinality);

    IF v_existing_items IS NULL OR v_existing_items <> v_requested_items THEN
      RAISE EXCEPTION 'voucher_retry_payload_mismatch' USING ERRCODE = '22023';
    END IF;
  END IF;

  UPDATE public.reserva_voucher_acessos
  SET revogado_em = now()
  WHERE emissao_id = v_issue.id
    AND revogado_em IS NULL
    AND token_hash <> p_access_token_hash;
  UPDATE public.reserva_voucher_acessos
  SET revogado_em = NULL
  WHERE emissao_id = v_issue.id AND token_hash = p_access_token_hash;
  IF NOT FOUND THEN
    INSERT INTO public.reserva_voucher_acessos (emissao_id, token_hash)
    VALUES (v_issue.id, p_access_token_hash);
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'tour_key', tour_key,
    'code', codigo_passeio,
    'name', nome_snapshot,
    'date', data_viagem,
    'schedule', horario_snapshot,
    'template_key', template_key,
    'order', ordem
  ) ORDER BY ordem) INTO v_requested_items
  FROM public.reserva_passeios
  WHERE emissao_id = v_issue.id;

  RETURN jsonb_build_object(
    'issue_id', v_issue.id,
    'reservation_code', v_issue.codigo_reserva,
    'sequence', v_issue.codigo_numero,
    'items', coalesce(v_requested_items, '[]'::jsonb)
  );
END;
$$;

-- Snapshot do texto final de WhatsApp criptografado no servidor; request proof
-- impede que um terceiro use o endpoint público para sobrescrever a mensagem.
CREATE OR REPLACE FUNCTION public.save_reserva_voucher_message(
  p_reserva_id UUID,
  p_request_id UUID,
  p_proof_hash TEXT,
  p_ciphertext TEXT,
  p_iv TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF length(coalesce(p_ciphertext, '')) < 1 OR length(p_ciphertext) > 50000
    OR length(coalesce(p_iv, '')) < 1 OR length(p_iv) > 100 THEN
    RAISE EXCEPTION 'voucher_message_invalid' USING ERRCODE = '22023';
  END IF;
  UPDATE public.reserva_voucher_emissoes
  SET mensagem_ciphertext = p_ciphertext,
      mensagem_iv = p_iv,
      atualizado_em = now()
  WHERE reserva_id = p_reserva_id
    AND request_id = p_request_id
    AND request_proof_hash = p_proof_hash
    AND request_expires_at > now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.create_reserva_voucher_request(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, INTEGER, TEXT, NUMERIC, NUMERIC, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.issue_reserva_vouchers(UUID, UUID, TEXT, TEXT, TEXT, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.save_reserva_voucher_message(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_reserva_voucher_request(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, INTEGER, TEXT, NUMERIC, NUMERIC, TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.issue_reserva_vouchers(UUID, UUID, TEXT, TEXT, TEXT, INTEGER, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.save_reserva_voucher_message(UUID, UUID, TEXT, TEXT, TEXT) TO service_role;
