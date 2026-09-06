-- Migration: Fase 18 - Integração com WordPress
-- Tabela para armazenar as credenciais da integração com WordPress

CREATE TABLE IF NOT EXISTS public.integracoes_wordpress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  site_url text NOT NULL,
  username text NOT NULL,
  app_password text NOT NULL,
  conectado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.integracoes_wordpress ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Admins gerenciam integracoes wordpress" ON public.integracoes_wordpress FOR ALL USING (public.is_admin());
-- Os clientes não têm acesso a essa tabela diretamente, pois as actions de servidor que chamam o WordPress usam credenciais de admin ou service role, e se o cliente precisar da integração, ela será retornada pelo server-side auth (via `page.tsx` que envia para o frontend as props). Se decidirmos que o cliente vê a tabela, faremos select.
-- Vamos liberar SELECT para clientes donos do site, mas as credenciais não devem ser expostas se possível (porém precisamos delas no backend). O melhor é usar as server actions para ler os dados, mas como passaremos os dados de integração via props, os clientes precisam ler a tabela.
CREATE POLICY "Clientes veem sua integracao wordpress" ON public.integracoes_wordpress FOR SELECT USING (
  site_id IN (SELECT id FROM public.sites WHERE cliente_id = public.get_my_cliente_id())
);
