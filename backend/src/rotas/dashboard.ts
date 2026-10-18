/*
Autor: Arthur Peripolli da Silva
*/

import { Router, Request, Response } from 'express';
import { demandas } from '../dados/banco.js';

const router = Router();

// GET /dashboard
router.get('/dashboard', (req: Request, res: Response) => {

    // 1. Total de Demandas
    const total = demandas.length;

    // 2. Quantidades por status, prioridade e tipo
    const porStatus: Record<string, number> = {'Aberta': 0, 'Em andamento': 0, 'Em revisão': 0, 'Concluída': 0, 'Cancelada': 0};
    const porPrioridade: Record<string, number> = {'Critica': 0, 'Alta': 0, 'Média': 0, 'Baixa': 0};
    const porTipo: Record<string, number> = {'Tarefa': 0, 'Defeito': 0, 'Melhoria': 0, 'Documentação': 0};

    demandas.forEach(d => {
        if (porStatus[d.status] !== undefined) porStatus[d.status]++;
        if (porPrioridade[d.prioridade] !== undefined) porPrioridade[d.prioridade]++;
        if (porTipo[d.tipo] !== undefined) porTipo[d.tipo]++;
    });

    // Demandas Criticas em Aberto
    // Que nao estejam Concluidas ou Canceladas
    const statusEmAberto = ['Aberta', 'Em andamento', 'Em revisão'];

    const criticasEmAberto = demandas.filter(d => d.prioridade === 'Critica' && statusEmAberto.includes(d.status));

    // Demandas proximas do Prazo
    // Em aberto cujo prazo em 7 dias ou atrasadas
    const hoje = new Date();
    const daquiA7Dias = new Date();
    daquiA7Dias.setDate(hoje.getDate() + 7);

    const proximasDoPrazo = demandas.filter(d => {
        // se nao tem prazo ignora
        if (!d.prazoFinalizacao) return false;
        // se ja concluiu ou cancelou ignora
        if (!statusEmAberto.includes(d.status)) return false;

        const dataPrazo = new Date(d.prazoFinalizacao);
        return dataPrazo <= daquiA7Dias;
    });

    // 3. Retorna tudo com Status 200
    res.status(200).json({
        total,
        porStatus,
        porPrioridade,
        porTipo,
        criticasEmAberto,
        proximasDoPrazo
    });
});

export default router;