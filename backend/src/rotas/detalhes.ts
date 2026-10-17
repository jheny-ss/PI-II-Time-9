/*
Autor: Julia Bezerra de Paula
*/

import { Router, Request, Response } from 'express';
import { demandas, comentarios, usuarios, projetos } from '../dados/banco.js';
import type { Comentario } from '../dados/banco.js';

const router = Router();

// Converte o :id da URL em número; devolve null se não for um inteiro positivo (ex.: /demandas/abc)
function lerId(valor: string): number | null {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// Devolve só o que a tela precisa do usuário (nunca a senha)
function resumoUsuario(usuarioId: number | null) {
    const usuario = usuarios.find((u) => u.id === usuarioId);
    return usuario ? { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil } : null;
}

// GET /demandas/:id
router.get('/demandas/:id', (req: Request<{ id: string }>, res: Response) => {
    const id = lerId(req.params.id);

    // 400: o id da URL não é um número válido
    if (id === null) {
        res.status(400).json({ erro: 'O id da demanda deve ser um número inteiro positivo.' });
        return;
    }

    const demanda = demandas.find((d) => d.id === id);

    // 404: nenhuma demanda com esse id
    if (!demanda) {
        res.status(404).json({ erro: 'Demanda não encontrada.' });
        return;
    }

    // 200: todos os campos da demanda + nome do projeto e do responsável, para a tela não precisar buscar de novo
    const projeto = projetos.find((p) => p.id === demanda.projetoId);
    res.status(200).json({
        ...demanda,
        projeto: projeto ? { id: projeto.id, nome: projeto.nome } : null,
        responsavel: resumoUsuario(demanda.responsavelId),
    });
});

// GET /demandas/:id/comentarios
router.get('/demandas/:id/comentarios', (req: Request<{ id: string }>, res: Response) => {
    const id = lerId(req.params.id);

    if (id === null) {
        res.status(400).json({ erro: 'O id da demanda deve ser um número inteiro positivo.' });
        return;
    }

    // 404: não dá para listar comentários de uma demanda que não existe
    if (!demandas.find((d) => d.id === id)) {
        res.status(404).json({ erro: 'Demanda não encontrada.' });
        return;
    }

    // 200: comentários da demanda, do mais antigo para o mais recente, com o autor de cada um
    const lista = comentarios
        .filter((c) => c.demandaId === id)
        .sort((a, b) => a.dataHora.localeCompare(b.dataHora))
        .map((c) => ({ ...c, usuario: resumoUsuario(c.usuarioId) }));

    res.status(200).json(lista);
});

// POST /demandas/:id/comentarios
router.post('/demandas/:id/comentarios', (req: Request<{ id: string }>, res: Response) => {
    const id = lerId(req.params.id);

    if (id === null) {
        res.status(400).json({ erro: 'O id da demanda deve ser um número inteiro positivo.' });
        return;
    }

    // 404: o comentário precisa estar vinculado a uma demanda existente
    if (!demandas.find((d) => d.id === id)) {
        res.status(404).json({ erro: 'Demanda não encontrada.' });
        return;
    }

    // No Express 5, req.body é undefined quando nenhum corpo é enviado
    const { usuarioId, texto } = req.body ?? {};
    const erros: string[] = [];

    // o texto não pode ser vazio nem só espaços
    if (typeof texto !== 'string' || texto.trim() === '') {
        erros.push('O campo "texto" é obrigatório e não pode ser vazio.');
    }

    // o comentário precisa estar vinculado a um usuário existente
    if (usuarioId === undefined || usuarioId === null) {
        erros.push('O campo "usuarioId" é obrigatório.');
    } else if (!usuarios.find((u) => u.id === usuarioId)) {
        erros.push('Usuário não encontrado.');
    }

    // 400: dados inválidos
    if (erros.length > 0) {
        res.status(400).json({ erro: erros.join(' ') });
        return;
    }

    // id e dataHora são definidos pelo servidor, nunca lidos do corpo da requisição
    const proximoId = comentarios.length > 0 ? Math.max(...comentarios.map((c) => c.id)) + 1 : 1;

    const novoComentario: Comentario = {
        id: proximoId,
        demandaId: id,
        usuarioId,
        texto: texto.trim(),
        dataHora: new Date().toISOString(),
    };

    // 201: comentário registrado
    comentarios.push(novoComentario);
    res.status(201).json({ ...novoComentario, usuario: resumoUsuario(usuarioId) });
});

export default router;