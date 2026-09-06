# Funcionalidades Core

O sistema do CRM JuriPages entrega um conjunto de funcionalidades voltadas para a agência gerir e os clientes acompanharem.

## 1. Gestão de Clientes e Rede de Sites
- **Clientes:** Cadastro unificado de clientes. A plataforma mapeia logins de usuários a esses clientes (via e-mail ou `login_vinculado`), permitindo acesso direto sem onboarding complexo.
- **Sites:** Cada cliente pode ter "N" sites vinculados (ou sites avulsos na agência). O status de cada site (online, pausado, em desenvolvimento) é atualizado em tempo real e serve de feedback imediato para o cliente.

## 2. Dashboards de Performance (Google Search Console)
- O CRM possui uma das suas features centrais focada em relatórios.
- **Para Agência:** Visão macro (se GSC está conectado) e performance.
- **Para Clientes:** Gráficos de CLIQUES x IMPRESSÕES limpos e de fácil entendimento na área do cliente (`/dashboard/meus-sites/[id]`).

## 3. Hub de Comunicação e Notas
- **Anotações do Time:** O administrador escreve anotações técnicas internas, ou, marcando a flag `visivel_cliente`, transforma a anotação em um comunicado oficial no feed do cliente (com datas, autores e links reconhecidos automaticamente).

## 4. Cobranças e Assinaturas (Em Implementação)
- O sistema já permite cadastrar **Planos** com periodicidades flexíveis e funcionalidades incluídas.
- A Agência cadastra as **Assinaturas** atreladas a clientes/sites e gerencia seções isentas.
- O cliente enxerga o painel financeiro com vitrine de planos, extrato de pagamentos passados e status de sua fatura.
- **Roadmap:** Mock atual `ClientCheckoutMock.tsx` deverá ser substituído por integração real com gateways (Asaas, Stripe ou Mercado Pago).

## 5. Sistema de Notificações e Alertas
- O sistema possui alertas dinâmicos e persistentes na plataforma para os usuários através da tabela `notificacoes`.
- **Tipos de Alerta:** Pagamentos (falhas/vencimentos), avisos de SEO, status do WordPress, atualizações de Blog ou comunicados gerais.
- **Funcionamento:** O usuário recebe notificações no painel que podem conter links diretos (`link`), podendo marcá-las como lidas para melhor gestão de avisos importantes.
