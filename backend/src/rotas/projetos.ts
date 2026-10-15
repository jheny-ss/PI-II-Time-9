/*
Autor: Eduardo Zinetti Betini
*/

import { Router, Request, Response } from 'express';

import { projetos } from '../dados/banco.js';

const router = Router();

// get /projetos: lista os projetos pré-cadastrados
router.get('/projetos', (req: Request, res: Response) => {
    res.status(200).json(projetos);
});

export default router;