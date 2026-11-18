/*
Autor: Arthur Peripolli da Silva
Descrição: Rota GET /dashboard conectada ao Oracle (VW_DEMANDA_LISTAGEM)
*/

import { Router, Request, Response } from 'express';
import { getConn } from '../db.js';
import { autenticar } from '../middlewares/autenticar.js';

const router = Router();

// autenticar adicionado na Reunião 5: toda rota de leitura passou a exigir login
router.get('/dashboard', autenticar, async (_req: Request, res: Response) => {
    let conn;

    try {
        conn = await getConn();

        // 1. Total de demandas cadastradas
        const totalResult = await conn.execute(`
            SELECT COUNT(*) AS TOTAL
            FROM VW_DEMANDA_LISTAGEM
        `);

        // 2. Quantidade de demandas por status
        const statusResult = await conn.execute(`
            SELECT STATUS AS NOME, COUNT(*) AS QUANTIDADE
            FROM VW_DEMANDA_LISTAGEM
            GROUP BY STATUS
        `);

        // 3. Quantidade de demandas por prioridade
        const prioridadeResult = await conn.execute(`
            SELECT PRIORIDADE AS NOME, COUNT(*) AS QUANTIDADE
            FROM VW_DEMANDA_LISTAGEM
            GROUP BY PRIORIDADE
        `);

        // 4. Quantidade de demandas por tipo
        const tipoResult = await conn.execute(`
            SELECT TIPO AS NOME, COUNT(*) AS QUANTIDADE
            FROM VW_DEMANDA_LISTAGEM
            GROUP BY TIPO
        `);

        // 5. Demandas críticas em aberto
        // NIVEL_PRIORIDADE = 1 representa Crítica; STATUS_FINAL = 'N' exclui Concluída e Cancelada
        const criticasResult = await conn.execute(`
            SELECT
                ID_DEMANDA AS "id",
                TITULO AS "titulo",
                DESCRICAO AS "descricao",
                TIPO AS "tipo",
                PRIORIDADE AS "prioridade",
                STATUS AS "status",
                ID_PROJETO AS "projetoId",
                PROJETO AS "projeto",
                ID_RESPONSAVEL AS "responsavelId",
                RESPONSAVEL AS "responsavel",
                TO_CHAR(DATA_CRIACAO, 'YYYY-MM-DD') AS "dataCriacao",
                TO_CHAR(DATA_ATUALIZACAO, 'YYYY-MM-DD') AS "dataAtualizacao",
                TO_CHAR(PRAZO_FINALIZACAO, 'YYYY-MM-DD') AS "prazoFinalizacao"
            FROM VW_DEMANDA_LISTAGEM
            WHERE NIVEL_PRIORIDADE = 1
              AND STATUS_FINAL = 'N'
            ORDER BY PRAZO_FINALIZACAO NULLS LAST
        `);

        // 6. Demandas em aberto vencidas ou com prazo nos próximos 7 dias
        const prazoResult = await conn.execute(`
            SELECT
                ID_DEMANDA AS "id",
                TITULO AS "titulo",
                DESCRICAO AS "descricao",
                TIPO AS "tipo",
                PRIORIDADE AS "prioridade",
                STATUS AS "status",
                ID_PROJETO AS "projetoId",
                PROJETO AS "projeto",
                ID_RESPONSAVEL AS "responsavelId",
                RESPONSAVEL AS "responsavel",
                TO_CHAR(DATA_CRIACAO, 'YYYY-MM-DD') AS "dataCriacao",
                TO_CHAR(DATA_ATUALIZACAO, 'YYYY-MM-DD') AS "dataAtualizacao",
                TO_CHAR(PRAZO_FINALIZACAO, 'YYYY-MM-DD') AS "prazoFinalizacao"
            FROM VW_DEMANDA_LISTAGEM
            WHERE STATUS_FINAL = 'N'
              AND PRAZO_FINALIZACAO IS NOT NULL
              AND PRAZO_FINALIZACAO < TRUNC(SYSDATE) + 8
            ORDER BY PRAZO_FINALIZACAO ASC
        `);

        // Inicializa todas as categorias com 0 para garantir retorno completo
        const porStatus: Record<string, number> = {
            'Aberta': 0,
            'Em andamento': 0,
            'Em revisão': 0,
            'Concluída': 0,
            'Cancelada': 0
        };

        const porPrioridade: Record<string, number> = {
            'Crítica': 0,
            'Alta': 0,
            'Média': 0,
            'Baixa': 0
        };

        const porTipo: Record<string, number> = {
            'Tarefa': 0,
            'Defeito': 0,
            'Melhoria': 0,
            'Documentação': 0
        };

        for (const row of (statusResult.rows ?? []) as any[]) {
            porStatus[row.NOME] = row.QUANTIDADE;
        }

        for (const row of (prioridadeResult.rows ?? []) as any[]) {
            porPrioridade[row.NOME] = row.QUANTIDADE;
        }

        for (const row of (tipoResult.rows ?? []) as any[]) {
            porTipo[row.NOME] = row.QUANTIDADE;
        }

        const total = (totalResult.rows as any[])?.[0]?.TOTAL ?? 0;

        res.status(200).json({
            total,
            porStatus,
            porPrioridade,
            porTipo,
            criticasEmAberto: criticasResult.rows ?? [],
            proximasDoPrazo: prazoResult.rows ?? []
        });
    } catch (error) {
        console.error('Erro ao consultar dashboard:', error);
        res.status(500).json({
            erro: 'Não foi possível carregar os dados do dashboard.'
        });
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});

export default router;