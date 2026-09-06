-- Adiciona a coluna avatar_url na tabela clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS avatar_url text;
