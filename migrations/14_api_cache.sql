-- 14_api_cache.sql
-- Tabela para armazenar cache de APIs externas (GSC, WordPress, etc)

CREATE TABLE IF NOT EXISTS public.api_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    cache_key TEXT NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar um índice composto para busca rápida
CREATE UNIQUE INDEX IF NOT EXISTS api_cache_site_key_idx ON public.api_cache(site_id, cache_key);

-- Habilitar RLS
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Admins podem ler e escrever no cache de qualquer site"
ON public.api_cache FOR ALL
TO authenticated
USING ( (SELECT role FROM public.usuarios WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Clientes podem ler o cache dos seus próprios sites"
ON public.api_cache FOR SELECT
TO authenticated
USING (
    site_id IN (
        SELECT id FROM public.sites WHERE cliente_id = (SELECT cliente_id FROM public.usuarios WHERE id = auth.uid())
    )
);

CREATE POLICY "Clientes podem atualizar o cache dos seus próprios sites (via refresh)"
ON public.api_cache FOR ALL
TO authenticated
USING (
    site_id IN (
        SELECT id FROM public.sites WHERE cliente_id = (SELECT cliente_id FROM public.usuarios WHERE id = auth.uid())
    )
)
WITH CHECK (
    site_id IN (
        SELECT id FROM public.sites WHERE cliente_id = (SELECT cliente_id FROM public.usuarios WHERE id = auth.uid())
    )
);
