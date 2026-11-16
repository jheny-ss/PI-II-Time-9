-- =====================================================================
--  SISTEMA DE ACOMPANHAMENTO DE DEMANDAS DE DESENVOLVIMENTO
--  Projeto Integrador 2 - PUC-Campinas 2026
--  Autor: Eduardo Zinetti Betini
--
--  Carga inicial das demandas (mesmas 16 demandas de demandas.ts da API).
--  Rodar depois de 01_schema.sql, 02_seed_usuarios.sql e 03_seed_projetos.sql.
--
--  Os ids de tipo/prioridade/status/projeto/responsavel sao resolvidos por
--  NOME/EMAIL (nao por numero fixo), igual o 05_seed_comentarios.sql da
--  Julia - os ids gerados pelo Oracle (IDENTITY) nao sao previsiveis.
--
--  ID_CRIADOR: pendente de confirmacao do grupo. Por enquanto, todas as
--  demandas estao marcadas como criadas pela Ana (Administradora). Trocar
--  aqui se o grupo decidir variar o criador por demanda.
--
--  Datas relativas ao momento da execucao (como no datas.ts), para a
--  demonstracao de atrasadas/proximas do prazo continuar fazendo sentido
--  em qualquer dia que o banco for criado.
-- =====================================================================


-- 1) normal: criada ha 2 dias, prazo em 10 dias
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Corrigir erro no cálculo de frete',
       'O frete fica negativo para alguns CEPs.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, r.ID_USUARIO, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(2, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(2, 'DAY'),
       TRUNC(SYSDATE) + 10
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO r, USUARIO c
 WHERE t.NOME = 'Defeito' AND p.NOME = 'Alta' AND s.NOME = 'Aberta'
   AND pr.NOME = 'Portal do Cliente' AND r.EMAIL = 'pedro.alves@sistema.com'
   AND c.EMAIL = 'ana.lima@sistema.com';

-- 2) atrasada: prazo ja venceu, mas ainda em andamento
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Atualizar biblioteca de pagamentos',
       'Versão atual está descontinuada pelo fornecedor.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, r.ID_USUARIO, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(15, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(3, 'DAY'),
       TRUNC(SYSDATE) - 4
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO r, USUARIO c
 WHERE t.NOME = 'Tarefa' AND p.NOME = 'Crítica' AND s.NOME = 'Em andamento'
   AND pr.NOME = 'Aplicativo Mobile de Vendas' AND r.EMAIL = 'juliana.martins@sistema.com'
   AND c.EMAIL = 'ana.lima@sistema.com';

-- 3) sem responsavel e sem prazo
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Revisar textos de ajuda da tela de login',
       'Alguns textos estão desatualizados.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, NULL, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(1, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(1, 'DAY'),
       NULL
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO c
 WHERE t.NOME = 'Documentação' AND p.NOME = 'Baixa' AND s.NOME = 'Aberta'
   AND pr.NOME = 'Migração de Infraestrutura' AND c.EMAIL = 'ana.lima@sistema.com';

-- 4) critica em revisao
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Erro ao gerar nota fiscal duplicada no checkout',
       'Em alguns pedidos, duas notas fiscais são geradas para a mesma compra.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, r.ID_USUARIO, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(8, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(1, 'DAY'),
       TRUNC(SYSDATE) + 2
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO r, USUARIO c
 WHERE t.NOME = 'Defeito' AND p.NOME = 'Crítica' AND s.NOME = 'Em revisão'
   AND pr.NOME = 'Portal do Cliente' AND r.EMAIL = 'carlos.souza@sistema.com'
   AND c.EMAIL = 'ana.lima@sistema.com';

-- 5) tarefa em andamento
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Configurar monitoramento das métricas dos novos servidores',
       'Acompanhar CPU, memória e disco após a migração para a nuvem.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, r.ID_USUARIO, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(6, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(1, 'DAY'),
       TRUNC(SYSDATE) + 5
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO r, USUARIO c
 WHERE t.NOME = 'Tarefa' AND p.NOME = 'Alta' AND s.NOME = 'Em andamento'
   AND pr.NOME = 'Migração de Infraestrutura' AND r.EMAIL = 'rafael.costa@sistema.com'
   AND c.EMAIL = 'ana.lima@sistema.com';

-- 6) melhoria aberta
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Adicionar busca por categoria no catálogo do aplicativo',
       'Permitir filtrar produtos por categoria na tela de pedidos em campo.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, r.ID_USUARIO, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(1, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(1, 'DAY'),
       TRUNC(SYSDATE) + 15
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO r, USUARIO c
 WHERE t.NOME = 'Melhoria' AND p.NOME = 'Média' AND s.NOME = 'Aberta'
   AND pr.NOME = 'Aplicativo Mobile de Vendas' AND r.EMAIL = 'juliana.martins@sistema.com'
   AND c.EMAIL = 'ana.lima@sistema.com';

-- 7) documentacao concluida
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Documentar fluxo de autenticação do portal do cliente',
       'Registrar o passo a passo de login, recuperação de senha e sessão.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, r.ID_USUARIO, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(20, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(5, 'DAY'),
       TRUNC(SYSDATE) - 5
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO r, USUARIO c
 WHERE t.NOME = 'Documentação' AND p.NOME = 'Baixa' AND s.NOME = 'Concluída'
   AND pr.NOME = 'Portal do Cliente' AND r.EMAIL = 'pedro.alves@sistema.com'
   AND c.EMAIL = 'ana.lima@sistema.com';

-- 8) critica sem responsavel
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Migrar banco de dados de produção para o novo provedor de nuvem',
       'Mover o banco principal sem perda de dados nem indisponibilidade prolongada.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, NULL, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(3, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(3, 'DAY'),
       TRUNC(SYSDATE) + 7
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO c
 WHERE t.NOME = 'Tarefa' AND p.NOME = 'Crítica' AND s.NOME = 'Aberta'
   AND pr.NOME = 'Migração de Infraestrutura' AND c.EMAIL = 'ana.lima@sistema.com';

-- 9) defeito media em andamento
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Corrigir cálculo de comissão exibido incorretamente no app',
       'O valor de comissão do vendedor aparece zerado em pedidos parcelados.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, r.ID_USUARIO, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(10, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(2, 'DAY'),
       TRUNC(SYSDATE) + 3
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO r, USUARIO c
 WHERE t.NOME = 'Defeito' AND p.NOME = 'Média' AND s.NOME = 'Em andamento'
   AND pr.NOME = 'Aplicativo Mobile de Vendas' AND r.EMAIL = 'mariana.ribeiro@sistema.com'
   AND c.EMAIL = 'ana.lima@sistema.com';

-- 10) melhoria alta aberta
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Otimizar tempo de carregamento da listagem de pedidos',
       'A listagem está demorando mais de 5 segundos para carregar no portal.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, r.ID_USUARIO, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(4, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(4, 'DAY'),
       TRUNC(SYSDATE) + 12
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO r, USUARIO c
 WHERE t.NOME = 'Melhoria' AND p.NOME = 'Alta' AND s.NOME = 'Aberta'
   AND pr.NOME = 'Portal do Cliente' AND r.EMAIL = 'carlos.souza@sistema.com'
   AND c.EMAIL = 'ana.lima@sistema.com';

-- 11) tarefa media concluida
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Configurar backup automático dos servidores migrados',
       'Garantir rotina diária de backup após a migração de infraestrutura.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, r.ID_USUARIO, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(25, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(10, 'DAY'),
       TRUNC(SYSDATE) - 10
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO r, USUARIO c
 WHERE t.NOME = 'Tarefa' AND p.NOME = 'Média' AND s.NOME = 'Concluída'
   AND pr.NOME = 'Migração de Infraestrutura' AND r.EMAIL = 'rafael.costa@sistema.com'
   AND c.EMAIL = 'ana.lima@sistema.com';

-- 12) documentacao sem responsavel e sem prazo
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Atualizar manual do usuário do aplicativo de vendas',
       'Incluir as telas novas de pedido e catálogo no manual atual.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, NULL, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(2, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(2, 'DAY'),
       NULL
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO c
 WHERE t.NOME = 'Documentação' AND p.NOME = 'Baixa' AND s.NOME = 'Aberta'
   AND pr.NOME = 'Aplicativo Mobile de Vendas' AND c.EMAIL = 'ana.lima@sistema.com';

-- 13) defeito alta aberta
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Corrigir travamento ao aplicar cupom de desconto inválido',
       'O app fecha inesperadamente ao digitar um cupom que não existe.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, r.ID_USUARIO, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(1, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(1, 'DAY'),
       TRUNC(SYSDATE) + 6
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO r, USUARIO c
 WHERE t.NOME = 'Defeito' AND p.NOME = 'Alta' AND s.NOME = 'Aberta'
   AND pr.NOME = 'Portal do Cliente' AND r.EMAIL = 'pedro.alves@sistema.com'
   AND c.EMAIL = 'ana.lima@sistema.com';

-- 14) tarefa alta concluida
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Implementar exportação de relatório de vendas em PDF',
       'Permitir que o vendedor exporte o resumo mensal de vendas em PDF.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, r.ID_USUARIO, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(18, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(4, 'DAY'),
       TRUNC(SYSDATE) - 4
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO r, USUARIO c
 WHERE t.NOME = 'Tarefa' AND p.NOME = 'Alta' AND s.NOME = 'Concluída'
   AND pr.NOME = 'Aplicativo Mobile de Vendas' AND r.EMAIL = 'juliana.martins@sistema.com'
   AND c.EMAIL = 'ana.lima@sistema.com';

-- 15) melhoria media em revisao
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Padronizar nomenclatura dos recursos na nova infraestrutura',
       'Unificar o padrão de nomes de servidores e buckets após a migração.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, r.ID_USUARIO, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(12, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(1, 'DAY'),
       TRUNC(SYSDATE) + 1
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO r, USUARIO c
 WHERE t.NOME = 'Melhoria' AND p.NOME = 'Média' AND s.NOME = 'Em revisão'
   AND pr.NOME = 'Migração de Infraestrutura' AND r.EMAIL = 'ana.lima@sistema.com'
   AND c.EMAIL = 'ana.lima@sistema.com';

-- 16) critica cancelada (falha de seguranca)
INSERT INTO DEMANDA (TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_STATUS, ID_PROJETO, ID_RESPONSAVEL, ID_CRIADOR, DATA_CRIACAO, DATA_ATUALIZACAO, PRAZO_FINALIZACAO)
SELECT 'Corrigir falha de segurança no upload de anexos do portal',
       'Anexos eram aceitos sem validação de tipo de arquivo, risco de upload malicioso.',
       t.ID_TIPO, p.ID_PRIORIDADE, s.ID_STATUS, pr.ID_PROJETO, r.ID_USUARIO, c.ID_USUARIO,
       SYSTIMESTAMP - NUMTODSINTERVAL(30, 'DAY'),
       SYSTIMESTAMP - NUMTODSINTERVAL(14, 'DAY'),
       NULL
  FROM TIPO_DEMANDA t, PRIORIDADE p, STATUS_DEMANDA s, PROJETO pr, USUARIO r, USUARIO c
 WHERE t.NOME = 'Defeito' AND p.NOME = 'Crítica' AND s.NOME = 'Cancelada'
   AND pr.NOME = 'Portal do Cliente' AND r.EMAIL = 'carlos.souza@sistema.com'
   AND c.EMAIL = 'ana.lima@sistema.com';

COMMIT;

-- Conferencia: deve listar 16 demandas.
SELECT COUNT(*) AS TOTAL_DEMANDAS FROM DEMANDA;
