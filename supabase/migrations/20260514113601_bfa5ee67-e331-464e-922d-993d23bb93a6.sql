-- Ensure realtime captures full row data for change events
ALTER TABLE public.modais REPLICA IDENTITY FULL;
ALTER TABLE public.tours REPLICA IDENTITY FULL;
ALTER TABLE public.config_global REPLICA IDENTITY FULL;
ALTER TABLE public.depoimentos REPLICA IDENTITY FULL;
ALTER TABLE public.home_content REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication (idempotent via DO block)
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.modais; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.tours; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.config_global; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.depoimentos; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.home_content; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;