-- Fluxo de avaliações simplificado e sem impacto sobre a gravação da reserva.
-- Não apaga reservas, convites nem avaliações existentes.
ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS whatsapp_solicitado_em timestamptz,
  ADD COLUMN IF NOT EXISTS review_tour_keys text[] NOT NULL DEFAULT '{}'::text[];

COMMENT ON COLUMN public.reservas.whatsapp_solicitado_em IS
  'Preenchido somente quando o cliente clica para abrir o envio da reserva pelo WhatsApp.';
COMMENT ON COLUMN public.reservas.review_tour_keys IS
  'Snapshot validado pelo servidor dos passeios elegíveis para avaliação nesta reserva.';

-- O link permanece apenas consultável até o cliente enviar o formulário.
-- O lock serializa envios concorrentes e o consumo ocorre na mesma transação do INSERT.
CREATE OR REPLACE FUNCTION public.validar_avaliacao_vinculada()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  convite public.convites_avaliacao%ROWTYPE;
BEGIN
  SELECT *
    INTO convite
    FROM public.convites_avaliacao
   WHERE id = NEW.convite_id
   FOR UPDATE;

  IF NOT FOUND OR convite.reserva_id <> NEW.reserva_id THEN
    RAISE EXCEPTION 'convite_reserva_invalido';
  END IF;
  IF NOT (NEW.passeio_key = ANY(convite.passeio_keys)) THEN
    RAISE EXCEPTION 'passeio_nao_autorizado';
  END IF;
  IF convite.usado_em IS NOT NULL THEN
    RAISE EXCEPTION 'convite_ja_utilizado';
  END IF;

  UPDATE public.convites_avaliacao
     SET usado_em = NEW.avaliado_em
   WHERE id = NEW.convite_id;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validar_avaliacao_vinculada() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validar_avaliacao_vinculada() TO service_role;
