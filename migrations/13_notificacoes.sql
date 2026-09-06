-- Migration: 13 - Tabela de Notificações do CRM

CREATE TABLE IF NOT EXISTS public.notificacoes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  mensagem text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('pagamento', 'seo', 'wordpress', 'blog', 'geral')),
  link text,
  lida boolean DEFAULT false NOT NULL,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Usuarios leem suas proprias notificacoes" 
  ON public.notificacoes FOR SELECT USING (auth.uid() = usuario_id OR public.is_admin());

CREATE POLICY "Usuarios atualizam suas proprias notificacoes" 
  ON public.notificacoes FOR UPDATE USING (auth.uid() = usuario_id OR public.is_admin());

CREATE POLICY "Admins e sistema inserem notificacoes" 
  ON public.notificacoes FOR INSERT WITH CHECK (true);
