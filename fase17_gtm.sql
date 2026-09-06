-- Criação da tabela integracoes_gtm
CREATE TABLE IF NOT EXISTS public.integracoes_gtm (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  container_id text NOT NULL,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  atualizado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cria a função de trigger caso ela não exista no seu Supabase
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers de timestamp
CREATE TRIGGER tr_integracoes_gtm_atualizado_em
  BEFORE UPDATE ON public.integracoes_gtm
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.integracoes_gtm ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'integracoes_gtm' AND policyname = 'Admins gerenciam integracoes gtm'
  ) THEN
    CREATE POLICY "Admins gerenciam integracoes gtm" ON public.integracoes_gtm FOR ALL USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'integracoes_gtm' AND policyname = 'Clientes leem integracoes gtm do seu site'
  ) THEN
    CREATE POLICY "Clientes leem integracoes gtm do seu site" ON public.integracoes_gtm FOR SELECT USING (
      site_id IN (SELECT id FROM public.sites WHERE cliente_id = public.get_my_cliente_id())
    );
  END IF;
END $$;
