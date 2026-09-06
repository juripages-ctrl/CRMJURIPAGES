# Banco de Dados (Supabase PostgreSQL)

A estrutura relacional garante segurança via RLS e organiza as entidades do CRM. 

## Tabelas Principais

### Usuários e Clientes
- **`usuarios`**: Tabela principal de autenticação (extensão de `auth.users`). Contém o `role` (`admin` ou `cliente`), vinculação a `cliente_id` (se for cliente), cargo e informações de login.
- **`clientes`**: Cadastro da empresa/pessoa. Contém nome, email, telefone, e um campo de `login_vinculado` para associação automática ao criar usuário.

### Sites e Integrações
- **`sites`**: Sites cadastrados. Vinculados a um cliente (ou não). Guardam o domínio, status atual e plano original.
- **`integracoes_google`**: Credenciais OAuth (tokens) e propriedade GSC de cada site.
- **`provedores`**: Catálogo genérico de hospedagens (Hostinger, Vercel, AWS, etc) e seus tipos de auth.
- **`integracoes_hospedagem`**: Vincula um `site` a um `provedor` com credenciais criptografadas.
- **`integracoes_wordpress`**: Credenciais de API REST (Application Password) do WordPress de cada site.
- **`api_cache`**: Tabela de cache de chamadas externas (GSC, WP) para otimização de tempo de carregamento no dashboard.

### Financeiro
- **`planos`**: Configuração de precificação (mensal, anual, etc) e features.
- **`assinaturas`**: Vínculo entre Cliente, Site e Plano, com dados do gateway e status (ativa, atrasada, etc).
- **`pagamentos`**: Histórico transacional das assinaturas.

### Comunicação e Equipe
- **`notas_cliente`**: Anotações e comunicados feitos pela agência. O campo `visivel_cliente` define se aparece para o cliente final.
- **`notificacoes`**: Sistema de alertas do CRM (pagamentos, relatórios de SEO, atualizações WP/blog, etc). Direcionado ao usuário (`usuario_id`) e com controle de leitura (`lida`).
- **`cargos`**: Cargos dos membros da equipe.
- **`configuracoes_agencia`**: Chaves globais (OAuth Client, etc).

## Segurança
O isolamento dos dados é garantido por funções SQL:
- `is_admin()`: Verifica a role 'admin' para liberar acesso total às tabelas.
- `get_my_cliente_id()`: Filtra o acesso das consultas de clientes, retornando sempre apenas os registros que possuam seu `cliente_id`.
