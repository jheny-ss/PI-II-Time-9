/*
Autor: Rafael

Exemplos no thunderclient:
  /demandas
  /demandas?status=Aberta&prioridade=Alta
  /demandas?tipo=Defeito&busca=login
  /demandas?ordenarPor=prazo&ordem=desc

Respostas:
  200 -> { total, demandas: [...] }
  400 -> { erro: 'mensagem clara' } quando algum parâmetro é inválido

Observações:
  - Filtros e busca ignoram maiúsculas/minúsculas e acentos
    (ex.: 'critica' encontra 'Crítica').
  - Parâmetro vazio (ex.: ?status=) é tratado como "não informado",
    como acontece com a opção "Todos" do formulário da tela.
  - Demandas sem prazo sempre ficam no fim quando ordenadas por prazo.
*/

import express from 'express';
import type { Request, Response } from 'express';
import {
    TIPOS_DEMANDA,
    PRIORIDADES,
    STATUS_DEMANDA,
} from '../dados/banco.js';
import { getConn } from '../db.js';

const router = express.Router();

// Nomes de todos os parâmetros que esta rota entende
const PARAMETROS = [
    'status',
    'prioridade',
    'tipo',
    'responsavel',
    'projeto',
    'busca',
    'ordenarPor',
    'ordem',
];

// Campos aceitos para ordenação e sentidos aceitos
const CAMPOS_ORDENACAO = ['prioridade', 'dataCriacao', 'prazo', 'status'];
const SENTIDOS = ['asc', 'desc'];

/**
 * Deixa o texto "comparável": tira os acentos, passa para minúsculas e
 * remove espaços das pontas. Ex.: '  Crítica ' vira 'critica'.
 */
function normalizar(texto: string): string {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/**
 * Procura o texto informado dentro de uma lista de valores válidos,
 * ignorando acentos e maiúsculas.
 * Retorna o valor oficial da lista (ex.: 'Crítica') ou null se não existir.
 */
function acharValorValido(lista: readonly string[], informado: string): string | null {
    for (let i = 0; i < lista.length; i++) {
        if (normalizar(lista[i]) === normalizar(informado)) {
            return lista[i];
        }
    }
    return null;
}

/**
 * Converte o texto para número inteiro positivo (id).
 * Retorna null se não for um número inteiro maior que zero.
 */
function lerId(texto: string): number | null {
    const numero = Number(texto);
    if (Number.isInteger(numero) && numero > 0) {
        return numero;
    }
    return null;
}

// traduz o campo de ordenação (já validado contra CAMPOS_ORDENACAO) pra uma coluna
// real da view - nunca monta isso com texto vindo direto do cliente, exatamente
// pra evitar que um valor poderia ser usado pra injetar sql no order by.
function colunaDeOrdenacao(campo: string): string {
    switch (campo) {
        case 'prioridade': return 'NIVEL_PRIORIDADE';
        case 'dataCriacao': return 'DATA_CRIACAO';
        case 'prazo': return 'PRAZO_FINALIZACAO';
        case 'status': return 'ORDEM_STATUS';
        default: return 'ID_DEMANDA';
    }
}

router.get('/demandas', async (req: Request, res: Response) => {
    // 1) Cada parâmetro deve vir uma única vez e como texto.
    //    (?status=Aberta&status=Alta, por exemplo, não é aceito.)
    for (let i = 0; i < PARAMETROS.length; i++) {
        const valor = req.query[PARAMETROS[i]];
        if (valor !== undefined && typeof valor !== 'string') {
            res.status(400).json({
                erro: `O parâmetro "${PARAMETROS[i]}" deve ser informado uma única vez, com um valor de texto.`,
            });
            return;
        }
    }

    // 2) Lê os parâmetros (texto vazio = não informado)
    const textoStatus = String(req.query.status ?? '').trim();
    const textoPrioridade = String(req.query.prioridade ?? '').trim();
    const textoTipo = String(req.query.tipo ?? '').trim();
    const textoResponsavel = String(req.query.responsavel ?? '').trim();
    const textoProjeto = String(req.query.projeto ?? '').trim();
    const textoBuscaBruto = String(req.query.busca ?? '').trim();
    const textoBusca = normalizar(textoBuscaBruto);
    const textoOrdenarPor = String(req.query.ordenarPor ?? '').trim();
    const textoOrdem = String(req.query.ordem ?? '').trim();

    // 3) Valida os valores informados (o servidor não confia na tela)
    let status: string | null = null;
    if (textoStatus !== '') {
        status = acharValorValido(STATUS_DEMANDA, textoStatus);
        if (status === null) {
            res.status(400).json({
                erro: `Status inválido: "${textoStatus}". Valores aceitos: ${STATUS_DEMANDA.join(', ')}.`,
            });
            return;
        }
    }

    let prioridade: string | null = null;
    if (textoPrioridade !== '') {
        prioridade = acharValorValido(PRIORIDADES, textoPrioridade);
        if (prioridade === null) {
            res.status(400).json({
                erro: `Prioridade inválida: "${textoPrioridade}". Valores aceitos: ${PRIORIDADES.join(', ')}.`,
            });
            return;
        }
    }

    let tipo: string | null = null;
    if (textoTipo !== '') {
        tipo = acharValorValido(TIPOS_DEMANDA, textoTipo);
        if (tipo === null) {
            res.status(400).json({
                erro: `Tipo inválido: "${textoTipo}". Valores aceitos: ${TIPOS_DEMANDA.join(', ')}.`,
            });
            return;
        }
    }

    let responsavelId: number | null = null;
    if (textoResponsavel !== '') {
        responsavelId = lerId(textoResponsavel);
        if (responsavelId === null) {
            res.status(400).json({
                erro: `Responsável inválido: "${textoResponsavel}". Informe o id do usuário (número inteiro maior que zero).`,
            });
            return;
        }
    }

    let projetoId: number | null = null;
    if (textoProjeto !== '') {
        projetoId = lerId(textoProjeto);
        if (projetoId === null) {
            res.status(400).json({
                erro: `Projeto inválido: "${textoProjeto}". Informe o id do projeto (número inteiro maior que zero).`,
            });
            return;
        }
    }

    let campoOrdenacao: string | null = null;
    if (textoOrdenarPor !== '') {
        campoOrdenacao = acharValorValido(CAMPOS_ORDENACAO, textoOrdenarPor);
        if (campoOrdenacao === null) {
            res.status(400).json({
                erro: `Campo de ordenação inválido: "${textoOrdenarPor}". Valores aceitos: ${CAMPOS_ORDENACAO.join(', ')}.`,
            });
            return;
        }
    }

    let sentido = 'asc';
    if (textoOrdem !== '') {
        const sentidoValido = acharValorValido(SENTIDOS, textoOrdem);
        if (sentidoValido === null) {
            res.status(400).json({
                erro: `Ordem inválida: "${textoOrdem}". Valores aceitos: ${SENTIDOS.join(', ')}.`,
            });
            return;
        }
        sentido = sentidoValido;
    }

    // 4) Monta o WHERE dinamicamente, só com os filtros que vieram, sempre com bind
    //    variables (nunca concatenando o valor do cliente direto na query)
    const condicoes: string[] = [];
    const binds: Record<string, unknown> = {};

    if (status !== null) {
        condicoes.push('STATUS = :status');
        binds.status = status;
    }
    if (prioridade !== null) {
        condicoes.push('PRIORIDADE = :prioridade');
        binds.prioridade = prioridade;
    }
    if (tipo !== null) {
        condicoes.push('TIPO = :tipo');
        binds.tipo = tipo;
    }
    if (responsavelId !== null) {
        condicoes.push('ID_RESPONSAVEL = :responsavelId');
        binds.responsavelId = responsavelId;
    }
    if (projetoId !== null) {
        condicoes.push('ID_PROJETO = :projetoId');
        binds.projetoId = projetoId;
    }
    if (textoBusca !== '') {
        // usa o texto bruto (só com espaços nas pontas removidos), não o normalizado:
        // o normalizado tira os acentos, e comparar isso contra a coluna com acento
        // nunca daria match nenhum. ignora maiúsculas/minúsculas (UPPER dos dois lados),
        // mas não ignora acentos como o array em memória fazia - é uma simplificação.
        condicoes.push('(UPPER(TITULO) LIKE UPPER(:busca) OR UPPER(DESCRICAO) LIKE UPPER(:busca))');
        binds.busca = `%${textoBuscaBruto}%`;
    }

    const whereSql = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';

    // 5) Monta o ORDER BY (coluna já vem de uma lista fixa, nunca do texto do cliente).
    //    Demandas sem prazo sempre ficam no fim, em qualquer sentido (NULLS LAST do Oracle).
    const coluna = colunaDeOrdenacao(campoOrdenacao ?? '');
    const direcao = sentido === 'desc' ? 'DESC' : 'ASC';
    const nullsLast = coluna === 'PRAZO_FINALIZACAO' ? ' NULLS LAST' : '';
    const orderBySql = `ORDER BY ${coluna} ${direcao}${nullsLast}`;

    let conn;
    try {
        conn = await getConn();

        const resultado = await conn.execute(
            `SELECT ID_DEMANDA, TITULO, TIPO, PRIORIDADE, STATUS, PROJETO, RESPONSAVEL,
                    DATA_CRIACAO, PRAZO_FINALIZACAO
               FROM VW_DEMANDA_LISTAGEM
               ${whereSql}
               ${orderBySql}`,
            binds
        );

        // 6) Traduz os nomes de coluna do oracle pro formato que a tela espera
        const lista = (resultado.rows as any[]).map((linha) => ({
            id: linha.ID_DEMANDA,
            titulo: linha.TITULO,
            tipo: linha.TIPO,
            prioridade: linha.PRIORIDADE,
            status: linha.STATUS,
            projeto: linha.PROJETO,
            responsavel: linha.RESPONSAVEL, // null = sem responsável
            dataCriacao: linha.DATA_CRIACAO,
            prazoFinalizacao: linha.PRAZO_FINALIZACAO,
        }));

        res.status(200).json({ total: lista.length, demandas: lista });
    } catch (erro) {
        console.error('Erro ao listar demandas:', erro);
        res.status(500).json({ erro: 'Erro ao consultar as demandas.' });
    } finally {
        if (conn) await conn.close();
    }
});

export default router;
