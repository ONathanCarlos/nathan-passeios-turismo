
-- Cria tabela pacotes para combos promocionais
CREATE TABLE public.pacotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  nome_pt TEXT NOT NULL,
  nome_en TEXT,
  nome_es TEXT,
  nome_fr TEXT,
  nome_it TEXT,
  descricao_pt TEXT,
  descricao_en TEXT,
  descricao_es TEXT,
  descricao_fr TEXT,
  descricao_it TEXT,
  preco NUMERIC NOT NULL DEFAULT 0,
  tour_keys TEXT[] NOT NULL DEFAULT '{}',
  imagem_url TEXT,
  video_url TEXT,
  destaque BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  info_adicional TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pacotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read pacotes" ON public.pacotes FOR SELECT USING (true);
CREATE POLICY "anyone can insert pacotes" ON public.pacotes FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can update pacotes" ON public.pacotes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anyone can delete pacotes" ON public.pacotes FOR DELETE USING (true);

CREATE TRIGGER update_pacotes_updated_at
BEFORE UPDATE ON public.pacotes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Cria pseudo-tour "almoco" só para servir imagem em pacotes (inativo no público).
INSERT INTO public.tours (key, nome_pt, descricao_pt, preco, ativo, ordem)
VALUES ('almoco', 'Almoço', 'Almoço incluso no pacote', 0, false, 999)
ON CONFLICT (key) DO NOTHING;

-- Seed dos 6 pacotes promocionais
INSERT INTO public.pacotes (key, nome_pt, preco, tour_keys, ordem) VALUES
  ('buzios_paradise', 'Pacote Búzios Paradise', 205, ARRAY['escuna','buggy','almoco'], 1),
  ('mar_terra',       'Pacote Mar & Terra',     160, ARRAY['escuna','buggy'],          2),
  ('buggy_food',      'Pacote Buggy & Food',    150, ARRAY['buggy','almoco'],          3),
  ('perfeicao_buzios','Pacote Perfeição de Búzios', 110, ARRAY['escuna','almoco'],     4),
  ('dive_drive',      'Pacote Dive & Drive',    280, ARRAY['mergulho','buggy'],        5),
  ('brigitte_bardot', 'Pacote Brigitte Bardot', 200, ARRAY['catamara','jardineira'],   6)
ON CONFLICT (key) DO NOTHING;
