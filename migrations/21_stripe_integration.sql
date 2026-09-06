-- 1. Adicionar campos no Cliente (Customer no Stripe)
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- 2. Adicionar campos nos Planos (Product e Price no Stripe, e Lista de Features)
ALTER TABLE public.planos
  ADD COLUMN IF NOT EXISTS stripe_product_id text,
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]'::jsonb;

-- 3. Atualizar Assinaturas para permitir novos status (Stripe)
-- O CHECK atual permite: 'ativa', 'atrasada', 'cancelada'
-- O Stripe usa: active, past_due, unpaid, canceled, incomplete, incomplete_expired, trialing
-- Vamos dropar a constraint de CHECK para permitir que o webhook do Stripe insira o status real
-- Descobrindo e dropando a constraint (PostgreSQL não tem DROP CONSTRAINT IF EXISTS de forma simples sem PL/pgSQL, então faremos uma abordagem segura)
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.assinaturas'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) ILIKE '%status%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.assinaturas DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Agora adicionamos uma constraint atualizada (ou deixamos sem restrição rígida para facilitar webhooks)
ALTER TABLE public.assinaturas
  ADD CONSTRAINT assinaturas_status_check CHECK (status IN ('active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'ativa', 'atrasada', 'cancelada'));

-- 4. Criar View para facilitar a consulta de permissões do usuário logado
CREATE OR REPLACE VIEW public.vw_user_permissions AS
SELECT 
  s.id as site_id,
  c.id as cliente_id,
  c.stripe_customer_id,
  a.status as subscription_status,
  p.features,
  p.nome as plano_nome
FROM public.sites s
JOIN public.clientes c ON s.cliente_id = c.id
LEFT JOIN public.assinaturas a ON a.site_id = s.id
LEFT JOIN public.planos p ON a.plano_id = p.id;

-- 5. Atualizar RLS para permitir que o app consulte os planos livremente (se já não tiver)
-- Planos devem ser lidos por clientes para saberem os limites e comprarem
DROP POLICY IF EXISTS "Planos visiveis para todos" ON public.planos;
CREATE POLICY "Planos visiveis para todos" ON public.planos FOR SELECT USING (true);
