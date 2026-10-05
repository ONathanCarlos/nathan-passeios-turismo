CREATE OR REPLACE FUNCTION public.validar_avaliacao_vinculada()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

REVOKE ALL ON FUNCTION public.validar_avaliacao_vinculada() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validar_avaliacao_vinculada() FROM anon;
REVOKE ALL ON FUNCTION public.validar_avaliacao_vinculada() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.validar_avaliacao_vinculada() TO service_role;