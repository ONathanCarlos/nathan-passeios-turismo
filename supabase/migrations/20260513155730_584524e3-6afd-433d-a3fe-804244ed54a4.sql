
-- =========================================================
-- CMS Schema: tours, home_content, modais, depoimentos, config_global
-- + storage bucket "media" (público)
-- + RLS: leitura pública; escrita liberada (admin protegido por senha simples no front)
-- =========================================================

-- ---------- TOURS ----------
CREATE TABLE public.tours (
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
  imagem_url TEXT,
  video_url TEXT,
  destaque BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read tours" ON public.tours FOR SELECT USING (true);
CREATE POLICY "anyone can insert tours" ON public.tours FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can update tours" ON public.tours FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anyone can delete tours" ON public.tours FOR DELETE USING (true);

-- ---------- HOME_CONTENT ----------
CREATE TABLE public.home_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  secao TEXT NOT NULL UNIQUE,
  titulo_pt TEXT,
  titulo_en TEXT,
  titulo_es TEXT,
  titulo_fr TEXT,
  titulo_it TEXT,
  subtitulo_pt TEXT,
  subtitulo_en TEXT,
  subtitulo_es TEXT,
  subtitulo_fr TEXT,
  subtitulo_it TEXT,
  cta_texto_pt TEXT,
  cta_texto_en TEXT,
  cta_texto_es TEXT,
  cta_texto_fr TEXT,
  cta_texto_it TEXT,
  cta_link TEXT,
  imagem_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read home_content" ON public.home_content FOR SELECT USING (true);
CREATE POLICY "anyone can insert home_content" ON public.home_content FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can update home_content" ON public.home_content FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anyone can delete home_content" ON public.home_content FOR DELETE USING (true);

-- ---------- MODAIS ----------
CREATE TABLE public.modais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  titulo_pt TEXT,
  titulo_en TEXT,
  titulo_es TEXT,
  titulo_fr TEXT,
  titulo_it TEXT,
  mensagem_pt TEXT,
  mensagem_en TEXT,
  mensagem_es TEXT,
  mensagem_fr TEXT,
  mensagem_it TEXT,
  percentual INTEGER NOT NULL DEFAULT 0,
  codigo TEXT,
  cor_borda TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  regra JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.modais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read modais" ON public.modais FOR SELECT USING (true);
CREATE POLICY "anyone can insert modais" ON public.modais FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can update modais" ON public.modais FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anyone can delete modais" ON public.modais FOR DELETE USING (true);

-- ---------- DEPOIMENTOS ----------
CREATE TABLE public.depoimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  texto_pt TEXT,
  texto_en TEXT,
  texto_es TEXT,
  texto_fr TEXT,
  texto_it TEXT,
  avatar_url TEXT,
  nota INTEGER NOT NULL DEFAULT 5,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.depoimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read depoimentos" ON public.depoimentos FOR SELECT USING (true);
CREATE POLICY "anyone can insert depoimentos" ON public.depoimentos FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can update depoimentos" ON public.depoimentos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anyone can delete depoimentos" ON public.depoimentos FOR DELETE USING (true);

-- ---------- CONFIG_GLOBAL ----------
CREATE TABLE public.config_global (
  chave TEXT NOT NULL PRIMARY KEY,
  valor TEXT,
  valor_jsonb JSONB,
  descricao TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.config_global ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read config_global" ON public.config_global FOR SELECT USING (true);
CREATE POLICY "anyone can insert config_global" ON public.config_global FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can update config_global" ON public.config_global FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anyone can delete config_global" ON public.config_global FOR DELETE USING (true);

-- ---------- TRIGGER updated_at ----------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_tours_updated BEFORE UPDATE ON public.tours
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_home_updated BEFORE UPDATE ON public.home_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_modais_updated BEFORE UPDATE ON public.modais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dep_updated BEFORE UPDATE ON public.depoimentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cfg_updated BEFORE UPDATE ON public.config_global
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- STORAGE BUCKET ----------
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "media public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media public insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "media public update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');
CREATE POLICY "media public delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'media');

-- =========================================================
-- SEED inicial (conteúdo atual hardcoded)
-- =========================================================

-- TOURS seed
INSERT INTO public.tours (key, nome_pt, nome_en, nome_es, nome_fr, nome_it, descricao_pt, preco, ordem, ativo, destaque) VALUES
  ('escuna',     'Passeio de Escuna em Búzios',   'Schooner Tour in Búzios',     'Paseo en Goleta en Búzios',    'Excursion en Goélette à Búzios',   'Tour in Goletta a Búzios',
   'Descubra as águas cristalinas e praias paradisíacas de Búzios em uma experiência inesquecível.', 120, 1, true, true),
  ('arraial',    'Passeio em Arraial do Cabo',    'Arraial do Cabo Tour',         'Paseo en Arraial do Cabo',     'Excursion à Arraial do Cabo',      'Tour ad Arraial do Cabo',
   'Conheça o Caribe brasileiro em uma experiência completa de mar, natureza e conforto.', 350, 2, true, true),
  ('buggy',      'Passeio de Buggy',              'Buggy Tour',                   'Paseo en Buggy',               'Excursion en Buggy',               'Tour in Buggy',
   'Aventura, adrenalina e paisagens incríveis pelas praias mais belas de Búzios.', 350, 3, true, false),
  ('cabofrio',   'Passeio em Cabo Frio',          'Cabo Frio Tour',               'Paseo en Cabo Frio',           'Excursion à Cabo Frio',            'Tour a Cabo Frio',
   'Um dia completo explorando praias incríveis, gastronomia e lazer.', 280, 4, true, false),
  ('jardineira', 'Passeio de Jardineira',         'Open-Bus Tour',                'Paseo en Jardinera',           'Excursion en Bus Découvert',       'Tour in Bus Aperto',
   'Explore os cenários mais belos de Búzios com conforto e segurança.', 80, 5, true, false),
  ('catamara',   'Passeio de Catamarã',           'Catamaran Tour',               'Paseo en Catamarán',           'Excursion en Catamaran',           'Tour in Catamarano',
   'Uma experiência exclusiva navegando pelo melhor de Búzios.', 150, 6, true, false),
  ('mergulho',   'Mergulho em João Fernandes',    'Diving at João Fernandes',     'Buceo en João Fernandes',      'Plongée à João Fernandes',         'Immersione a João Fernandes',
   'Descubra um jardim submerso com segurança total e acompanhamento profissional.', 450, 7, true, false),
  ('lancha',     'Lancha Privada',                'Private Speedboat',            'Lancha Privada',               'Bateau Privé',                     'Motoscafo Privato',
   'Exclusividade, conforto e liberdade para viver Búzios no seu ritmo.', 1500, 8, true, true);

-- HOME_CONTENT seed
INSERT INTO public.home_content (secao, titulo_pt, subtitulo_pt, ordem) VALUES
  ('hero',         'Nathan',                              'Passeios & Turismo em Búzios',                       1),
  ('welcome',      NULL,                                  'Bem-vindo! Escolha seu passeio e reserve em segundos.', 2),
  ('banner_promo', 'Cupom de boas-vindas',                'Ganhe 10% OFF preenchendo seus dados.',              3);

-- MODAIS seed (comemorativos + QR)
INSERT INTO public.modais (key, titulo_pt, mensagem_pt, percentual, codigo, cor_borda, ativo) VALUES
  ('qr5',     'Promo QR 5%',          '5% OFF via QR Code',                                5,  'QR5',      'border-amber-400/40',  true),
  ('qr10',    'Promo QR 10%',         '10% OFF via QR Code',                               10, 'QR10',     'border-amber-400/40',  true),
  ('natal',   'Especial de Natal',    '🎄 Natal mágico em Búzios — 15% OFF',               15, 'NATAL15',  'border-rose-400/40',   true),
  ('anonovo', 'Especial Ano Novo',    '🎆 Ano Novo iluminado — 15% OFF',                   15, 'ANO15',    'border-yellow-400/40', true),
  ('blackfri','Black Friday',         '🖤 Black Friday — 20% OFF',                         20, 'BF20',     'border-zinc-400/40',   true),
  ('espanhol','Promoción Especial',   '¡15% OFF para nuestros amigos hispanohablantes!',   15, 'ES15',     'border-orange-400/40', true),
  ('maes',    'Dia das Mães',         '💐 Para a mãe que ama viajar — 15% OFF',            15, 'MAES15',   'border-violet-400/40', true),
  ('namorados','Dia dos Namorados',   '💕 Romance em Búzios — 15% OFF',                    15, 'NAMO15',   'border-red-400/40',    true),
  ('pais',    'Dia dos Pais',         '👨 Para o pai aventureiro — 15% OFF',               15, 'PAIS15',   'border-blue-400/40',   true),
  ('brasil',  'Independência do Brasil','🇧🇷 Feriado especial — 15% OFF',                  15, 'BRASIL15', 'border-green-400/40',  true);

-- CONFIG_GLOBAL seed
INSERT INTO public.config_global (chave, valor, descricao) VALUES
  ('whatsapp',          '5522998216796',                     'Número WhatsApp principal (apenas dígitos com DDI)'),
  ('desconto_padrao',   '10',                                'Percentual padrão de desconto (boas-vindas)'),
  ('texto_promo_topo',  'Ganhe 10% OFF no seu primeiro passeio!', 'Texto exibido no banner promocional'),
  ('instagram_url',     'https://instagram.com/nathanturismo','Link do Instagram'),
  ('footer_region',     'Búzios — RJ',                       'Texto do rodapé (região)');
