-- 1. Nova tabela para as integrações Master da Agência
CREATE TABLE public.integracoes_master (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo text NOT NULL CHECK (tipo IN ('cloudflare', 'google_search_console')),
  credenciais jsonb NOT NULL, -- Ex: { "api_token": "..." } ou { "access_token": "...", "refresh_token": "..." }
  ativo boolean DEFAULT true NOT NULL,
  atualizado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.integracoes_master ENABLE ROW LEVEL SECURITY;

-- 2. Adicionar os identificadores diretamente na tabela de sites
-- Como a chave mestra agora fica na agência, o site só precisa saber seu ID lá na API
ALTER TABLE public.sites
ADD COLUMN cloudflare_zone_id text,
ADD COLUMN gsc_propriedade text;

-- 3. Remover as tabelas antigas que exigiam token por site
-- CUIDADO: Se já houvessem dados reais, faríamos um script de migração.
-- Como é MVP, podemos dropar.
DROP TABLE IF EXISTS public.integracoes_cloudflare;
DROP TABLE IF EXISTS public.integracoes_google;
