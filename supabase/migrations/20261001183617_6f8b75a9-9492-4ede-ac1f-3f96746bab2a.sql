DROP POLICY IF EXISTS "anyone can read modais" ON public.modais;
CREATE POLICY "public can read active modais"
ON public.modais
FOR SELECT
TO anon, authenticated
USING (ativo IS TRUE);

DROP POLICY IF EXISTS "anyone can read config_global" ON public.config_global;
CREATE POLICY "public can read approved config"
ON public.config_global
FOR SELECT
TO anon, authenticated
USING (chave = ANY (ARRAY[
  'desconto_padrao'::text,
  'texto_promo_topo'::text,
  'footer_region'::text,
  'whatsapp'::text,
  'instagram_url'::text
]));