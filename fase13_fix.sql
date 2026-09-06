-- Execute no SQL Editor do Supabase
-- Corrige a tabela notas_cliente para apontar para a tabela correta de usuários

DROP TABLE IF EXISTS public.notas_cliente CASCADE;

CREATE TABLE public.notas_cliente (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  usuario_id uuid REFERENCES public.usuarios(id) ON DELETE CASCADE NOT NULL,
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
