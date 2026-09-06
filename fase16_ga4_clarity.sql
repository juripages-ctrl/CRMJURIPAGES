-- Fase 16: Integração GA4 e Microsoft Clarity
-- Este script adiciona o suporte para as novas APIs de analytics ao sistema.

-- 1. Adicionar o token master da API do Microsoft Clarity na tabela de configuracoes
ALTER TABLE public.configuracoes_agencia ADD COLUMN IF NOT EXISTS clarity_api_token text;

-- 2. Tabela: integracoes_ga4
CREATE TABLE IF NOT EXISTS public.integracoes_ga4 (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES public.sites(id) NOT NULL,
  property_id text NOT NULL, -- O 'Property ID' numérico do GA4 (ex: 123456789)
  conectado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS e criar políticas para integracoes_ga4
ALTER TABLE public.integracoes_ga4 ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'integracoes_ga4' AND policyname = 'Admins gerenciam integracoes ga4'
  ) THEN
    CREATE POLICY "Admins gerenciam integracoes ga4" ON public.integracoes_ga4 FOR ALL USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'integracoes_ga4' AND policyname = 'Clientes leem integracoes ga4 do seu site'
  ) THEN
    CREATE POLICY "Clientes leem integracoes ga4 do seu site" ON public.integracoes_ga4 FOR SELECT USING (
      site_id IN (SELECT id FROM public.sites WHERE cliente_id = public.get_my_cliente_id())
    );
  END IF;
END $$;

-- 3. Tabela: integracoes_clarity
CREATE TABLE IF NOT EXISTS public.integracoes_clarity (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES public.sites(id) NOT NULL,
  project_id text NOT NULL, -- O ID alfanumérico do projeto no Clarity
  conectado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS e criar políticas para integracoes_clarity
ALTER TABLE public.integracoes_clarity ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'integracoes_clarity' AND policyname = 'Admins gerenciam integracoes clarity'
  ) THEN
    CREATE POLICY "Admins gerenciam integracoes clarity" ON public.integracoes_clarity FOR ALL USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'integracoes_clarity' AND policyname = 'Clientes leem integracoes clarity do seu site'
  ) THEN
    CREATE POLICY "Clientes leem integracoes clarity do seu site" ON public.integracoes_clarity FOR SELECT USING (
      site_id IN (SELECT id FROM public.sites WHERE cliente_id = public.get_my_cliente_id())
    );
  END IF;
END $$;

-- Atualizar as tabelas antigas de integração (Google e Cloudflare) para permitir leitura pelos clientes, se ainda não estiver configurado
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'integracoes_google' AND policyname = 'Clientes leem integracoes google do seu site'
  ) THEN
    CREATE POLICY "Clientes leem integracoes google do seu site" ON public.integracoes_google FOR SELECT USING (
      site_id IN (SELECT id FROM public.sites WHERE cliente_id = public.get_my_cliente_id())
    );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'integracoes_cloudflare' AND policyname = 'Clientes leem integracoes cloudflare do seu site'
  ) THEN
    CREATE POLICY "Clientes leem integracoes cloudflare do seu site" ON public.integracoes_cloudflare FOR SELECT USING (
      site_id IN (SELECT id FROM public.sites WHERE cliente_id = public.get_my_cliente_id())
    );
  END IF;
END $$;
