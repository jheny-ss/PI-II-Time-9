/*
Autor: Julia Bezerra de Paula
*/

import { Router, Request, Response } from 'express';
import oracledb from 'oracledb';
import type { Connection } from 'oracledb';
import { getConn } from '../db.js';
import { autenticar } from '../middlewares/autenticar.js';

const router = Router();

// Converte o :id da URL em número; devolve null se não for um inteiro positivo (ex.: /demandas/abc)
function lerId(valor: string): number | null {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

/// A coluna TEXTO de COMENTARIO é VARCHAR2(2000), que conta bytes (acentos ocupam 2)
const TAMANHO_MAXIMO_TEXTO = 2000;


// Confere se a demanda existe antes de listar ou gravar comentários nela
async function demandaExiste(conn: Connection, id: number): Promise<boolean> {
    const resultado = await conn.execute(
        `SELECT 1 FROM DEMANDA WHERE ID_DEMANDA = :id`,
        { id }
    );
    return (resultado.rows?.length ?? 0) > 0;
}

// Consulta dos comentários com o nome e o perfil do autor (nunca a senha).
// O filtro é completado por quem usa: por demanda (GET) ou por comentário (resposta do POST).
const SELECT_COMENTARIOS = `
    SELECT c.ID_COMENTARIO, c.ID_DEMANDA, c.ID_USUARIO, c.TEXTO, c.DATA_HORA,
           u.NOME AS USUARIO_NOME, pe.NOME AS USUARIO_PERFIL
      FROM COMENTARIO c
      JOIN USUARIO u ON u.ID_USUARIO = c.ID_USUARIO
      JOIN PERFIL pe ON pe.ID_PERFIL = u.ID_PERFIL`;

// Converte uma linha do banco (colunas em MAIÚSCULAS) para o formato da API
function montarComentario(linha: any) {
    return {
        id: linha.ID_COMENTARIO,
        demandaId: linha.ID_DEMANDA,
        usuarioId: linha.ID_USUARIO,
        texto: linha.TEXTO,
        dataHora: linha.DATA_HORA,
        usuario: { id: linha.ID_USUARIO, nome: linha.USUARIO_NOME, perfil: linha.USUARIO_PERFIL },
    };
}


// GET /demandas/:id
// autenticar adicionado na Reunião 5: toda rota de leitura passou a exigir login
router.get('/demandas/:id', autenticar, async (req: Request<{ id: string }>, res: Response) => {
    const id = lerId(req.params.id);

    // 400: o id da URL não é um número válido
    if (id === null) {
        res.status(400).json({ erro: 'O id da demanda deve ser um número inteiro positivo.' });
        return;
    }

    let conn;

    try {
        conn = await getConn();

        // A view já traz os nomes de tipo, prioridade, status, projeto e responsável;
        // os joins buscam o perfil do responsável e o nome de quem criou a demanda.
        // O prazo vira texto AAAA-MM-DD para não sofrer ajuste de fuso horário no JSON.
        const resultado = await conn.execute(
            `SELECT v.ID_DEMANDA, v.TITULO, v.DESCRICAO, v.TIPO, v.PRIORIDADE, v.STATUS,
                    v.ID_PROJETO, v.PROJETO, v.ID_RESPONSAVEL, v.RESPONSAVEL,
                    pr.NOME AS RESPONSAVEL_PERFIL,
                    v.ID_CRIADOR, c.NOME AS CRIADOR,
                    v.DATA_CRIACAO, v.DATA_ATUALIZACAO,
                    TO_CHAR(v.PRAZO_FINALIZACAO, 'YYYY-MM-DD') AS PRAZO_FINALIZACAO
               FROM VW_DEMANDA_LISTAGEM v
               LEFT JOIN USUARIO r  ON r.ID_USUARIO = v.ID_RESPONSAVEL
               LEFT JOIN PERFIL  pr ON pr.ID_PERFIL = r.ID_PERFIL
               JOIN USUARIO c       ON c.ID_USUARIO = v.ID_CRIADOR
              WHERE v.ID_DEMANDA = :id`,
            { id }
        );

        const d: any = resultado.rows?.[0];
    

    // 404: nenhuma demanda com esse id
    if (!d) {
        res.status(404).json({ erro: 'Demanda não encontrada.' });
        return;
    }

    // 200: todos os campos da demanda + nome do projeto e do responsável, para a tela não precisar buscar de novo
    res.status(200).json({
            id: d.ID_DEMANDA,
            titulo: d.TITULO,
            descricao: d.DESCRICAO,
            tipo: d.TIPO,
            prioridade: d.PRIORIDADE,
            status: d.STATUS,
            projetoId: d.ID_PROJETO,
            responsavelId: d.ID_RESPONSAVEL,
            dataCriacao: d.DATA_CRIACAO,
            dataAtualizacao: d.DATA_ATUALIZACAO,
            prazoFinalizacao: d.PRAZO_FINALIZACAO,
            projeto: { id: d.ID_PROJETO, nome: d.PROJETO },
            responsavel: d.ID_RESPONSAVEL === null
                ? null
                : { id: d.ID_RESPONSAVEL, nome: d.RESPONSAVEL, perfil: d.RESPONSAVEL_PERFIL },
            criador: { id: d.ID_CRIADOR, nome: d.CRIADOR },
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar a demanda.' });
    } finally {
        if (conn) await conn.close();
    }
});


// GET /demandas/:id/comentarios
// autenticar adicionado na Reunião 5: toda rota de leitura passou a exigir login
router.get('/demandas/:id/comentarios', autenticar, async (req: Request<{ id: string }>, res: Response) => {
    const id = lerId(req.params.id);

    if (id === null) {
        res.status(400).json({ erro: 'O id da demanda deve ser um número inteiro positivo.' });
        return;
    }

    let conn;
    try {
        conn = await getConn();

        // 404: não dá para listar comentários de uma demanda que não existe
        if (!(await demandaExiste(conn, id))) {
            res.status(404).json({ erro: 'Demanda não encontrada.' });
            return;
        }

        // 200: comentários da demanda, do mais antigo para o mais recente (lista vazia se não houver)
        const resultado = await conn.execute(
            `${SELECT_COMENTARIOS}
              WHERE c.ID_DEMANDA = :id
              ORDER BY c.DATA_HORA, c.ID_COMENTARIO`,
            { id }
        );

        res.status(200).json((resultado.rows ?? []).map(montarComentario));
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar os comentários.' });
    } finally {
        if (conn) await conn.close();
    }
});

// POST /demandas/:id/comentarios
router.post('/demandas/:id/comentarios', autenticar, async (req: Request<{ id: string }>, res: Response) => {
    const id = lerId(req.params.id);

    if (id === null) {
        res.status(400).json({ erro: 'O id da demanda deve ser um número inteiro positivo.' });
        return;
    }

    // No Express 5, req.body é undefined quando nenhum corpo é enviado.
    // usuarioId vem de quem está logado (do token), nunca do corpo da requisição -
    // senão qualquer pessoa autenticada poderia postar um comentário em nome de outra.
    const { texto } = req.body ?? {};
    const usuarioId = req.usuario!.idUsuario;
    const erros: string[] = [];

    // o texto não pode ser vazio nem só espaços, e precisa caber na coluna do banco
    if (typeof texto !== 'string' || texto.trim() === '') {
        erros.push('O campo "texto" é obrigatório e não pode ser vazio.');
    } else if (Buffer.byteLength(texto.trim(), 'utf8') > TAMANHO_MAXIMO_TEXTO) {
        erros.push('O texto do comentário é muito longo.');
    }

    let conn;
    try {
        conn = await getConn();

        // 404: o comentário precisa estar vinculado a uma demanda existente
        if (!(await demandaExiste(conn, id))) {
            res.status(404).json({ erro: 'Demanda não encontrada.' });
            return;
        }

        // o comentário precisa estar vinculado a um usuário existente e ativo
        if (erros.length === 0) {
            const usuario = await conn.execute(
                `SELECT 1 FROM USUARIO WHERE ID_USUARIO = :usuarioId AND ATIVO = 'S'`,
                { usuarioId }
            );
            if ((usuario.rows?.length ?? 0) === 0) erros.push('Usuário não encontrado.');
        }

        // 400: dados inválidos
        if (erros.length > 0) {
            res.status(400).json({ erro: erros.join(' ') });
            return;
        }

        // DATA_HORA não é enviada: o banco preenche com SYSTIMESTAMP (DEFAULT da coluna),
        // então o cliente não consegue forçar a data. O id gerado volta pelo RETURNING.
        const insercao = await conn.execute(
            `INSERT INTO COMENTARIO (ID_DEMANDA, ID_USUARIO, TEXTO)
             VALUES (:id, :usuarioId, :texto)
             RETURNING ID_COMENTARIO INTO :novoId`,
            {
                id,
                usuarioId,
                texto: texto.trim(),
                novoId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            },
            { autoCommit: true }
        );

        const novoId = (insercao.outBinds as any).novoId[0];

        // busca o comentário gravado para devolver com a data e o autor
        const resultado = await conn.execute(
            `${SELECT_COMENTARIOS}
              WHERE c.ID_COMENTARIO = :novoId`,
            { novoId }
        );

        // 201: comentário registrado
        res.status(201).json(montarComentario(resultado.rows?.[0]));
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao registrar o comentário.' });
    } finally {
        if (conn) await conn.close();
    }
});

export default router;