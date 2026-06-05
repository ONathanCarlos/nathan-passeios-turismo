-- ============================================================
-- Security hardening: remove permissive public policies
-- ============================================================

-- ---- CMS content tables: keep public SELECT, remove public writes ----
DROP POLICY IF EXISTS "anyone can insert tours" ON public.tours;
DROP POLICY IF EXISTS "anyone can update tours" ON public.tours;
DROP POLICY IF EXISTS "anyone can delete tours" ON public.tours;

DROP POLICY IF EXISTS "anyone can insert pacotes" ON public.pacotes;
DROP POLICY IF EXISTS "anyone can update pacotes" ON public.pacotes;
DROP POLICY IF EXISTS "anyone can delete pacotes" ON public.pacotes;

DROP POLICY IF EXISTS "anyone can insert home_content" ON public.home_content;
DROP POLICY IF EXISTS "anyone can update home_content" ON public.home_content;
DROP POLICY IF EXISTS "anyone can delete home_content" ON public.home_content;

DROP POLICY IF EXISTS "anyone can insert depoimentos" ON public.depoimentos;
DROP POLICY IF EXISTS "anyone can update depoimentos" ON public.depoimentos;
DROP POLICY IF EXISTS "anyone can delete depoimentos" ON public.depoimentos;

DROP POLICY IF EXISTS "anyone can insert config_global" ON public.config_global;
DROP POLICY IF EXISTS "anyone can update config_global" ON public.config_global;
DROP POLICY IF EXISTS "anyone can delete config_global" ON public.config_global;

DROP POLICY IF EXISTS "anyone can insert modais" ON public.modais;
DROP POLICY IF EXISTS "anyone can update modais" ON public.modais;
DROP POLICY IF EXISTS "anyone can delete modais" ON public.modais;

-- ---- Sensitive PII tables: remove ALL public access ----
DROP POLICY IF EXISTS "anyone can insert leads" ON public.leads;
DROP POLICY IF EXISTS "anyone can read leads" ON public.leads;

DROP POLICY IF EXISTS "anyone can insert cupons" ON public.cupons;
DROP POLICY IF EXISTS "anyone can read cupons" ON public.cupons;
DROP POLICY IF EXISTS "anyone can update cupons" ON public.cupons;

DROP POLICY IF EXISTS "anyone can insert reservas" ON public.reservas;
DROP POLICY IF EXISTS "anyone can read reservas" ON public.reservas;
DROP POLICY IF EXISTS "anyone can update reservas" ON public.reservas;

-- ---- Ensure service role retains full access for edge functions ----
GRANT ALL ON public.tours, public.pacotes, public.home_content, public.depoimentos,
              public.config_global, public.modais, public.leads, public.cupons,
              public.reservas TO service_role;

-- ---- Storage: remove ALL public policies on media bucket ----
-- Files remain readable via public object URLs (bucket is public),
-- but listing/upload/overwrite/delete via the API is now blocked.
DROP POLICY IF EXISTS "media public delete" ON storage.objects;
DROP POLICY IF EXISTS "media public insert" ON storage.objects;
DROP POLICY IF EXISTS "media public update" ON storage.objects;
DROP POLICY IF EXISTS "media public read" ON storage.objects;

-- ---- Realtime: stop broadcasting PII tables ----
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE public.leads; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE public.cupons; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE public.reservas; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;