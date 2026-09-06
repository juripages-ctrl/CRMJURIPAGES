# Histórias de Usuário (Atualizadas)

Este documento mapeia todas as ações que cada tipo de usuário (Persona) consegue realizar dentro do JuriPages CRM, já refletindo as exclusões e adições recentes do sistema.

## Personas Principais
- **Administrador (Master/Equipe):** Pessoa da agência que cadastra clientes, gerencia sites, planos e configurações globais.
- **Cliente:** Pessoa ou empresa dona do site, que acessa o painel para acompanhar entregas e métricas.

---

## Épico 1 — Autenticação e Conta
- **Admin/Cliente:** Como usuário, quero fazer login ou me cadastrar com e-mail/senha.
- **Admin/Cliente:** Como usuário, quero poder recuperar a minha senha caso a esqueça.
- **Sistema:** O sistema precisa garantir o direcionamento correto de telas dependendo se a conta é `admin` ou `cliente`, vinculando o acesso aos seus respectivos sites de forma automática.

## Épico 2 — Gestão de Clientes e Rede (Visão Admin)
- **Admin:** Como administrador, quero cadastrar, editar e ver a lista de clientes da agência.
- **Admin:** Como administrador, quero visualizar o perfil detalhado do cliente (Sites atrelados, Faturas e Histórico).
- **Admin:** Como administrador, quero cadastrar um novo site para o cliente e alternar seu status (No Ar, Fora do Ar, Em Desenvolvimento).
- **Admin:** Como administrador, quero conectar ferramentas de forma centralizada (GSC, WordPress e Hospedagem) utilizando tokens e senhas que o cliente final não vê.
- **Admin:** Como administrador, quero uma visão global em formato de tabela de todos os sites hospedados e gerenciados ("Rede de Sites").

## Épico 3 — Área e Relatórios do Cliente
- **Cliente:** Como cliente, quero ver um dashboard que consolida o status geral e o desempenho de todos os meus sites contratados.
- **Cliente:** Como cliente, quero acessar o relatório do meu site para acompanhar os resultados de SEO (Cliques e Impressões) vindos do Google.
- **Cliente:** Como cliente, quero ver avisos técnicos (HTTPs) se meu site está seguro.
- **Cliente:** **Não** quero e não devo conseguir acessar dados ou sites de outros clientes da agência.

## Épico 4 — Gestão de Conteúdo (Blog)
- **Admin:** Como administrador, quero ver a saúde do site em WordPress (PHP, Plugins desatualizados, Eventos do Cron) através de um painel de status embutido.
- **Cliente:** Como cliente, quero um editor de texto rico embutido para criar, agendar e publicar posts de blog diretamente do CRM, sem precisar lidar com o wp-admin original.

## Épico 5 — Comunicação, Notificações e Equipe
- **Admin:** Como administrador, quero escrever notas e comunicados, definindo se a nota é apenas interna (para a agência) ou visível ao cliente no "Feed de Anotações".
- **Admin:** Como administrador master, quero gerenciar quais membros têm acesso ao sistema através da funcionalidade de Equipe/Cargos.
- **Admin/Cliente:** Como usuário, quero receber notificações persistentes (com marcação de lida/não-lida) referentes a pagamentos, dicas de SEO ou atualizações no painel, contendo links de atalho para me direcionar à página relevante.

## Épico 6 — Pagamentos e Planos
- **Admin:** Como administrador, quero poder criar planos e precificações, para em seguida assinar o cliente num plano mensal ou anual.
- **Cliente:** Como cliente, quero ver os detalhes do meu pacote atual e o extrato/histórico de faturas para manter meu financeiro transparente.
