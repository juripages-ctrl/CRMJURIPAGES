-- Fase 0: Banco de dados do Agente Juju
-- Execute este script no SQL Editor do Supabase


-- 2. Tabela: roteiros_blog
CREATE TABLE public.roteiros_blog (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  autor_id uuid REFERENCES public.usuarios(id) NOT NULL,
  origem text NOT NULL CHECK (origem IN ('manual', 'ia')),
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_elaboracao', 'pronto_para_revisao', 'publicado')),
  titulo text,
  conteudo text,
  categoria_wp_id integer,
  imagem_url text,
  provedor_ia text CHECK (provedor_ia IN ('gemini', 'anthropic')),
  wp_post_id integer,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  atualizado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.roteiros_blog ENABLE ROW LEVEL SECURITY;

-- Índices para busca
CREATE INDEX idx_roteiros_blog_cliente_id ON public.roteiros_blog(cliente_id);
CREATE INDEX idx_roteiros_blog_site_id ON public.roteiros_blog(site_id);

-- 3. Tabela: roteiros_conversas
CREATE TABLE public.roteiros_conversas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  roteiro_id uuid REFERENCES public.roteiros_blog(id) ON DELETE CASCADE NOT NULL,
  historico_mensagens jsonb DEFAULT '[]'::jsonb NOT NULL,
  contexto_coletado jsonb DEFAULT '{}'::jsonb NOT NULL,
  atualizado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.roteiros_conversas ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
-- Admins veem e gerenciam tudo
CREATE POLICY "Admins gerenciam todos os roteiros de blog" ON public.roteiros_blog FOR ALL USING (public.is_admin());
CREATE POLICY "Admins gerenciam todas as conversas de roteiro" ON public.roteiros_conversas FOR ALL USING (public.is_admin());

-- Clientes veem e gerenciam apenas seus roteiros (filtrando pelo cliente_id em roteiros_blog)
CREATE POLICY "Clientes gerenciam seus roteiros" ON public.roteiros_blog FOR ALL 
USING (cliente_id = public.get_my_cliente_id()) 
WITH CHECK (cliente_id = public.get_my_cliente_id());

CREATE POLICY "Clientes gerenciam conversas dos seus roteiros" ON public.roteiros_conversas FOR ALL 
USING (roteiro_id IN (SELECT id FROM public.roteiros_blog WHERE cliente_id = public.get_my_cliente_id()))
WITH CHECK (roteiro_id IN (SELECT id FROM public.roteiros_blog WHERE cliente_id = public.get_my_cliente_id()));

-- ==============================================================================
-- Fim do Script
-- ==============================================================================
