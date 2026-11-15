# PI-II-Time-9
# Sistema de Acompanhamento de Demandas de Desenvolvimento

## Sobre o projeto

Repositório destinado ao desenvolvimento do **Sistema de Acompanhamento de Demandas de Desenvolvimento**, desenvolvido como parte do componente curricular Projeto Integrador II, do curso de Engenharia de Software da Pontifícia Universidade Católica de Campinas (PUC-Campinas), no segundo semestre de 2026.

O sistema tem como objetivo auxiliar no gerenciamento e acompanhamento de demandas de desenvolvimento, permitindo organizar atividades, acompanhar seus status e controlar o acesso de acordo com os perfis dos usuários.

## Integrantes

1. Arthur Peripolli da Silva
2. Eduardo Zinetti Betini
3. Jhenyfer da Silva Souza
4. Julia Bezerra de Paula
5. Rafael Jorge Nicolau Correia

## Professora orientadora

Renata Antonia Tadeu Arantes

## Informações acadêmicas

- **Curso:** Engenharia de Software — PUC-Campinas
- **Componente curricular:** Projeto Integrador II
- **Semestre/Ano:** 2º semestre de 2026

---

## Tecnologias utilizadas

- **Backend:** Node.js, TypeScript e Express
- **Banco de dados:** Oracle Database
- **Autenticação:** JSON Web Token (JWT)
- **Frontend:** HTML, CSS e JavaScript

---

## Funcionalidades

- Autenticação de usuários por e-mail e senha.
- Controle de acesso baseado em perfis.
- Cadastro e acompanhamento de demandas.
- Consulta e filtragem de demandas.
- Acompanhamento de prazos e status.
- Visualização de informações relacionadas aos projetos.

### Perfis de acesso

O sistema possui três perfis:

| Perfil | Identificador | Responsabilidade |
|---|---:|---|
| Administrador | 1 | Acesso geral ao sistema e gerenciamento das demandas. |
| Líder de Projeto | 2 | Gerenciamento das demandas dos projetos aos quais está vinculado. |
| Membro da Equipe | 3 | Execução e acompanhamento das demandas atribuídas a ele. |

### Regras de transição de status

Os status das demandas são:

1. Aberta
2. Em andamento
3. Em revisão
4. Concluída
5. Cancelada

As transições previstas são:

| Status atual | Próximo status permitido |
|---|---|
| Aberta | Em andamento ou Cancelada |
| Em andamento | Em revisão ou Cancelada |
| Em revisão | Em andamento, Concluída ou Cancelada |
| Concluída | Cancelada |
| Cancelada | Nenhum |

O administrador e o líder podem realizar as transições previstas, respeitando as permissões de seus respectivos perfis. O membro da equipe pode iniciar e encaminhar para revisão somente as demandas atribuídas a ele.

---

## Como executar o projeto

### Pré-requisitos

Antes de iniciar, é necessário ter instalado:

- Node.js
- npm
- Oracle Database
- Git

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
```

### 2. Instalar as dependências

Entre na pasta do backend:

```bash
cd PI-II-Time-9/backend
```

Instale as dependências:

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Crie um arquivo chamado `.env` dentro da pasta `backend`, no mesmo nível do arquivo `package.json`.

Preencha com as seguintes variáveis:

```env
# Conexão com o Oracle Database
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE=XE
ORACLE_USER=seu_usuario
ORACLE_PASSWORD=sua_senha

# Autenticação JWT
JWT_SECRET=sua_chave_secreta

# Schema do banco de dados (opcional)
DB_SCHEMA=seu_schema
```

#### Descrição das variáveis

| Variável | Descrição |
|---|---|
| `ORACLE_HOST` | Endereço do servidor Oracle. |
| `ORACLE_PORT` | Porta de conexão do Oracle, geralmente 1521. |
| `ORACLE_SERVICE` | Nome do serviço do banco de dados. |
| `ORACLE_USER` | Usuário utilizado para conectar ao Oracle. |
| `ORACLE_PASSWORD` | Senha do usuário do banco de dados. |
| `JWT_SECRET` | Chave secreta utilizada para assinar e validar os tokens JWT. |
| `DB_SCHEMA` | Schema onde estão as tabelas. Opcional quando as tabelas pertencem ao próprio usuário conectado. |

**Importante:**

- Substitua os valores de exemplo pelas informações do ambiente utilizado.
- Utilize uma chave secreta forte e exclusiva para `JWT_SECRET`.
- O arquivo `.env` não deve ser enviado ao GitHub, pois contém credenciais e informações sensíveis.
- Cada integrante deve configurar seu próprio arquivo `.env` localmente.
- Não compartilhe senhas reais no README ou em commits.

### 4. Preparar o banco de dados

Os scripts SQL estão disponíveis na pasta `banco`.

Execute os arquivos respeitando a seguinte ordem:

1. `01_schema.sql` — criação das tabelas e estruturas do banco.
2. `02_seed_usuarios.sql` — inserção dos usuários iniciais.
3. `03_seed_projetos.sql` — inserção dos projetos.
4. `04_seed_demandas.sql` — inserção das demandas.
5. `05_seed_comentarios.sql` — inserção dos comentários.

A execução deve ser realizada no schema utilizado pela aplicação.

### 5. Iniciar o servidor

Para executar em ambiente de desenvolvimento:

```bash
npm run dev
```

O servidor será iniciado em:

http://localhost:3000

Para acessar a rota inicial, utilize:

http://localhost:3000/

### 6. Compilar o projeto

Para gerar a versão compilada:

```bash
npm run build
```

Para executar a versão compilada:

```bash
npm start
```

**Observação:** o comando `npm start` executa o código compilado. Em uma máquina nova, é necessário executar `npm run build` antes, pois a pasta `lib/` ainda não estará disponível. Já o comando `npm run dev` inicia o servidor em modo de desenvolvimento.

---

## Autenticação e autorização

A autenticação é realizada por meio de e-mail e senha. Após a validação das credenciais, o backend gera um token JWT, utilizado para identificar o usuário nas requisições protegidas.

O middleware de autenticação verifica a validade do token e disponibiliza os dados do usuário autenticado para as demais operações.

O middleware de autorização verifica se o perfil do usuário possui permissão para acessar determinada funcionalidade.

Os identificadores dos perfis e as regras de transição de status são centralizados nos arquivos de permissões do backend.

### Arquivos relacionados

| Arquivo | Responsabilidade |
|---|---|
| `middlewares/autenticar.ts` | Verificar a validade do token JWT. |
| `middlewares/autorizar.ts` | Verificar se o perfil possui permissão de acesso. |
| `utils/permissoes.ts` | Centralizar os perfis, status e regras de transição. |

---

## Estrutura do projeto

```text
PI-II-Time-9/
│
├── backend/
│   ├── src/
│   │   ├── middlewares/
│   │   │   ├── autenticar.ts
│   │   │   └── autorizar.ts
│   │   │
│   │   ├── rotas/
│   │   │
│   │   ├── utils/
│   │   │   └── permissoes.ts
│   │   │
│   │   ├── dados/
│   │   ├── db.ts
│   │   └── index.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── css/
│   ├── javascript/
│   └── paginas/
│
├── banco/
│   ├── 01_schema.sql
│   ├── 02_seed_usuarios.sql
│   ├── 03_seed_projetos.sql
│   ├── 04_seed_demandas.sql
│   └── 05_seed_comentarios.sql
│
└── README.md
```

---

## Conventional Commits

O projeto utiliza o padrão Conventional Commits para padronizar as mensagens de commit.

| Tipo | Descrição |
|---|---|
| `feat` | Adiciona uma nova funcionalidade ao sistema. |
| `fix` | Corrige um erro ou problema existente. |
| `docs` | Realiza alterações na documentação do projeto. |
| `style` | Altera formatação, espaçamento ou estilo sem modificar a lógica. |
| `refactor` | Melhora ou reorganiza o código sem alterar seu comportamento. |
| `test` | Adiciona, modifica ou corrige testes. |
| `chore` | Realiza tarefas de manutenção, configuração ou organização. |
| `build` | Altera configurações relacionadas à compilação ou dependências. |

