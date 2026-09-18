ALTER FUNCTION public.validar_avaliacao_vinculada() SECURITY INVOKER;
REVOKE ALL ON FUNCTION public.validar_avaliacao_vinculada() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validar_avaliacao_vinculada() TO service_role;

CREATE POLICY "service_role gerencia convites de avaliacao"
ON public.convites_avaliacao
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role gerencia avaliacoes"
ON public.avaliacoes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);