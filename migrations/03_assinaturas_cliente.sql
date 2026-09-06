-- 0. Dropar as políticas RLS que dependem do site_id ANTES de alterar a tabela
DROP POLICY IF EXISTS "Clientes veem suas assinaturas" ON public.assinaturas;
DROP POLICY IF EXISTS "Clientes veem seus pagamentos" ON public.pagamentos;

-- 1. Modificar a tabela de Planos para suportar os novos recursos
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS limite_sites integer DEFAULT 1 NOT NULL;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS recursos jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true NOT NULL;

-- 2. Modificar a tabela de Assinaturas (Pivotando de Site para Cliente)
ALTER TABLE public.assinaturas DROP CONSTRAINT IF EXISTS assinaturas_site_id_fkey;
ALTER TABLE public.assinaturas DROP COLUMN IF EXISTS site_id CASCADE;

ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS cliente_id uuid REFERENCES public.clientes(id);

-- Tornar cliente_id not null se houver necessidade (após limpar dados antigos se existirem)
-- O ideal num cenário real seria migrar os dados, mas aqui vamos apenas limpar para injetar os mocks novos.
DELETE FROM public.pagamentos;
DELETE FROM public.assinaturas;
ALTER TABLE public.assinaturas ALTER COLUMN cliente_id SET NOT NULL;


-- 3. Limpar planos antigos (se houver) e popular os 3 Planos de Suporte Solicitados
DELETE FROM public.planos;

INSERT INTO public.planos (nome, valor, periodicidade, limite_sites, recursos) VALUES
(
  'Plano Essencial', 
  120.00, 
  'mensal', 
  1, 
  '["Atualizações mensais: mantemos o site funcionando e seguro todo mês", "Backup semanal: se algo der errado, a gente recupera o site", "Suporte em horário comercial: se o site cair, respondemos em até 24h", "Segurança básica: proteção contra invasões e certificado de segurança (o cadeado verde do navegador)", "Checagem no Google: verificamos mensalmente se o site continua aparecendo direito nas buscas"]'::jsonb
),
(
  'Plano Profissional', 
  220.00, 
  'mensal', 
  1, 
  '["Atualizações quinzenais: a cada 15 dias, com mais agilidade", "Backup diário: proteção reforçada, não só semanal", "Suporte 7 dias por semana: resposta em até 6 horas", "Proteção extra contra ataques: camada adicional de segurança configurada no site", "Apoio com Google Ads: ajudamos a configurar seus anúncios pagos, caso queira investir em divulgação", "Blog incluso: publicamos até 6 textos por mês (você manda o texto pronto, a gente deixa formatado e no ar)", "Segurança para pagamentos: reforço pensado especialmente pra quem recebe pagamento pelo site", "Vídeo trimestral: a cada 3 meses, um vídeo curto mostrando tudo que foi feito no site"]'::jsonb
),
(
  'Plano Premium', 
  350.00, 
  'mensal', 
  1, 
  '["Atualizações semanais: prioridade máxima no atendimento", "Backup diário duplo: guardado em dois lugares diferentes, pra máxima segurança", "Monitoramento 24h: se o site cair, a gente já fica sabendo e corrige na hora", "Segurança avançada para pagamentos: proteção mais completa, com prioridade máxima", "Gestão de Google Ads: cuidamos da gestão contínua dos seus anúncios (o valor investido no anúncio é separado)", "Site mais rápido: testamos e melhoramos a velocidade todo mês, pra não perder cliente por demora no carregamento", "Blog e páginas ilimitadas dentro do plano: até 10 textos por mês, além de páginas novas quando precisar (ex: nova área de atuação)", "Vídeo mensal: todo mês, um vídeo mostrando exatamente o que foi feito, com apoio extra pra tutoriais rápidos"]'::jsonb
);

-- 4. Recriar as políticas RLS apontando diretamente para cliente_id
CREATE POLICY "Clientes veem suas assinaturas" ON public.assinaturas FOR SELECT USING (
  cliente_id = public.get_my_cliente_id()
);

CREATE POLICY "Clientes veem seus pagamentos" ON public.pagamentos FOR SELECT USING (
  assinatura_id IN (SELECT id FROM public.assinaturas WHERE cliente_id = public.get_my_cliente_id())
);
