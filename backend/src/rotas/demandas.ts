/*
Autor: Eduardo Zinetti Betini
*/

import { Router, Request, Response } from 'express';
import { TIPOS_DEMANDA, PRIORIDADES, projetos, usuarios, demandas } from '../dados/banco.js';
import type { Demanda } from '../dados/banco.js';

// confere se a data existe de fato (new Date sozinho não pega casos como 30/02, ele joga pra março)
function dataValida(str: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    const [ano, mes, dia] = str.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
}

const router = Router();

// post /demandas
router.post('/demandas', (req: Request, res: Response) => {
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

    // o projeto é obrigatório e precisa existir; o responsável é opcional, mas se vier, também precisa existir
    if (projetoId !== undefined && projetoId !== null && !projetos.find((p) => p.id === projetoId)) {
        erros.push('Projeto não encontrado.');
    }

    if (responsavelId !== undefined && responsavelId !== null && !usuarios.find((u) => u.id === responsavelId)) {
        erros.push('Responsável não encontrado.');
    }

    // prazo é opcional, só valida o formato quando ele é enviado
    if (prazoFinalizacao !== undefined && prazoFinalizacao !== null && prazoFinalizacao !== '' && !dataValida(prazoFinalizacao)) {
        erros.push('Prazo de finalização inválido. Use o formato AAAA-MM-DD com uma data real.');
    }

    // 400: algum dado obrigatório ausente ou inválido
    if (erros.length > 0) {
        res.status(400).json({ erro: erros.join(' ') });
        return;
    }

    // status, dataCriacao e dataAtualizacao são sempre definidos aqui, nunca lidos do corpo da requisição
    // (assim o cliente não consegue forçar esses valores, mesmo mandando eles no json)
    const agora = new Date().toISOString();
    const proximoId = demandas.length > 0 ? Math.max(...demandas.map((d) => d.id)) + 1 : 1;

    const novaDemanda: Demanda = {
        id: proximoId,
        titulo,
        descricao,
        tipo,
        prioridade,
        status: 'Aberta',
        projetoId,
        responsavelId: responsavelId ?? null,
        dataCriacao: agora,
        dataAtualizacao: agora,
        prazoFinalizacao: prazoFinalizacao ?? null,
    };

    // 201: demanda criada com sucesso
    demandas.push(novaDemanda);
    res.status(201).json(novaDemanda);
});

export default router;