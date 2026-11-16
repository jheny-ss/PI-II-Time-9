-- =====================================================================
--  SISTEMA DE ACOMPANHAMENTO DE DEMANDAS DE DESENVOLVIMENTO
--  Projeto Integrador 2 - PUC-Campinas 2026
--  Autor: Eduardo Zinetti Betini
--
--  AVISO: seed PROVISÓRIA. A responsável original por este arquivo é a
--  Jhenyfer, mas ele não foi incluído no PR da autenticação (#70) a tempo
--  da reunião. Preenchi com os mesmos 6 usuários do dados.json (array
--  "usuarios") pra não travar o 04_seed_demandas.sql, que depende de
--  USUARIO já ter dados. Trocar/reconciliar com a versão definitiva dela
--  depois da reunião.
--
--  Rodar depois de 01_schema.sql, antes de 03_seed_projetos.sql e
--  04_seed_demandas.sql.
--
--  As senhas em texto puro do dados.json (Admin@123, Lider@123, Membro@123)
--  foram convertidas pra hash bcrypt (mesma lib que o login.ts usa:
--  bcryptjs, custo 10) com um script node descartável, só pra gerar o
--  valor - o hash abaixo é fixo, não precisa rodar nada pra usar este seed.
-- =====================================================================

INSERT INTO USUARIO (NOME, EMAIL, SENHA_HASH, ID_PERFIL)
SELECT 'Ana Beatriz Lima', 'ana.lima@sistema.com',
       '$2b$10$YmYPvRy8nDrI6PS77Vroj.9e3nZ/J2U8Tt71FcWvkOD9mFI5C044O', ID_PERFIL
  FROM PERFIL WHERE NOME = 'Administrador';

INSERT INTO USUARIO (NOME, EMAIL, SENHA_HASH, ID_PERFIL)
SELECT 'Carlos Eduardo Souza', 'carlos.souza@sistema.com',
       '$2b$10$1XmKwpBjpEhqEskgyNprNOhbPigptlMl0.o2JbEFect36uiLHwqga', ID_PERFIL
  FROM PERFIL WHERE NOME = 'Líder de Projeto';

INSERT INTO USUARIO (NOME, EMAIL, SENHA_HASH, ID_PERFIL)
SELECT 'Mariana Ribeiro', 'mariana.ribeiro@sistema.com',
       '$2b$10$1XmKwpBjpEhqEskgyNprNOhbPigptlMl0.o2JbEFect36uiLHwqga', ID_PERFIL
  FROM PERFIL WHERE NOME = 'Líder de Projeto';

INSERT INTO USUARIO (NOME, EMAIL, SENHA_HASH, ID_PERFIL)
SELECT 'Pedro Henrique Alves', 'pedro.alves@sistema.com',
       '$2b$10$OEh7aS78k8VK9aJH29X8IuzCKIvTvuHB1dunxcNx49gyF1.yReo.G', ID_PERFIL
  FROM PERFIL WHERE NOME = 'Membro da Equipe';

INSERT INTO USUARIO (NOME, EMAIL, SENHA_HASH, ID_PERFIL)
SELECT 'Juliana Martins', 'juliana.martins@sistema.com',
       '$2b$10$OEh7aS78k8VK9aJH29X8IuzCKIvTvuHB1dunxcNx49gyF1.yReo.G', ID_PERFIL
  FROM PERFIL WHERE NOME = 'Membro da Equipe';

INSERT INTO USUARIO (NOME, EMAIL, SENHA_HASH, ID_PERFIL)
SELECT 'Rafael Costa', 'rafael.costa@sistema.com',
       '$2b$10$OEh7aS78k8VK9aJH29X8IuzCKIvTvuHB1dunxcNx49gyF1.yReo.G', ID_PERFIL
  FROM PERFIL WHERE NOME = 'Membro da Equipe';

COMMIT;

-- vincula cada usuário aos projetos que ele participa (mesmo projetoIds do dados.json),
-- resolvendo os dois ids por nome/email em vez de hardcoded (mesmo padrão dos outros seeds)
INSERT INTO PROJETO_USUARIO (ID_PROJETO, ID_USUARIO)
SELECT p.ID_PROJETO, u.ID_USUARIO FROM PROJETO p, USUARIO u
 WHERE p.NOME = 'Portal do Cliente' AND u.EMAIL = 'ana.lima@sistema.com';

INSERT INTO PROJETO_USUARIO (ID_PROJETO, ID_USUARIO)
SELECT p.ID_PROJETO, u.ID_USUARIO FROM PROJETO p, USUARIO u
 WHERE p.NOME = 'Aplicativo Mobile de Vendas' AND u.EMAIL = 'ana.lima@sistema.com';

INSERT INTO PROJETO_USUARIO (ID_PROJETO, ID_USUARIO)
SELECT p.ID_PROJETO, u.ID_USUARIO FROM PROJETO p, USUARIO u
 WHERE p.NOME = 'Migração de Infraestrutura' AND u.EMAIL = 'ana.lima@sistema.com';

INSERT INTO PROJETO_USUARIO (ID_PROJETO, ID_USUARIO)
SELECT p.ID_PROJETO, u.ID_USUARIO FROM PROJETO p, USUARIO u
 WHERE p.NOME = 'Portal do Cliente' AND u.EMAIL = 'carlos.souza@sistema.com';

INSERT INTO PROJETO_USUARIO (ID_PROJETO, ID_USUARIO)
SELECT p.ID_PROJETO, u.ID_USUARIO FROM PROJETO p, USUARIO u
 WHERE p.NOME = 'Aplicativo Mobile de Vendas' AND u.EMAIL = 'carlos.souza@sistema.com';

INSERT INTO PROJETO_USUARIO (ID_PROJETO, ID_USUARIO)
SELECT p.ID_PROJETO, u.ID_USUARIO FROM PROJETO p, USUARIO u
 WHERE p.NOME = 'Aplicativo Mobile de Vendas' AND u.EMAIL = 'mariana.ribeiro@sistema.com';

INSERT INTO PROJETO_USUARIO (ID_PROJETO, ID_USUARIO)
SELECT p.ID_PROJETO, u.ID_USUARIO FROM PROJETO p, USUARIO u
 WHERE p.NOME = 'Migração de Infraestrutura' AND u.EMAIL = 'mariana.ribeiro@sistema.com';

INSERT INTO PROJETO_USUARIO (ID_PROJETO, ID_USUARIO)
SELECT p.ID_PROJETO, u.ID_USUARIO FROM PROJETO p, USUARIO u
 WHERE p.NOME = 'Portal do Cliente' AND u.EMAIL = 'pedro.alves@sistema.com';

INSERT INTO PROJETO_USUARIO (ID_PROJETO, ID_USUARIO)
SELECT p.ID_PROJETO, u.ID_USUARIO FROM PROJETO p, USUARIO u
 WHERE p.NOME = 'Aplicativo Mobile de Vendas' AND u.EMAIL = 'juliana.martins@sistema.com';

INSERT INTO PROJETO_USUARIO (ID_PROJETO, ID_USUARIO)
SELECT p.ID_PROJETO, u.ID_USUARIO FROM PROJETO p, USUARIO u
 WHERE p.NOME = 'Migração de Infraestrutura' AND u.EMAIL = 'rafael.costa@sistema.com';

COMMIT;

-- deve listar 6 usuarios
SELECT ID_USUARIO, NOME, EMAIL FROM USUARIO ORDER BY ID_USUARIO;
