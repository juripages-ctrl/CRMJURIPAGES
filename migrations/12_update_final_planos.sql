-- 0. Atualizar a restrição (Check Constraint) para permitir planos semestrais
ALTER TABLE public.planos DROP CONSTRAINT IF EXISTS planos_periodicidade_check;
ALTER TABLE public.planos ADD CONSTRAINT planos_periodicidade_check CHECK (periodicidade IN ('mensal', 'semestral', 'anual', 'unico'));

-- 1. Limpar assinaturas de teste para não haver violação de chave estrangeira
DELETE FROM public.pagamentos;
DELETE FROM public.assinaturas;

-- 2. Limpar todos os planos existentes
DELETE FROM public.planos;

-- 3. Inserir os Planos Essenciais (Mensal, Semestral, Anual)
INSERT INTO public.planos (nome, valor, periodicidade, limite_sites, recursos) VALUES
(
  'Plano Essencial', 120.00, 'mensal', 1, 
  '["Atualizações mensais: o site é atualizado uma vez por mês", "Backup semanal: cópia de segurança feita toda semana", "Suporte em horário comercial: resposta em até 24h se o site cair", "Segurança básica: certificado SSL (cadeado verde) e atualizações de segurança do sistema (CMS e plugins) aplicadas periodicamente", "Checagem no Google: verificação mensal de que o site continua aparecendo nas buscas"]'::jsonb
),
(
  'Plano Essencial', 650.00, 'semestral', 1, 
  '["Atualizações mensais: o site é atualizado uma vez por mês", "Backup semanal: cópia de segurança feita toda semana", "Suporte em horário comercial: resposta em até 24h se o site cair", "Segurança básica: certificado SSL (cadeado verde) e atualizações de segurança do sistema (CMS e plugins) aplicadas periodicamente", "Checagem no Google: verificação mensal de que o site continua aparecendo nas buscas"]'::jsonb
),
(
  'Plano Essencial', 1150.00, 'anual', 1, 
  '["Atualizações mensais: o site é atualizado uma vez por mês", "Backup semanal: cópia de segurança feita toda semana", "Suporte em horário comercial: resposta em até 24h se o site cair", "Segurança básica: certificado SSL (cadeado verde) e atualizações de segurança do sistema (CMS e plugins) aplicadas periodicamente", "Checagem no Google: verificação mensal de que o site continua aparecendo nas buscas"]'::jsonb
);

-- 4. Inserir os Planos Profissionais (Mensal, Semestral, Anual)
INSERT INTO public.planos (nome, valor, periodicidade, limite_sites, recursos) VALUES
(
  'Plano Profissional', 220.00, 'mensal', 3, 
  '["Atualização de conteúdo: a cada 15 dias, atualizamos páginas, números (telefone, WhatsApp, endereço) e informações gerais do escritório no site", "Backup diário: cópia de segurança feita todos os dias", "Suporte 7 dias por semana: resposta em até 6 horas", "Segurança avançada: firewall (WAF), monitoramento de malware, verificação de vulnerabilidades e atualizações regulares do sistema e plugins", "SEO (otimização para buscas): ajustes básicos pra ajudar o site a aparecer melhor nas buscas do Google (títulos, descrições, palavras-chave das páginas)", "Atualização de blog: até 6 textos publicados por mês (você envia o texto pronto)"]'::jsonb
),
(
  'Plano Profissional', 1180.00, 'semestral', 3, 
  '["Atualização de conteúdo: a cada 15 dias, atualizamos páginas, números (telefone, WhatsApp, endereço) e informações gerais do escritório no site", "Backup diário: cópia de segurança feita todos os dias", "Suporte 7 dias por semana: resposta em até 6 horas", "Segurança avançada: firewall (WAF), monitoramento de malware, verificação de vulnerabilidades e atualizações regulares do sistema e plugins", "SEO (otimização para buscas): ajustes básicos pra ajudar o site a aparecer melhor nas buscas do Google (títulos, descrições, palavras-chave das páginas)", "Atualização de blog: até 6 textos publicados por mês (você envia o texto pronto)"]'::jsonb
),
(
  'Plano Profissional', 2100.00, 'anual', 3, 
  '["Atualização de conteúdo: a cada 15 dias, atualizamos páginas, números (telefone, WhatsApp, endereço) e informações gerais do escritório no site", "Backup diário: cópia de segurança feita todos os dias", "Suporte 7 dias por semana: resposta em até 6 horas", "Segurança avançada: firewall (WAF), monitoramento de malware, verificação de vulnerabilidades e atualizações regulares do sistema e plugins", "SEO (otimização para buscas): ajustes básicos pra ajudar o site a aparecer melhor nas buscas do Google (títulos, descrições, palavras-chave das páginas)", "Atualização de blog: até 6 textos publicados por mês (você envia o texto pronto)"]'::jsonb
);

-- 5. Inserir os Planos Premium (Mensal, Semestral, Anual)
INSERT INTO public.planos (nome, valor, periodicidade, limite_sites, recursos) VALUES
(
  'Plano Premium', 350.00, 'mensal', 12, 
  '["Atualização de conteúdo: toda semana, atualizamos páginas, números e informações gerais do escritório no site, com prioridade máxima no atendimento", "Backup diário duplo: guardado em dois lugares diferentes", "Monitoramento 24h: aviso e correção imediata se o site cair", "Segurança avançada e prioritária: firewall (WAF) de alta capacidade, monitoramento contínuo de malware e vulnerabilidades, atualizações do sistema aplicadas com prioridade assim que disponíveis, com resposta prioritária em caso de incidente de segurança", "Otimização para campanhas: ajustes na landing page (velocidade, textos, botões de conversão) para melhorar performance de campanhas de tráfego pago. Não inclui gestão ou criação dos anúncios", "SEO (otimização para buscas): acompanhamento contínuo, incluindo os textos do blog e páginas novas, pra melhorar o posicionamento do site no Google mês a mês", "Relatório de performance: todo mês, cruzamos dados do Microsoft Clarity (gravação de visitantes), Google Search Console e Cloudflare, com recomendações práticas de melhoria. O cliente tem acesso às gravações do Clarity", "Atualização de blog: até 12 publicações por mês (textos enviados pelo cliente). Volumes acima disso são orçados à parte, sob consulta. Caso deseje que a agência escreva o conteúdo, há taxa adicional sob consulta", "Criação de páginas novas: até 4 páginas novas por mês. Volumes acima disso são orçados à parte, sob consulta"]'::jsonb
),
(
  'Plano Premium', 1890.00, 'semestral', 12, 
  '["Atualização de conteúdo: toda semana, atualizamos páginas, números e informações gerais do escritório no site, com prioridade máxima no atendimento", "Backup diário duplo: guardado em dois lugares diferentes", "Monitoramento 24h: aviso e correção imediata se o site cair", "Segurança avançada e prioritária: firewall (WAF) de alta capacidade, monitoramento contínuo de malware e vulnerabilidades, atualizações do sistema aplicadas com prioridade assim que disponíveis, com resposta prioritária em caso de incidente de segurança", "Otimização para campanhas: ajustes na landing page (velocidade, textos, botões de conversão) para melhorar performance de campanhas de tráfego pago. Não inclui gestão ou criação dos anúncios", "SEO (otimização para buscas): acompanhamento contínuo, incluindo os textos do blog e páginas novas, pra melhorar o posicionamento do site no Google mês a mês", "Relatório de performance: todo mês, cruzamos dados do Microsoft Clarity (gravação de visitantes), Google Search Console e Cloudflare, com recomendações práticas de melhoria. O cliente tem acesso às gravações do Clarity", "Atualização de blog: até 12 publicações por mês (textos enviados pelo cliente). Volumes acima disso são orçados à parte, sob consulta. Caso deseje que a agência escreva o conteúdo, há taxa adicional sob consulta", "Criação de páginas novas: até 4 páginas novas por mês. Volumes acima disso são orçados à parte, sob consulta"]'::jsonb
),
(
  'Plano Premium', 3360.00, 'anual', 12, 
  '["Atualização de conteúdo: toda semana, atualizamos páginas, números e informações gerais do escritório no site, com prioridade máxima no atendimento", "Backup diário duplo: guardado em dois lugares diferentes", "Monitoramento 24h: aviso e correção imediata se o site cair", "Segurança avançada e prioritária: firewall (WAF) de alta capacidade, monitoramento contínuo de malware e vulnerabilidades, atualizações do sistema aplicadas com prioridade assim que disponíveis, com resposta prioritária em caso de incidente de segurança", "Otimização para campanhas: ajustes na landing page (velocidade, textos, botões de conversão) para melhorar performance de campanhas de tráfego pago. Não inclui gestão ou criação dos anúncios", "SEO (otimização para buscas): acompanhamento contínuo, incluindo os textos do blog e páginas novas, pra melhorar o posicionamento do site no Google mês a mês", "Relatório de performance: todo mês, cruzamos dados do Microsoft Clarity (gravação de visitantes), Google Search Console e Cloudflare, com recomendações práticas de melhoria. O cliente tem acesso às gravações do Clarity", "Atualização de blog: até 12 publicações por mês (textos enviados pelo cliente). Volumes acima disso são orçados à parte, sob consulta. Caso deseje que a agência escreva o conteúdo, há taxa adicional sob consulta", "Criação de páginas novas: até 4 páginas novas por mês. Volumes acima disso são orçados à parte, sob consulta"]'::jsonb
);
