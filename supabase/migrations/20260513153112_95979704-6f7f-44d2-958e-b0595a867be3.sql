
-- LEADS
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  origem TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_telefone ON public.leads(telefone);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can read leads" ON public.leads FOR SELECT USING (true);

-- CUPONS
CREATE TABLE public.cupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone TEXT NOT NULL,
  email TEXT,
  codigo TEXT NOT NULL,
  desconto_percentual INT NOT NULL DEFAULT 10,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em TIMESTAMPTZ NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT false,
  usado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cupons_telefone ON public.cupons(telefone);
CREATE INDEX idx_cupons_codigo ON public.cupons(codigo);
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert cupons" ON public.cupons FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can read cupons" ON public.cupons FOR SELECT USING (true);
CREATE POLICY "anyone can update cupons" ON public.cupons FOR UPDATE USING (true) WITH CHECK (true);

-- RESERVAS
CREATE TABLE public.reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  destino TEXT NOT NULL,
  data_viagem DATE,
  passageiros INT,
  cupom_aplicado TEXT,
  valor_original NUMERIC(10,2),
  valor_com_desconto NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reservas_telefone ON public.reservas(telefone);
CREATE INDEX idx_reservas_status ON public.reservas(status);
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert reservas" ON public.reservas FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can read reservas" ON public.reservas FOR SELECT USING (true);
CREATE POLICY "anyone can update reservas" ON public.reservas FOR UPDATE USING (true) WITH CHECK (true);
