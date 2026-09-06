-- ==============================================================================
-- Fase 13: Histórico e Anotações do Cliente
-- Execute este script no SQL Editor do Supabase do seu projeto.
-- ==============================================================================

CREATE TABLE public.notas_cliente (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  usuario_id uuid REFERENCES auth.users NOT NULL,
  conteudo text NOT NULL,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS
ALTER TABLE public.notas_cliente ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (RLS)
CREATE POLICY "Admins leem notas_cliente" ON public.notas_cliente FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins inserem notas_cliente" ON public.notas_cliente FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Apenas autor edita nota" ON public.notas_cliente FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Apenas autor exclui nota" ON public.notas_cliente FOR DELETE USING (auth.uid() = usuario_id);
