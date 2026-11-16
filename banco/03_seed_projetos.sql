-- =====================================================================
--  SISTEMA DE ACOMPANHAMENTO DE DEMANDAS DE DESENVOLVIMENTO
--  Projeto Integrador 2 - PUC-Campinas 2026
--  Autor: Eduardo Zinetti Betini
--
--  Carga inicial dos projetos (mesmos projetos do dados.json da API).
--  Rodar depois de 01_schema.sql e 02_seed_usuarios.sql.
--
--  PROJETO nao depende de nenhuma outra tabela, entao aqui e INSERT
--  direto - sem precisar buscar id de outra tabela como nos outros seeds.
-- =====================================================================

INSERT INTO PROJETO (NOME, DESCRICAO) VALUES
  ('Portal do Cliente', 'Portal web para acompanhamento de pedidos e atendimento ao cliente.');

INSERT INTO PROJETO (NOME, DESCRICAO) VALUES
  ('Aplicativo Mobile de Vendas', 'Aplicativo para a equipe comercial registrar pedidos em campo.');

INSERT INTO PROJETO (NOME, DESCRICAO) VALUES
  ('Migração de Infraestrutura', 'Migração dos servidores internos para a nuvem.');

COMMIT;

-- deve listar 3 projetos.
SELECT ID_PROJETO, NOME FROM PROJETO ORDER BY ID_PROJETO;
