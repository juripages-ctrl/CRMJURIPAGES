-- Adicionar controles de isenção de pagamento na tabela assinaturas
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS isento_pagamento boolean DEFAULT false NOT NULL;
ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS isencao_fim date;

-- Comentários para o banco de dados
COMMENT ON COLUMN public.assinaturas.isento_pagamento IS 'Se true, o cliente não será cobrado.';
COMMENT ON COLUMN public.assinaturas.isencao_fim IS 'Data em que a isenção acaba. Se nulo e isento_pagamento for true, a isenção é vitalícia.';
