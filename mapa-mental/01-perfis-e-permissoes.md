# Perfis e Permissões (RBAC)

O sistema possui diferentes visões e permissões isoladas através do Row Level Security (RLS) do Supabase e checagens na aplicação.

## 1. Administrador Master (Dono da Agência)
- **Acesso:** Total (Dashboard de Administração).
- **Responsabilidades exclusivas:**
  - Gerenciamento completo da equipe (Cargos e Membros).
  - Configuração de chaves globais da Agência (Master APIs).
  - Gestão financeira avançada.

## 2. Administrador (Membro da Equipe)
- **Acesso:** Restrito ao Painel Admin (Dashboard).
- **Responsabilidades (Atualmente compartilhadas):**
  - Cadastro e edição de Clientes.
  - Cadastro e edição de Sites (Status: Em produção, No ar, etc).
  - Conexão de Integrações Técnicas (Google Search Console, Hospedagens, WordPress).
  - Gestão de planos, assinaturas e comunicação (Notas).
  
## 3. Cliente (Usuário Final)
- **Acesso:** Área do Cliente (Isolado via RLS).
- **Responsabilidades:**
  - Acompanhar dashboard de analytics consolidado (GSC).
  - Ver a rede de sites próprios contratados.
  - Acompanhar comunicados e anotações da equipe (`notas_cliente` visíveis).
  - Ver histórico de pagamentos e assinaturas.
- **Restrições:** Não tem acesso a credenciais de API, chaves de hospedagem e não enxerga dados de outros clientes.
