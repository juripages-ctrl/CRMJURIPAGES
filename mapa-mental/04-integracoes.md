# Integrações Técnicas

O JuriPages CRM centraliza diversas integrações em painéis administrativos, extraindo dados sem expor senhas ao cliente.

## 1. Google Search Console (GSC)
- **Objetivo:** Fornecer relatórios de desempenho de SEO (cliques, impressões, CTR).
- **Funcionamento:** Autenticação via OAuth2, armazenando `access_token` e `refresh_token` criptografados.
- **Visibilidade:** O cliente tem acesso a gráficos baseados nos dados buscados via API no dashboard dele.

## 2. Hospedagens Genéricas
- **Objetivo:** Registrar onde o site está hospedado e as senhas de acesso (API Keys, Tokens).
- **Funcionamento:** Utiliza um catálogo na tabela `provedores` (Hostinger, AWS, Netlify, Vercel). O formato da credencial muda dinamicamente via JSONB criptografado de acordo com o provedor.

## 3. API Cache
- **Otimização:** As chamadas de APIs externas recebem armazenamento em cache (`api_cache`) para acelerar o dashboard.

## 4. WordPress (API REST & Mu-Plugin)
- **Objetivo:** Gestão de conteúdo do Blog sem acessar o `/wp-admin`, e visualização do status técnico da infra.
- **Funcionamento (Agência):**
  - **Conexão:** Requer o Usuário Admin e a "Application Password" do WordPress.
  - **Dashboard:** Através de um Mu-Plugin customizado (`dashboard-status-endpoint.php`), a agência visualiza dados de versão do WP, PHP, Cron, atualizações pendentes de temas/plugins e log de ações (via Simple History).
- **Funcionamento (Cliente):**
  - O cliente tem uma visão focada em **Blog**.
  - Permite criar rascunhos, agendar e publicar posts diretamente do CRM sem ver ferramentas técnicas.
  - O upload de imagens destacadas também é suportado.

## Segurança das Integrações
- As credenciais de integrações sensíveis são vistas apenas pela equipe da Agência (role `admin`).
- Os tokens e senhas no banco (`integracoes_google`, `integracoes_hospedagem`, `integracoes_wordpress`) são armazenados de forma criptografada.
