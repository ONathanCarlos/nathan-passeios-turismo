ALTER TABLE public.reservas
  ADD COLUMN IF NOT EXISTS idioma_reserva text;
