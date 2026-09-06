-- Tabela para armazenar as credenciais Master da Agência
CREATE TABLE IF NOT EXISTS public.configuracoes_agencia (
  id integer PRIMARY KEY DEFAULT 1,
  cloudflare_api_token text,
  gsc_refresh_token text,
  atualizado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.configuracoes_agencia ENABLE ROW LEVEL SECURITY;

-- Como só existe uma agência, apenas administradores podem ver ou editar a linha de ID 1
CREATE POLICY "Admins podem gerenciar config da agencia" ON public.configuracoes_agencia
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role = 'admin')
  );

-- Inserir a linha inicial vazia se não existir
INSERT INTO public.configuracoes_agencia (id) VALUES (1) ON CONFLICT DO NOTHING;
