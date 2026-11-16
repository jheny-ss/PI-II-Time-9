/*
Autor: Eduardo Zinetti Betini
*/

import { Router, Request, Response } from 'express';
import oracledb from 'oracledb';
import { TIPOS_DEMANDA, PRIORIDADES } from '../dados/banco.js';
import { getConn } from '../db.js';
import { autenticar } from '../middlewares/autenticar.js';
import { autorizar } from '../middlewares/autorizar.js';
import { PERFIS } from '../utils/permissoes.js';
import { registrarHistorico } from './historico.js';
import { verificarFeriado, ErroConsultaFeriado } from '../servicos/feriados.js';

// confere se a data existe de fato (new Date sozinho não pega casos como 30/02, ele joga pra março)
function dataValida(str: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    const [ano, mes, dia] = str.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
}

const router = Router();

// post /demandas: cria uma demanda nova direto no oracle. exige login (precisa saber quem é o criador)
router.post('/demandas', autenticar, async (req: Request, res: Response) => {
    const corpo = req.body ?? {};
    const { titulo, descricao, tipo, prioridade, projetoId, responsavelId, prazoFinalizacao } = corpo;

    const erros: string[] = [];

    // campos obrigatorios
    if (typeof titulo !== 'string' || titulo.trim() === '') erros.push('O campo "título" é obrigatório.');
    if (typeof descricao !== 'string' || descricao.trim() === '') erros.push('O campo "descrição" é obrigatório.');
    if (typeof tipo !== 'string' || tipo.trim() === '') erros.push('O campo "tipo" é obrigatório.');
    if (typeof prioridade !== 'string' || prioridade.trim() === '') erros.push('O campo "prioridade" é obrigatório.');
    if (projetoId === undefined || projetoId === null) erros.push('O campo "projeto" é obrigatório.');

    // tipo e prioridade só podem ser um dos valores pré-definidos em banco.ts
    if (typeof tipo === 'string' && tipo.trim() !== '' && !TIPOS_DEMANDA.includes(tipo as any)) {
        erros.push(`Tipo inválido. Use um dos seguintes: ${TIPOS_DEMANDA.join(', ')}.`);
    }

    if (typeof prioridade === 'string' && prioridade.trim() !== '' && !PRIORIDADES.includes(prioridade as any)) {
        erros.push(`Prioridade inválida. Use uma das seguintes: ${PRIORIDADES.join(', ')}.`);
    }

    // prazo é opcional; só valida formato e "não pode ser no passado" quando ele é enviado.
    // checagem de feriado nacional ainda não entra aqui: depende do verificarFeriado do Rafael, que ainda não está disponível.
    if (prazoFinalizacao !== undefined && prazoFinalizacao !== null && prazoFinalizacao !== '') {
        if (!dataValida(prazoFinalizacao)) {
            erros.push('Prazo de finalização inválido. Use o formato AAAA-MM-DD com uma data real.');
        } else {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            if (new Date(`${prazoFinalizacao}T00:00:00`) < hoje) {
                erros.push('Prazo de finalização não pode ser uma data no passado.');
            }
        }
    }

    // 400: algum dado obrigatório ausente ou inválido
    if (erros.length > 0) {
        res.status(400).json({ erro: erros.join(' ') });
        return;
    }

    let conn;
    try {
        conn = await getConn();

        // projeto é obrigatório e precisa existir e estar ativo
        const projeto = await conn.execute(
            `SELECT ID_PROJETO FROM PROJETO WHERE ID_PROJETO = :projetoId AND ATIVO = 'S'`,
            { projetoId }
        );
        if (!projeto.rows || projeto.rows.length === 0) {
            res.status(400).json({ erro: 'Projeto não encontrado.' });
            return;
        }

        // responsável é opcional, mas se vier, também precisa existir e estar ativo
        if (responsavelId !== undefined && responsavelId !== null) {
            const responsavel = await conn.execute(
                `SELECT ID_USUARIO FROM USUARIO WHERE ID_USUARIO = :responsavelId AND ATIVO = 'S'`,
                { responsavelId }
            );
            if (!responsavel.rows || responsavel.rows.length === 0) {
                res.status(400).json({ erro: 'Responsável não encontrado.' });
                return;
            }
        }

        // id_tipo/id_prioridade resolvidos pelo nome; id_status, data_criacao e data_atualizacao ficam por conta do default do próprio banco (1 = Aberta, sysdate), nunca vêm do corpo da requisição.
        // id_criador vem de quem está logado (do token), nunca do corpo da requisição.
        const insercao = await conn.execute(
            `INSERT INTO DEMANDA (
                TITULO, DESCRICAO, ID_TIPO, ID_PRIORIDADE, ID_PROJETO,
                ID_RESPONSAVEL, ID_CRIADOR, PRAZO_FINALIZACAO
            ) VALUES (
                :titulo, :descricao,
                (SELECT ID_TIPO FROM TIPO_DEMANDA WHERE NOME = :tipo),
                (SELECT ID_PRIORIDADE FROM PRIORIDADE WHERE NOME = :prioridade),
                :projetoId, :responsavelId, :idCriador, :prazoFinalizacao
            ) RETURNING ID_DEMANDA INTO :novoId`,
            {
                titulo, descricao, tipo, prioridade, projetoId,
                responsavelId: responsavelId ?? null,
                idCriador: req.usuario!.idUsuario,
                prazoFinalizacao: prazoFinalizacao ? new Date(`${prazoFinalizacao}T00:00:00`) : null,
                novoId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: true }
        );

        const novoId = (insercao.outBinds as { novoId: number[] }).novoId[0];

        // registra a criação no histórico, já com o id gerado pelo banco
        await registrarHistorico(novoId, req.usuario!.idUsuario, 'CRIACAO', null, null);

        // busca a demanda recém-criada na view, que devolve os nomes em vez dos ids
        const resultado = await conn.execute(
            `SELECT * FROM VW_DEMANDA_LISTAGEM WHERE ID_DEMANDA = :novoId`,
            { novoId }
        );

        // 201: demanda criada com sucesso
        res.status(201).json(resultado.rows?.[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao criar demanda.' });
    } finally {
        if (conn) await conn.close();
    }
});

// put /demandas/:id: edição dos dados básicos (título, descrição, tipo) de uma demanda já existente no banco.
// responsável, prioridade e prazo não entram aqui: essas trocas são restritas por perfil e exigem checagem de feriado + registro de histórico.
router.put('/demandas/:id', autenticar, async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    // id da url precisa ser um inteiro positivo
    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ erro: 'Id inválido.' });
        return;
    }

    const corpo = req.body ?? {};
    const { titulo, descricao, tipo } = corpo;

    const erros: string[] = [];

    if (typeof titulo !== 'string' || titulo.trim() === '') erros.push('O campo "título" é obrigatório.');
    if (typeof descricao !== 'string' || descricao.trim() === '') erros.push('O campo "descrição" é obrigatório.');
    if (typeof tipo !== 'string' || tipo.trim() === '') erros.push('O campo "tipo" é obrigatório.');

    if (typeof tipo === 'string' && tipo.trim() !== '' && !TIPOS_DEMANDA.includes(tipo as any)) {
        erros.push(`Tipo inválido. Use um dos seguintes: ${TIPOS_DEMANDA.join(', ')}.`);
    }

    if (erros.length > 0) {
        res.status(400).json({ erro: erros.join(' ') });
        return;
    }

    let conn;
    try {
        conn = await getConn();

        // busca o título antigo antes de sobrescrever: serve tanto pra confirmar que a demanda existe
        // (404 se não existir) quanto pra registrar valor_anterior/valor_novo reais no histórico
        const demandaAtual = await conn.execute<{ TITULO: string }>(
            `SELECT TITULO FROM DEMANDA WHERE ID_DEMANDA = :id`,
            { id }
        );

        if (!demandaAtual.rows || demandaAtual.rows.length === 0) {
            res.status(404).json({ erro: 'Demanda não encontrada.' });
            return;
        }

        const tituloAntigo = demandaAtual.rows[0].TITULO;

        // data_atualizacao é sempre definida pelo servidor (sysdate do banco), nunca recebida do cliente.
        // o id_tipo é resolvido pelo nome na própria query, igual nos seeds (os ids da identity não são previsíveis)
        await conn.execute(
            `UPDATE DEMANDA
                SET TITULO = :titulo,
                    DESCRICAO = :descricao,
                    ID_TIPO = (SELECT ID_TIPO FROM TIPO_DEMANDA WHERE NOME = :tipo),
                    DATA_ATUALIZACAO = SYSTIMESTAMP
              WHERE ID_DEMANDA = :id`,
            { titulo, descricao, tipo, id },
            { autoCommit: true }
        );

        // registra a edição no histórico (item 2.2.7) - só grava se o título realmente mudou,
        // pra não duplicar registro quando o usuário reenvia os mesmos dados
        await registrarHistorico(id, req.usuario!.idUsuario, 'EDICAO', tituloAntigo, titulo);

        // busca a demanda já atualizada na view, que devolve os nomes em vez dos ids
        const resultado = await conn.execute(
            `SELECT * FROM VW_DEMANDA_LISTAGEM WHERE ID_DEMANDA = :id`,
            { id }
        );

        res.status(200).json(resultado.rows?.[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar demanda.' });
    } finally {
        if (conn) await conn.close();
    }
});

// patch /demandas/:id/atribuicao: altera responsável, prioridade e/ou prazo de uma demanda já existente.
// restrito a administrador e líder de projeto (regra de negócio - membro da equipe não pode reatribuir).
// toda mudança de prazo passa pela checagem de feriado nacional (verificarFeriado, serviço do Rafael)
// antes de ser aceita, e cada campo alterado gera seu próprio registro no histórico.
router.patch(
    '/demandas/:id/atribuicao',
    autenticar,
    autorizar(PERFIS.ADMINISTRADOR, PERFIS.LIDER_PROJETO),
    async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ erro: 'Id inválido.' });
            return;
        }

        const corpo = req.body ?? {};
        const { responsavelId, prioridade, prazoFinalizacao } = corpo;

        // pelo menos um dos três campos precisa vir no corpo
        if (responsavelId === undefined && prioridade === undefined && prazoFinalizacao === undefined) {
            res.status(400).json({ erro: 'Informe ao menos um campo: responsavelId, prioridade ou prazoFinalizacao.' });
            return;
        }

        const erros: string[] = [];

        // responsavelId pode ser null (remover responsável) ou um número; nunca outro tipo
        if (responsavelId !== undefined && responsavelId !== null && typeof responsavelId !== 'number') {
            erros.push('O campo "responsavelId" deve ser um número ou null.');
        }

        if (prioridade !== undefined && (typeof prioridade !== 'string' || !PRIORIDADES.includes(prioridade as any))) {
            erros.push(`Prioridade inválida. Use uma das seguintes: ${PRIORIDADES.join(', ')}.`);
        }

        // prazoFinalizacao pode ser null (remover prazo) ou uma data válida, não anterior a hoje
        if (prazoFinalizacao !== undefined && prazoFinalizacao !== null) {
            if (typeof prazoFinalizacao !== 'string' || !dataValida(prazoFinalizacao)) {
                erros.push('Prazo de finalização inválido. Use o formato AAAA-MM-DD com uma data real.');
            } else {
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                if (new Date(`${prazoFinalizacao}T00:00:00`) < hoje) {
                    erros.push('Prazo de finalização não pode ser uma data no passado.');
                }
            }
        }

        if (erros.length > 0) {
            res.status(400).json({ erro: erros.join(' ') });
            return;
        }

        // checagem de feriado nacional: só roda quando um prazo novo e válido foi enviado
        if (prazoFinalizacao !== undefined && prazoFinalizacao !== null) {
            try {
                const ehFeriado = await verificarFeriado(prazoFinalizacao);
                if (ehFeriado) {
                    res.status(400).json({ erro: 'Prazo de finalização não pode cair em um feriado nacional.' });
                    return;
                }
            } catch (erroFeriado) {
                // falha ao consultar a api externa de feriados: não dá pra confirmar, então bloqueia por segurança
                console.error(erroFeriado);
                const mensagem = erroFeriado instanceof ErroConsultaFeriado
                    ? erroFeriado.message
                    : 'Não foi possível verificar feriados nacionais agora. Tente novamente.';
                res.status(502).json({ erro: mensagem });
                return;
            }
        }

        let conn;
        try {
            conn = await getConn();

            // busca os valores atuais: confirma que a demanda existe e dá os valores "antigos" reais pro histórico
            const atual = await conn.execute<{
                RESPONSAVEL_NOME: string | null;
                PRIORIDADE_NOME: string;
                PRAZO_FINALIZACAO: Date | null;
            }>(
                `SELECT u.NOME AS RESPONSAVEL_NOME, p.NOME AS PRIORIDADE_NOME, d.PRAZO_FINALIZACAO
                   FROM DEMANDA d
                   JOIN PRIORIDADE p ON p.ID_PRIORIDADE = d.ID_PRIORIDADE
                   LEFT JOIN USUARIO u ON u.ID_USUARIO = d.ID_RESPONSAVEL
                  WHERE d.ID_DEMANDA = :id`,
                { id }
            );

            if (!atual.rows || atual.rows.length === 0) {
                res.status(404).json({ erro: 'Demanda não encontrada.' });
                return;
            }

            const demandaAtual = atual.rows[0];

            // responsável é opcional, mas se vier (e não for null, que significa "remover"), precisa existir e estar ativo
            let novoResponsavelNome: string | null = demandaAtual.RESPONSAVEL_NOME;
            if (responsavelId !== undefined && responsavelId !== null) {
                const responsavel = await conn.execute<{ NOME: string }>(
                    `SELECT NOME FROM USUARIO WHERE ID_USUARIO = :responsavelId AND ATIVO = 'S'`,
                    { responsavelId }
                );
                if (!responsavel.rows || responsavel.rows.length === 0) {
                    res.status(400).json({ erro: 'Responsável não encontrado.' });
                    return;
                }
                novoResponsavelNome = responsavel.rows[0].NOME;
            } else if (responsavelId === null) {
                novoResponsavelNome = null;
            }

            // monta o update só com os campos que de fato vieram no corpo
            const sets: string[] = ['DATA_ATUALIZACAO = SYSTIMESTAMP'];
            const binds: Record<string, any> = { id };

            if (responsavelId !== undefined) {
                sets.push('ID_RESPONSAVEL = :responsavelId');
                binds.responsavelId = responsavelId;
            }
            if (prioridade !== undefined) {
                sets.push('ID_PRIORIDADE = (SELECT ID_PRIORIDADE FROM PRIORIDADE WHERE NOME = :prioridade)');
                binds.prioridade = prioridade;
            }
            if (prazoFinalizacao !== undefined) {
                sets.push('PRAZO_FINALIZACAO = :prazoFinalizacao');
                binds.prazoFinalizacao = prazoFinalizacao ? new Date(`${prazoFinalizacao}T00:00:00`) : null;
            }

            await conn.execute(
                `UPDATE DEMANDA SET ${sets.join(', ')} WHERE ID_DEMANDA = :id`,
                binds,
                { autoCommit: true }
            );

            // registra no histórico só os campos que realmente vieram no corpo, um registro por campo
            if (responsavelId !== undefined) {
                await registrarHistorico(id, req.usuario!.idUsuario, 'RESPONSAVEL', demandaAtual.RESPONSAVEL_NOME, novoResponsavelNome);
            }
            if (prioridade !== undefined) {
                await registrarHistorico(id, req.usuario!.idUsuario, 'PRIORIDADE', demandaAtual.PRIORIDADE_NOME, prioridade);
            }
            if (prazoFinalizacao !== undefined) {
                const prazoAntigo = demandaAtual.PRAZO_FINALIZACAO
                    ? demandaAtual.PRAZO_FINALIZACAO.toISOString().slice(0, 10)
                    : null;
                await registrarHistorico(id, req.usuario!.idUsuario, 'PRAZO', prazoAntigo, prazoFinalizacao);
            }

            const resultado = await conn.execute(
                `SELECT * FROM VW_DEMANDA_LISTAGEM WHERE ID_DEMANDA = :id`,
                { id }
            );

            res.status(200).json(resultado.rows?.[0]);
        } catch (erro) {
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao atualizar atribuição da demanda.' });
        } finally {
            if (conn) await conn.close();
        }
    }
);

export default router;