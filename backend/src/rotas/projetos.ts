/*
Autor: Eduardo Zinetti Betini
*/

import { Router, Request, Response } from 'express';
import { getConn } from '../db.js';

const router = Router();

// get /projetos: lista os projetos ativos direto do banco
router.get('/projetos', async (req: Request, res: Response) => {
    let conn;
    try {
        conn = await getConn();

        const resultado = await conn.execute(
            `SELECT ID_PROJETO, NOME, DESCRICAO FROM PROJETO WHERE ATIVO = 'S'`
        );

        res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar projetos.' });
    } finally {
        if (conn) await conn.close();
    }
});

export default router;
