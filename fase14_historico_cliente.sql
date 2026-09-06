-- ============================================================================
-- FASE 14 - CORREÇÃO: Vinculação de Cliente ao Login
-- ============================================================================
-- PROBLEMA: Quando o admin vincula um site a um cliente (ex: Renata), 
-- e o campo "E-mail de Acesso" é preenchido, o sistema tenta dar UPDATE 
-- na tabela 'usuarios' para setar o cliente_id. Porém, a política RLS 
-- da tabela 'usuarios' NÃO permite que nenhum perfil (nem admin, nem cliente) 
-- faça UPDATE nessa tabela. Logo o vínculo NUNCA acontece silenciosamente.
--
-- SOLUÇÃO: 
-- 1. Criar política RLS permitindo que admins atualizem qualquer registro em 'usuarios'.
-- 2. Adicionar coluna 'visivel_cliente' em notas_cliente para controlar visibilidade.
-- 3. Criar políticas para que clientes vejam seus sites e notas marcadas como visíveis.
-- ============================================================================

-- ===========================
-- 1. TABELA notas_cliente
-- ===========================
ALTER TABLE public.notas_cliente ADD COLUMN IF NOT EXISTS visivel_cliente boolean DEFAULT false;

-- ===========================
-- 2. TABELA usuarios - CORRIGIR RLS (A CAUSA RAIZ DO BUG)
-- ===========================
-- Atualmente NÃO existe nenhuma política de UPDATE/ALL na tabela 'usuarios' para admins.
-- Isso faz com que a linha:
--   supabase.from('usuarios').update({ cliente_id: X }).eq('email', 'renata@...')
-- FALHE SILENCIOSAMENTE (0 rows affected), pois o Supabase bloqueia via RLS.

-- Política para admins gerenciarem todos os registros de usuarios
DROP POLICY IF EXISTS "Admins gerenciam usuarios" ON public.usuarios;
CREATE POLICY "Admins gerenciam usuarios" ON public.usuarios FOR ALL USING (public.is_admin());

-- Política para o próprio usuário poder ler seu registro (já deve existir via 'select *')
DROP POLICY IF EXISTS "Usuarios leem proprio registro" ON public.usuarios;
CREATE POLICY "Usuarios leem proprio registro" ON public.usuarios FOR SELECT USING (id = auth.uid());

-- ===========================
-- 3. TABELA sites - Garantir que clientes vejam seus sites
-- ===========================
-- (Já existe no schema original, mas reforçamos caso tenha sido perdida)
DROP POLICY IF EXISTS "Clientes veem proprios sites" ON public.sites;
CREATE POLICY "Clientes veem proprios sites" ON public.sites FOR SELECT USING (
  cliente_id = public.get_my_cliente_id()
);

-- ===========================
-- 4. TABELA notas_cliente - Permitir que clientes vejam notas marcadas como visíveis
-- ===========================
DROP POLICY IF EXISTS "Clientes veem notas visiveis" ON public.notas_cliente;
CREATE POLICY "Clientes veem notas visiveis" ON public.notas_cliente FOR SELECT USING (
  visivel_cliente = true AND
  cliente_id IN (SELECT cliente_id FROM public.usuarios WHERE id = auth.uid() AND role = 'cliente')
);

-- ===========================
-- 5. TABELAS integracoes - Permitir que clientes leiam integrações dos seus sites
-- ===========================
-- Sem estas políticas, o join `integracoes_google(*)` retorna vazio para clientes,
-- fazendo o dashboard mostrar "Google Search Console não vinculado".

DROP POLICY IF EXISTS "Clientes veem integracoes google" ON public.integracoes_google;
CREATE POLICY "Clientes veem integracoes google" ON public.integracoes_google FOR SELECT USING (
  site_id IN (SELECT id FROM public.sites WHERE cliente_id = public.get_my_cliente_id())
);

DROP POLICY IF EXISTS "Clientes veem integracoes cloudflare" ON public.integracoes_cloudflare;
CREATE POLICY "Clientes veem integracoes cloudflare" ON public.integracoes_cloudflare FOR SELECT USING (
  site_id IN (SELECT id FROM public.sites WHERE cliente_id = public.get_my_cliente_id())
);

-- ===========================
-- 6. TABELA configuracoes_agencia - Permitir leitura para clientes autenticados
-- ===========================
-- As server actions (fetchGscAnalytics, fetchCfAnalytics) leem o gsc_refresh_token
-- e cloudflare_api_token dessa tabela. Como rodam no contexto do usuário logado (RLS),
-- quando um cliente chama essas actions, a query falha silenciosamente porque
-- só admins tinham acesso. Precisamos permitir SELECT para qualquer usuário autenticado.

DROP POLICY IF EXISTS "Usuarios autenticados leem config agencia" ON public.configuracoes_agencia;
CREATE POLICY "Usuarios autenticados leem config agencia" ON public.configuracoes_agencia
  FOR SELECT USING (auth.uid() IS NOT NULL);
