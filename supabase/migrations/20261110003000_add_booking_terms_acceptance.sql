-- Aplicar no backend Lovable do site antes de publicar o frontend.
-- Sem backfill, alteração de preços, multas ou conteúdo de WhatsApp/vouchers.
CREATE TABLE public.booking_terms_versions (
  version text PRIMARY KEY,
  content text NOT NULL,
  content_sha256 text NOT NULL CHECK (length(content_sha256) = 64),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.booking_terms_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id uuid REFERENCES public.reservas(id) ON DELETE SET NULL,
  reserva_reference uuid,
  request_id uuid NOT NULL,
  version text NOT NULL REFERENCES public.booking_terms_versions(version),
  accepted_at timestamptz NOT NULL DEFAULT now(),
  tour_keys jsonb NOT NULL,
  payload_hash text,
  language text NOT NULL CHECK (language IN ('pt','es','en','fr','it')),
  context text NOT NULL CHECK (context IN ('reservation','cms_inquiry')),
  UNIQUE (request_id, version),
  UNIQUE (reserva_id, version)
);
ALTER TABLE public.booking_terms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_terms_acceptances ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.booking_terms_versions, public.booking_terms_acceptances FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.booking_terms_versions, public.booking_terms_acceptances TO service_role;

-- Apenas a Edge Function com service role pode executar. A transação inclui
-- criação idempotente existente e aceite; nenhum ID arbitrário é aceito.
CREATE FUNCTION public.create_reserva_with_terms(p_reserva jsonb, p_terms jsonb, p_voucher jsonb DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_id uuid; v_request uuid := (p_terms->>'request_id')::uuid; v_existing public.booking_terms_acceptances%ROWTYPE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.booking_terms_versions WHERE version = p_terms->>'version') THEN
    RAISE EXCEPTION 'terms_version_invalid';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(v_request::text, 0));
  SELECT * INTO v_existing FROM public.booking_terms_acceptances WHERE request_id = v_request AND version = p_terms->>'version';
  IF FOUND THEN
    IF v_existing.context <> 'reservation' OR v_existing.tour_keys <> p_terms->'tour_keys' THEN RAISE EXCEPTION 'terms_retry_mismatch'; END IF;
    IF v_existing.payload_hash IS DISTINCT FROM p_terms->>'payload_hash' THEN RAISE EXCEPTION 'terms_retry_mismatch'; END IF;
    IF v_existing.language IS DISTINCT FROM p_terms->>'language' THEN RAISE EXCEPTION 'terms_retry_mismatch'; END IF;
    -- Nunca sobrescrever um aceite anterior.
    RETURN v_existing.reserva_id;
  END IF;
  IF p_voucher IS NOT NULL THEN
    v_id := public.create_reserva_voucher_request(
      (p_voucher->>'request_id')::uuid, p_voucher->>'proof_hash',
      p_reserva->>'nome', p_reserva->>'telefone', p_reserva->>'email', p_reserva->>'destino',
      (p_reserva->>'data_viagem')::date, (p_reserva->>'passageiros')::integer,
      p_reserva->>'cupom_aplicado', (p_reserva->>'valor_original')::numeric,
      (p_reserva->>'valor_com_desconto')::numeric, p_voucher->>'idioma', (p_voucher->>'total_pessoas')::integer
    );
  ELSE
    INSERT INTO public.reservas(nome,telefone,email,destino,data_viagem,passageiros,cupom_aplicado,valor_original,valor_com_desconto,status)
    VALUES(p_reserva->>'nome',p_reserva->>'telefone',p_reserva->>'email',p_reserva->>'destino',
      (p_reserva->>'data_viagem')::date,(p_reserva->>'passageiros')::integer,p_reserva->>'cupom_aplicado',
      (p_reserva->>'valor_original')::numeric,(p_reserva->>'valor_com_desconto')::numeric,'pendente') RETURNING id INTO v_id;
  END IF;
  INSERT INTO public.booking_terms_acceptances(reserva_id,reserva_reference,request_id,version,tour_keys,payload_hash,language,context)
    VALUES(v_id,v_id,v_request,p_terms->>'version',p_terms->'tour_keys',p_terms->>'payload_hash',p_terms->>'language','reservation');
  RETURN v_id;
END; $$;
REVOKE ALL ON FUNCTION public.create_reserva_with_terms(jsonb,jsonb,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_reserva_with_terms(jsonb,jsonb,jsonb) TO service_role;
