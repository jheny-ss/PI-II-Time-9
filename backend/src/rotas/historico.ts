/*
Autor: Arthur Peripolli da Silva
Descrição: Registro automático e consulta do histórico de alterações das demandas (item 2.2.7)
*/

import { Router, Request, Response } from 'express';
import { getConn } from '../db.js';
import { autenticar } from '../middlewares/autenticar.js';

const router = Router();

// Valores exatos permitidos pela constraint CK_HISTORICO_TIPO no Oracle
export type TipoAlteracao =
    | 'CRIACAO'
    | 'STATUS'
    | 'RESPONSAVEL'
    | 'PRIORIDADE'
    | 'PRAZO'
    | 'EDICAO'
    | 'CANCELAMENTO';

function lerId(valor: string): number | null {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// Garante que textos grandes não estourem o tamanho da coluna VARCHAR2 no Oracle
function limitarTexto(valor: string | null | undefined, max: number): string | null {
    if (valor === null || valor === undefined || valor === '') return null;
    return valor.length > max ? valor.slice(0, max - 3) + '...' : valor;
}

/**
 * Registra automaticamente uma alteração na tabela HISTORICO_ALTERACAO.
 * Deve ser chamada pelas rotas de criação, edição, alteração de status e cancelamento.
 */
export async function registrarHistorico(
    idDemanda: number,
    idUsuario: number,
    tipoAlteracao: TipoAlteracao,
    valorAnterior: string | null,
    valorNovo: string | null
): Promise<void> {
    // Se não houve alteração real entre os valores (exceto na criação/cancelamento), não duplica registro
    if (tipoAlteracao !== 'CRIACAO' && tipoAlteracao !== 'CANCELAMENTO' && valorAnterior === valorNovo) {
        return;
    }

    const conn = await getConn();

    try {
        // Busca o nome de quem realizou a ação para montar a frase legível
        const resUsuario = await conn.execute<{ NOME: string }>(
            `SELECT NOME FROM USUARIO WHERE ID_USUARIO = :idUsuario`,
            { idUsuario }
        );
        const nomeUsuario = resUsuario.rows?.[0]?.NOME ?? `Usuário #${idUsuario}`;

        // Monta a descrição no formato do Documento de Visão (item 2.2.7)
        let descricao = '';
        switch (tipoAlteracao) {
            case 'CRIACAO':
                descricao = `${nomeUsuario} criou a demanda.`;
                break;
            case 'CANCELAMENTO':
                descricao = `${nomeUsuario} cancelou a demanda (status anterior: ${valorAnterior ?? 'N/A'}).`;
                break;
            case 'STATUS':
                descricao = `${nomeUsuario} alterou o status da demanda de ${valorAnterior} para ${valorNovo}.`;
                break;
            case 'RESPONSAVEL':
                descricao = valorAnterior
                    ? `${nomeUsuario} alterou o responsável de ${valorAnterior} para ${valorNovo ?? 'Sem responsável'}.`
                    : `${nomeUsuario} atribuiu a demanda para ${valorNovo}.`;
                break;
            case 'PRIORIDADE':
                descricao = `${nomeUsuario} alterou a prioridade de ${valorAnterior} para ${valorNovo}.`;
                break;
            case 'PRAZO':
                descricao = valorAnterior
                    ? `${nomeUsuario} alterou o prazo de finalização de ${valorAnterior} para ${valorNovo ?? 'Sem prazo'}.`
                    : `${nomeUsuario} definiu o prazo de finalização para ${valorNovo}.`;
                break;
            case 'EDICAO':
                descricao = `${nomeUsuario} editou os dados da demanda.`;
                break;
        }

        await conn.execute(
            `INSERT INTO HISTORICO_ALTERACAO (
                ID_DEMANDA, ID_USUARIO, TIPO_ALTERACAO, VALOR_ANTERIOR, VALOR_NOVO, DESCRICAO
            ) VALUES (
                :idDemanda, :idUsuario, :tipoAlteracao, :valorAnterior, :valorNovo, :descricao
            )`,
            {
                idDemanda,
                idUsuario,
                tipoAlteracao,
                valorAnterior: limitarTexto(valorAnterior, 200),
                valorNovo: limitarTexto(valorNovo, 200),
                descricao: limitarTexto(descricao, 500) ?? 'Alteração registrada.'
            },
            { autoCommit: true }
        );
    } finally {
        await conn.close();
    }
}

// GET /demandas/:id/historico -> Lista o histórico de alterações de uma demanda
// autenticar adicionado na Reunião 5: toda rota de leitura passou a exigir login
router.get('/demandas/:id/historico', autenticar, async (req: Request<{ id: string }>, res: Response) => {
    const id = lerId(req.params.id);

    if (id === null) {
        res.status(400).json({ erro: 'O id da demanda deve ser um número inteiro positivo.' });
        return;
    }

    let conn;

    try {
        conn = await getConn();

        // Confere se a demanda existe
        const resDemanda = await conn.execute(
            `SELECT ID_DEMANDA FROM DEMANDA WHERE ID_DEMANDA = :id`,
            { id }
        );

        if (!resDemanda.rows || resDemanda.rows.length === 0) {
            res.status(404).json({ erro: 'Demanda não encontrada.' });
            return;
        }

        // Busca os registros do histórico com o nome do usuário responsável pela alteração
        const resHistorico = await conn.execute(`
            SELECT
                h.ID_HISTORICO AS "id",
                h.ID_DEMANDA AS "demandaId",
                h.ID_USUARIO AS "usuarioId",
                u.NOME AS "usuarioNome",
                h.TIPO_ALTERACAO AS "tipoAlteracao",
                h.VALOR_ANTERIOR AS "valorAnterior",
                h.VALOR_NOVO AS "valorNovo",
                h.DESCRICAO AS "descricao",
                TO_CHAR(h.DATA_HORA, 'YYYY-MM-DD"T"HH24:MI:SS') AS "dataHora"
            FROM HISTORICO_ALTERACAO h
            JOIN USUARIO u ON u.ID_USUARIO = h.ID_USUARIO
            WHERE h.ID_DEMANDA = :id
            ORDER BY h.DATA_HORA ASC, h.ID_HISTORICO ASC
        `, { id });

        res.status(200).json(resHistorico.rows ?? []);
    } catch (error) {
        console.error('Erro ao consultar histórico:', error);
        res.status(500).json({ erro: 'Não foi possível carregar o histórico da demanda.' });
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});

// Regra 2.2.7: Não existe rota DELETE nem UPDATE para o histórico (ele nunca pode ser apagado).

export default router;