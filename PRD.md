# PRD — Sistema de Acompanhamento de Demandas de Desenvolvimento

> Baseado no Documento de Visão do Projeto Integrador 2 (Engenharia de Software, PUC-Campinas).
> Este arquivo contém apenas o escopo funcional/técnico, para uso como contexto de desenvolvimento.

## 1. Visão geral

Sistema para organizar tarefas, defeitos ("bugs") e melhorias de um software, inspirado em ferramentas de gestão de demandas usadas por equipes de tecnologia. Cada grupo desenvolve sua própria aplicação, com projetos, usuários e demandas próprios.

Entrega final: frontend + backend + banco de dados relacional integrados, permitindo cadastro, consulta, atualização e cancelamento de demandas. **Exclusão física de registros é proibida em qualquer entidade.**

Nesta etapa atual (mockup visual): apenas HTML/CSS, sem integração com backend/API/banco.

## 2. Perfis de usuário (RBAC — mínimo 3 perfis)

### Administrador
- Visualiza todos os projetos, usuários e demandas.
- Cria e edita demandas.
- Atribui/altera responsável, prioridade e status (todas as transições).
- Cancela demandas.
- Visualiza histórico e comentários.

### Líder de Projeto
- Visualiza apenas projetos/demandas aos quais está vinculado.
- Cria e edita demandas desses projetos.
- Atribui/altera responsável, prioridade.
- Altera status (todas as transições previstas).
- Cancela demandas.
- Visualiza histórico e comentários.

### Membro da Equipe
- Visualiza projetos/demandas aos quais está vinculado, e demandas atribuídas a ele.
- Registra comentários.
- Visualiza histórico.
- Altera status **apenas**: Aberta → Em andamento, e Em andamento → Em revisão.
- **Não pode**: concluir, cancelar, alterar prioridade, atribuir/alterar responsável, ou modificar dados estruturais do projeto.

> Cadastro de projetos e usuários pode ser pré-inserido direto no banco — não é obrigatório ter telas de CRUD para essas entidades. Foco funcional obrigatório é a entidade **Demanda**.

## 3. Modelo de dados — Demanda

### Campos obrigatórios
| Campo | Regras |
|---|---|
| Título | texto, obrigatório |
| Descrição | texto, obrigatório |
| Tipo | um de: Tarefa, Defeito, Melhoria, Documentação |
| Prioridade | um de: Crítica, Alta, Média, Baixa |
| Status | um de: Aberta, Em andamento, Em revisão, Concluída, Cancelada |
| Projeto associado | obrigatório, vínculo com projeto existente |
| Responsável | opcional (pode ficar em branco na criação) |
| Data de criação | preenchimento automático, imutável |
| Data da última atualização | atualização automática a cada mudança relevante |
| Prazo de finalização | definido na criação ou depois; validação de feriado (ver 4.1) |

### Ciclo de vida (máquina de estados)
- Aberta → Em andamento
- Em andamento → Em revisão
- Em revisão → Concluída
- Em revisão → Em andamento
- Qualquer status → Cancelada

**Regras:**
- Toda demanda nasce com status **Aberta**.
- Não pode ir direto de "Em andamento" para "Concluída" (precisa passar por "Em revisão").
- Não pode voltar de "Em andamento" para "Aberta".
- Cancelamento permitido a qualquer momento, exceto se já "Concluída".
- Transições permitidas por perfil: ver seção 2.

## 4. Regras de negócio

### 4.1 Validação de prazo de finalização
Uso obrigatório de API externa para checar se a data informada é feriado nacional. Se for, bloquear o cadastro/atualização com mensagem de erro. (Etapa futura — não implementar na fase de mockup HTML/CSS; apenas deixar comentário indicando o ponto de integração.)

### 4.2 Comentários
Vinculados obrigatoriamente a uma demanda e a um usuário; armazenam data e horário do registro.

### 4.3 Histórico de alterações
Registro automático de: alteração de status, responsável, prioridade, prazo de finalização, cancelamento. Nunca é apagado, mesmo com a demanda cancelada.
Formato de exemplo: `"João alterou o status da demanda de Aberta para Em andamento."`

### 4.4 Exclusão
Nunca física. Demanda "removida" = status alterado para Cancelada.

## 5. Funcionalidades obrigatórias

- Cadastrar demanda
- Listar demandas (colunas mínimas: título, tipo, prioridade, status, projeto, responsável, data de criação, prazo de finalização)
- Visualizar detalhes de uma demanda
- Editar demanda
- Atualizar status
- Cancelar demanda

### Filtros e busca
- Filtro por no mínimo 2 critérios entre: status, prioridade, tipo, responsável, projeto.
- Busca textual por título ou descrição.
- Ordenação por: prioridade, data de criação, prazo de finalização ou status.

### Dashboard (tela inicial)
- Total de demandas
- Quantidade por status (aberta/em andamento/em revisão/concluída/cancelada)
- Quantidade por prioridade
- Quantidade por tipo
- Demandas críticas em aberto
- Demandas próximas do prazo de finalização

## 6. Requisitos técnicos obrigatórios

| Camada | Tecnologia |
|---|---|
| Backend | Node.js (última LTS) + TypeScript + Express |
| Frontend | HTML5, CSS3, JavaScript (Bootstrap opcional) |
| Banco de dados | Relacional — MySQL ou Oracle |
| Versionamento | Git + GitHub + GitHub Projects (obrigatório) |

## 7. Convenções do grupo

- Cada arquivo deve conter comentário de autoria individual no topo (nome do autor exclusivo daquele artefato).
- Comentários explicativos obrigatórios no código.
- Trabalhar em branch própria por funcionalidade/tela; commits com mensagens claras.
- Apontar tarefas e horas reais no GitHub Projects.

## 8. Etapa atual do projeto (mockup visual)

Fase de construção apenas das telas em HTML/CSS, sem integração com backend/API/banco de dados. Telas mínimas do grupo (uma por integrante):
- Login
- Dashboard
- Listagem de Demandas
- Cadastro/Edição de Demanda
- Detalhes da Demanda

Todas devem seguir o mesmo padrão visual (tipografia, cores, botões, cabeçalho/menu, espaçamentos, estilo de tabelas/formulários/cards) combinado entre os integrantes.