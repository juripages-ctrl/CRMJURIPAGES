-- ==============================================================================
-- Fase 11: Equipe e Múltiplos Administradores (Cargos e Permissões)
-- Execute este script no SQL Editor do Supabase do seu projeto.
-- ==============================================================================

-- 1. Criação das Tabelas de Cargos e Permissões

CREATE TABLE public.cargos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL UNIQUE, -- ex: 'Administrador', 'Suporte', 'Web Design'
  descricao text,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.permissoes (
  id text PRIMARY KEY, -- ex: 'gerenciar_equipe', 'editar_site'
  descricao text NOT NULL,
  categoria text NOT NULL -- ex: 'Equipe', 'Sites', 'Financeiro'
);
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cargo_permissoes (
  cargo_id uuid REFERENCES public.cargos(id) ON DELETE CASCADE,
  permissao_id text REFERENCES public.permissoes(id) ON DELETE CASCADE,
  PRIMARY KEY (cargo_id, permissao_id)
);
ALTER TABLE public.cargo_permissoes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.logs_auditoria (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id uuid REFERENCES auth.users NOT NULL, -- Usuário que fez a ação
  acao text NOT NULL, -- Ex: 'CREATE', 'UPDATE', 'DELETE'
  entidade text NOT NULL, -- Ex: 'clientes', 'sites'
  entidade_id uuid, -- ID do registro afetado
  detalhes jsonb, -- Campos alterados ou detalhes extras
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

-- 2. Atualizar a tabela de usuarios
ALTER TABLE public.usuarios 
ADD COLUMN cargo_id uuid REFERENCES public.cargos(id);

-- 3. Seed dos Dados (População Inicial)

-- Inserindo Permissões
INSERT INTO public.permissoes (id, descricao, categoria) VALUES
  ('gerenciar_integracoes_globais', 'Configurar provedores e chaves mestras', 'Integrações'),
  ('gerenciar_equipe', 'Convidar ou remover membros da equipe', 'Equipe'),
  ('ver_clientes', 'Visualizar lista e detalhes de clientes', 'Clientes'),
  ('gerenciar_clientes', 'Criar, editar e excluir clientes', 'Clientes'),
  ('ver_sites', 'Visualizar lista e detalhes de sites e projetos', 'Sites'),
  ('gerenciar_sites', 'Criar, editar e alterar status de sites', 'Sites'),
  ('vincular_integracoes_site', 'Vincular GSC, Cloudflare e Hospedagem no site', 'Integrações'),
  ('ver_financeiro', 'Visualizar histórico financeiro e faturas', 'Financeiro'),
  ('gerenciar_financeiro', 'Gerar faturas e alterar planos', 'Financeiro'),
  ('ver_responder_chat', 'Visualizar e responder mensagens no chat', 'Chat');

-- Inserindo Cargos
INSERT INTO public.cargos (nome, descricao) VALUES
  ('Administrador', 'Acesso total ao sistema (Dono)'),
  ('Suporte', 'Atendimento a clientes e gestão técnica básica'),
  ('Web Design', 'Foco apenas na gestão e status de sites/projetos');

-- Relacionando Permissões ao Administrador (Todas)
INSERT INTO public.cargo_permissoes (cargo_id, permissao_id)
SELECT c.id, p.id
FROM public.cargos c, public.permissoes p
WHERE c.nome = 'Administrador';

-- Relacionando Permissões ao Suporte
INSERT INTO public.cargo_permissoes (cargo_id, permissao_id)
SELECT c.id, p.id
FROM public.cargos c, public.permissoes p
WHERE c.nome = 'Suporte' 
AND p.id IN (
  'ver_clientes', 'gerenciar_clientes', 
  'ver_sites', 'gerenciar_sites', 
  'vincular_integracoes_site', 
  'ver_financeiro', 
  'ver_responder_chat'
);

-- Relacionando Permissões ao Web Design
INSERT INTO public.cargo_permissoes (cargo_id, permissao_id)
SELECT c.id, p.id
FROM public.cargos c, public.permissoes p
WHERE c.nome = 'Web Design' 
AND p.id IN (
  'ver_clientes', 
  'ver_sites', 'gerenciar_sites'
);

-- 4. Função RLS e Políticas
-- Atualizar is_admin() para checar se tem uma permissão específica
CREATE OR REPLACE FUNCTION public.has_permission(required_permission text)
RETURNS boolean AS $$
BEGIN
  -- Se for Administrador (role='admin' na tabela antiga, ou cargo Administrador), tem acesso total.
  -- Para manter retrocompatibilidade com o role = 'admin', checamos o cargo.
  IF EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.cargos c ON u.cargo_id = c.id
    WHERE u.id = auth.uid() AND c.nome = 'Administrador'
  ) THEN
    RETURN true;
  END IF;

  -- Checa a permissão específica via tabela cargo_permissoes
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.cargo_permissoes cp ON u.cargo_id = cp.cargo_id
    WHERE u.id = auth.uid() AND cp.permissao_id = required_permission
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- OBS: Seus usuários atuais (com role = 'admin') ainda precisam receber o cargo_id do 'Administrador'.
-- Vamos fazer isso automaticamente para os admins atuais:
UPDATE public.usuarios
SET cargo_id = (SELECT id FROM public.cargos WHERE nome = 'Administrador' LIMIT 1)
WHERE role = 'admin' AND cargo_id IS NULL;

-- 5. Políticas RLS para as novas tabelas
CREATE POLICY "Admins leem cargos" ON public.cargos FOR SELECT USING (public.is_admin());
CREATE POLICY "Apenas admin edita cargos" ON public.cargos FOR ALL USING (public.has_permission('gerenciar_equipe'));

CREATE POLICY "Admins leem permissoes" ON public.permissoes FOR SELECT USING (public.is_admin());
CREATE POLICY "Apenas admin edita permissoes" ON public.permissoes FOR ALL USING (public.has_permission('gerenciar_equipe'));

CREATE POLICY "Admins leem cargo_permissoes" ON public.cargo_permissoes FOR SELECT USING (public.is_admin());
CREATE POLICY "Apenas admin edita cargo_permissoes" ON public.cargo_permissoes FOR ALL USING (public.has_permission('gerenciar_equipe'));

CREATE POLICY "Admins leem logs" ON public.logs_auditoria FOR SELECT USING (public.is_admin());
CREATE POLICY "Sistema insere logs" ON public.logs_auditoria FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Para aplicar totalmente as novas permissões, teríamos que recriar as policies das tabelas atuais 
-- (clientes, sites, pagamentos) usando has_permission('permissao_x').
-- Por enquanto, is_admin() continua existindo para não quebrar o app atual.
