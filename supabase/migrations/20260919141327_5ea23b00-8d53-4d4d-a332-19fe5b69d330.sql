CREATE POLICY "acesso direto bloqueado cupons"
ON public.cupons
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "acesso direto bloqueado leads"
ON public.leads
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "acesso direto bloqueado reservas"
ON public.reservas
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);