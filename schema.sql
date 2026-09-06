-- Fase 2: Banco de Dados (Supabase CRM)
-- Execute este script inteiro no SQL Editor do Supabase (https://supabase.com/dashboard/project/_/sql/new)

-- 1. Tabela: usuarios
CREATE TABLE public.usuarios (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('admin', 'cliente')),
  cliente_id uuid, -- Será criado como FK após criarmos a tabela de clientes
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 2. Tabela: clientes
CREATE TABLE public.clientes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  telefone_whatsapp text,
  empresa text,
  criado_por uuid REFERENCES public.usuarios(id),
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Atualizar a FK circular em usuarios agora que clientes existe
ALTER TABLE public.usuarios ADD CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- 3. Tabela: sites
CREATE TABLE public.sites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid REFERENCES public.clientes(id) NOT NULL,
  nome text NOT NULL,
  dominio text NOT NULL,
  status text NOT NULL DEFAULT 'em_producao' CHECK (status IN ('em_producao', 'no_ar', 'pausado')),
  plano text,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- 4. Tabela: provedores (catálogo base)
CREATE TABLE public.provedores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chave text NOT NULL UNIQUE,
  nome_exibicao text NOT NULL,
  tipo_auth text NOT NULL CHECK (tipo_auth IN ('api_token', 'api_key_secret', 'oauth2')),
  url_documentacao text,
  ativo boolean DEFAULT true NOT NULL
);

ALTER TABLE public.provedores ENABLE ROW LEVEL SECURITY;

-- Seed: Popular provedores iniciais
INSERT INTO public.provedores (chave, nome_exibicao, tipo_auth) VALUES
  ('hostinger', 'Hostinger', 'api_token'),
  ('vercel', 'Vercel', 'api_token'),
  ('netlify', 'Netlify', 'api_token'),
  ('digitalocean', 'DigitalOcean', 'api_token'),
  ('aws', 'AWS', 'api_key_secret'),
  ('render', 'Render', 'api_token'),
  ('railway', 'Railway', 'api_token'),
  ('cpanel', 'cPanel / WHM', 'api_key_secret'),
  ('outro', 'Outro (Personalizado)', 'api_token');

-- 5. Tabelas de Integrações
CREATE TABLE public.integracoes_google (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES public.sites(id) NOT NULL,
  access_token text NOT NULL, -- Deverá ser salvo encriptado no backend real
  refresh_token text NOT NULL,
  propriedade_search_console text,
  conectado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.integracoes_cloudflare (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES public.sites(id) NOT NULL,
  api_token text NOT NULL,
  zone_id text,
  conectado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.integracoes_hospedagem (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES public.sites(id) NOT NULL,
  provedor_id uuid REFERENCES public.provedores(id) NOT NULL,
  apelido text,
  credenciais jsonb NOT NULL,
  status text DEFAULT 'ativo' CHECK (status IN ('ativo', 'erro', 'desconectado')),
  conectado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  ultima_verificacao timestamp with time zone
);

CREATE TABLE public.integracoes_wordpress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  site_url text NOT NULL,
  username text NOT NULL,
  app_password text NOT NULL,
  conectado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.integracoes_google ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integracoes_cloudflare ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integracoes_hospedagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integracoes_wordpress ENABLE ROW LEVEL SECURITY;

-- 6. Tabela: mensagens (Chat)
CREATE TABLE public.mensagens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid REFERENCES public.clientes(id) NOT NULL,
  remetente text NOT NULL CHECK (remetente IN ('cliente', 'admin')),
  texto text NOT NULL,
  lida boolean DEFAULT false NOT NULL,
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- 7. Tabelas de Assinaturas e Pagamentos (Asaas)
CREATE TABLE public.planos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  valor numeric NOT NULL,
  periodicidade text NOT NULL CHECK (periodicidade IN ('mensal', 'anual', 'unico'))
);

CREATE TABLE public.assinaturas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES public.sites(id) NOT NULL,
  plano_id uuid REFERENCES public.planos(id) NOT NULL,
  gateway text NOT NULL DEFAULT 'asaas',
  gateway_subscription_id text,
  status text NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'atrasada', 'cancelada')),
  proxima_cobranca date
);

CREATE TABLE public.pagamentos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assinatura_id uuid REFERENCES public.assinaturas(id) NOT NULL,
  valor numeric NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente', 'falhou')),
  metodo text NOT NULL CHECK (metodo IN ('cartao', 'pix', 'boleto')),
  criado_em timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- Políticas RLS (Row Level Security) - Modelo de Acesso Seguro
-- ==============================================================================
-- Admins veem tudo. Clientes veem apenas o que for deles.

-- Função utilitária para checar se o usuário logado é Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função utilitária para pegar o cliente_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_my_cliente_id()
RETURNS uuid AS $$
  SELECT cliente_id FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Políticas: Clientes
CREATE POLICY "Admins podem ver todos os clientes" ON public.clientes FOR ALL USING (public.is_admin());
CREATE POLICY "Clientes veem apenas seu proprio registro" ON public.clientes FOR SELECT USING (id = public.get_my_cliente_id());

-- 2. Políticas: Sites
CREATE POLICY "Admins podem ver e editar todos os sites" ON public.sites FOR ALL USING (public.is_admin());
CREATE POLICY "Clientes veem apenas seus proprios sites" ON public.sites FOR SELECT USING (cliente_id = public.get_my_cliente_id());

CREATE POLICY "Admins gerenciam integracoes hospedagem" ON public.integracoes_hospedagem FOR ALL USING (public.is_admin());
CREATE POLICY "Admins gerenciam integracoes google" ON public.integracoes_google FOR ALL USING (public.is_admin());
CREATE POLICY "Admins gerenciam integracoes cloudflare" ON public.integracoes_cloudflare FOR ALL USING (public.is_admin());
CREATE POLICY "Admins gerenciam integracoes wordpress" ON public.integracoes_wordpress FOR ALL USING (public.is_admin());
CREATE POLICY "Clientes veem sua integracao wordpress" ON public.integracoes_wordpress FOR SELECT USING (
  site_id IN (SELECT id FROM public.sites WHERE cliente_id = public.get_my_cliente_id())
);

-- 4. Políticas: Provedores (Leitura para todos, escrita admin)
CREATE POLICY "Provedores publicos para leitura" ON public.provedores FOR SELECT USING (true);
CREATE POLICY "Apenas admin edita provedores" ON public.provedores FOR ALL USING (public.is_admin());

-- 5. Políticas: Mensagens
CREATE POLICY "Admins veem todas as mensagens" ON public.mensagens FOR ALL USING (public.is_admin());
CREATE POLICY "Clientes veem e enviam mensagens do seu ID" ON public.mensagens FOR SELECT USING (cliente_id = public.get_my_cliente_id());
CREATE POLICY "Clientes inserem mensagens" ON public.mensagens FOR INSERT WITH CHECK (cliente_id = public.get_my_cliente_id() AND remetente = 'cliente');

-- 6. Políticas: Pagamentos/Assinaturas
CREATE POLICY "Admins gerenciam planos e assinaturas" ON public.planos FOR ALL USING (public.is_admin());
CREATE POLICY "Admins gerenciam pagamentos e assinaturas" ON public.assinaturas FOR ALL USING (public.is_admin());
CREATE POLICY "Admins gerenciam pagamentos" ON public.pagamentos FOR ALL USING (public.is_admin());

CREATE POLICY "Clientes veem suas assinaturas" ON public.assinaturas FOR SELECT USING (
  site_id IN (SELECT id FROM public.sites WHERE cliente_id = public.get_my_cliente_id())
);
CREATE POLICY "Clientes veem seus pagamentos" ON public.pagamentos FOR SELECT USING (
  assinatura_id IN (SELECT id FROM public.assinaturas WHERE site_id IN (SELECT id FROM public.sites WHERE cliente_id = public.get_my_cliente_id()))
);

-- ==============================================================================
-- Fim do Script
-- ==============================================================================
