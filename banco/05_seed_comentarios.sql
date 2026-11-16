-- =====================================================================
--  SISTEMA DE ACOMPANHAMENTO DE DEMANDAS DE DESENVOLVIMENTO
--  Projeto Integrador 2 - PUC-Campinas 2026
--  Autor: Julia Bezerra de Paula
--
--  Carga inicial dos comentarios (mesmos comentarios do dados.json da API).
--  Rodar depois de 01_schema.sql e dos seeds de usuarios e demandas.
--
--  As demandas sao encontradas pelo TITULO e os usuarios pelo EMAIL, entao o script nao depende dos ids gerados pelo banco nos outros seeds.
--  As datas sao relativas ao momento da execucao (SYSTIMESTAMP - N horas), como no datas.ts, para cada comentario ficar depois da criacao da sua demanda, qualquer que seja o dia em que o banco for criado.
-- =====================================================================


-- Demanda "Corrigir erro no cálculo de frete" (criada ha 2 dias)
INSERT INTO COMENTARIO (ID_DEMANDA, ID_USUARIO, TEXTO, DATA_HORA)
SELECT d.ID_DEMANDA, u.ID_USUARIO,
       'Priorizar esta correção, pois vários clientes foram afetados.',
       SYSTIMESTAMP - NUMTODSINTERVAL(40, 'HOUR')
  FROM DEMANDA d, USUARIO u
 WHERE d.TITULO = 'Corrigir erro no cálculo de frete'
   AND u.EMAIL  = 'carlos.souza@sistema.com';

INSERT INTO COMENTARIO (ID_DEMANDA, ID_USUARIO, TEXTO, DATA_HORA)
SELECT d.ID_DEMANDA, u.ID_USUARIO,
       'Causa identificada: o CEP não está sendo validado antes do cálculo do frete.',
       SYSTIMESTAMP - NUMTODSINTERVAL(20, 'HOUR')
  FROM DEMANDA d, USUARIO u
 WHERE d.TITULO = 'Corrigir erro no cálculo de frete'
   AND u.EMAIL  = 'pedro.alves@sistema.com';

-- Demanda "Revisar textos de ajuda da tela de login" (criada ha 1 dia)
INSERT INTO COMENTARIO (ID_DEMANDA, ID_USUARIO, TEXTO, DATA_HORA)
SELECT d.ID_DEMANDA, u.ID_USUARIO,
       'Vou levantar quais telas têm texto desatualizado antes de começar a reescrever.',
       SYSTIMESTAMP - NUMTODSINTERVAL(6, 'HOUR')
  FROM DEMANDA d, USUARIO u
 WHERE d.TITULO = 'Revisar textos de ajuda da tela de login'
   AND u.EMAIL  = 'rafael.costa@sistema.com';

-- Demanda "Configurar monitoramento das métricas dos novos servidores" (criada ha 6 dias)
INSERT INTO COMENTARIO (ID_DEMANDA, ID_USUARIO, TEXTO, DATA_HORA)
SELECT d.ID_DEMANDA, u.ID_USUARIO,
       'Importante ter esse monitoramento ativo antes da próxima janela de manutenção dos servidores.',
       SYSTIMESTAMP - NUMTODSINTERVAL(96, 'HOUR')
  FROM DEMANDA d, USUARIO u
 WHERE d.TITULO = 'Configurar monitoramento das métricas dos novos servidores'
   AND u.EMAIL  = 'mariana.ribeiro@sistema.com';

-- Demanda "Migrar banco de dados de produção para o novo provedor de nuvem" (criada ha 3 dias)
INSERT INTO COMENTARIO (ID_DEMANDA, ID_USUARIO, TEXTO, DATA_HORA)
SELECT d.ID_DEMANDA, u.ID_USUARIO,
       'Migração atrasada por indisponibilidade da janela de manutenção.',
       SYSTIMESTAMP - NUMTODSINTERVAL(48, 'HOUR')
  FROM DEMANDA d, USUARIO u
 WHERE d.TITULO = 'Migrar banco de dados de produção para o novo provedor de nuvem'
   AND u.EMAIL  = 'mariana.ribeiro@sistema.com';

-- Demanda "Erro ao gerar nota fiscal duplicada no checkout" (criada ha 8 dias)
INSERT INTO COMENTARIO (ID_DEMANDA, ID_USUARIO, TEXTO, DATA_HORA)
SELECT d.ID_DEMANDA, u.ID_USUARIO,
       'Correção validada em testes, aguardando aprovação final.',
       SYSTIMESTAMP - NUMTODSINTERVAL(24, 'HOUR')
  FROM DEMANDA d, USUARIO u
 WHERE d.TITULO = 'Erro ao gerar nota fiscal duplicada no checkout'
   AND u.EMAIL  = 'carlos.souza@sistema.com';

-- Demanda "Corrigir falha de segurança no upload de anexos do portal" (criada ha 30 dias)
INSERT INTO COMENTARIO (ID_DEMANDA, ID_USUARIO, TEXTO, DATA_HORA)
SELECT d.ID_DEMANDA, u.ID_USUARIO,
       'Tratar com urgência máxima e avisar a equipe de segurança.',
       SYSTIMESTAMP - NUMTODSINTERVAL(696, 'HOUR')
  FROM DEMANDA d, USUARIO u
 WHERE d.TITULO = 'Corrigir falha de segurança no upload de anexos do portal'
   AND u.EMAIL  = 'ana.lima@sistema.com';

INSERT INTO COMENTARIO (ID_DEMANDA, ID_USUARIO, TEXTO, DATA_HORA)
SELECT d.ID_DEMANDA, u.ID_USUARIO,
       'Já estou restringindo as extensões permitidas.',
       SYSTIMESTAMP - NUMTODSINTERVAL(600, 'HOUR')
  FROM DEMANDA d, USUARIO u
 WHERE d.TITULO = 'Corrigir falha de segurança no upload de anexos do portal'
   AND u.EMAIL  = 'pedro.alves@sistema.com';

COMMIT;

-- Conferencia: deve listar 8 comentarios. Se vier menos, algum titulo ou
-- e-mail dos seeds de demandas/usuarios esta diferente do usado aqui.
SELECT c.ID_COMENTARIO, d.TITULO, u.NOME, c.DATA_HORA
  FROM COMENTARIO c
  JOIN DEMANDA d ON d.ID_DEMANDA = c.ID_DEMANDA
  JOIN USUARIO u ON u.ID_USUARIO = c.ID_USUARIO
 ORDER BY c.DATA_HORA;