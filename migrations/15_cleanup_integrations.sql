-- Migration: 15 - Limpeza de Integrações Inativas
-- Remove tabelas não utilizadas de integrações para limpar o banco de dados

DROP TABLE IF EXISTS public.integracoes_ga4 CASCADE;
DROP TABLE IF EXISTS public.integracoes_gtm CASCADE;
DROP TABLE IF EXISTS public.integracoes_clarity CASCADE;
DROP TABLE IF EXISTS public.integracoes_cloudflare CASCADE;

ALTER TABLE public.configuracoes_agencia 
  DROP COLUMN IF EXISTS clarity_api_token,
  DROP COLUMN IF EXISTS cloudflare_global_token;
