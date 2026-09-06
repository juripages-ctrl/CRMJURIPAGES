-- ==============================================================================
-- Fase 12: Monitoramento de Status (No Ar / Fora do Ar)
-- Execute este script no SQL Editor do Supabase do seu projeto.
-- ==============================================================================

-- 1. Remover a restrição atual de status
ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_status_check;

-- 2. Migrar os dados existentes (tudo que não for no_ar vira fora_do_ar por padrão)
UPDATE public.sites 
SET status = 'fora_do_ar' 
WHERE status != 'no_ar';

-- 3. Adicionar a nova restrição binária
ALTER TABLE public.sites 
ADD CONSTRAINT sites_status_check CHECK (status IN ('no_ar', 'fora_do_ar'));

-- 4. Alterar o valor padrão para fora_do_ar (até o site ser pingado e retornar 200)
ALTER TABLE public.sites ALTER COLUMN status SET DEFAULT 'fora_do_ar';
