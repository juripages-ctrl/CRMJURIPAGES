# Visão Geral do JuriPages CRM

O **JuriPages CRM** é uma plataforma full-stack para gestão de sites de clientes. A plataforma permite que a agência cadastre clientes, gerencie os sites entregues e integre ferramentas técnicas, enquanto o cliente acessa um painel simplificado para visualizar as métricas do seu projeto.

## Arquitetura Tecnológica
- **Frontend/Backend:** Next.js (App Router) com Server Actions e API Routes.
- **Estilização:** Tailwind CSS, com design system próprio (componentes em `src/components/ui/`).
- **Banco de Dados & Autenticação:** PostgreSQL gerenciado via Supabase, incluindo Supabase Auth e RLS (Row Level Security).
- **Linguagem:** TypeScript.
- **Gráficos:** Recharts para exibição de métricas.

## Objetivo Principal
Centralizar a operação da agência:
- Evitar que o cliente precise acessar múltiplas plataformas (Google Search Console, WordPress, Hospedagem).
- Proteger as credenciais das APIs e integrações.
- Oferecer uma visão limpa e focada no resultado do projeto (ex: Analytics, andamento do desenvolvimento).
