-- Adiciona campo para chave da API do PageSpeed Insights
ALTER TABLE public.configuracoes_agencia
ADD COLUMN IF NOT EXISTS pagespeed_api_key text;
