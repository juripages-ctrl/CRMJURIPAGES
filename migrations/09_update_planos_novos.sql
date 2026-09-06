-- 1. Limpar as assinaturas e pagamentos de teste para podermos trocar os planos
DELETE FROM public.pagamentos;
DELETE FROM public.assinaturas;

-- 2. Limpar os planos antigos
DELETE FROM public.planos;

-- 3. Inserir os 3 novos Planos Oficiais
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
