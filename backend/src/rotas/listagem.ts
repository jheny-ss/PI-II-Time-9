/*
Autor: Rafa

Rota de listagem de demandas: GET /demandas

O que ela faz (Documento de Visão, itens 2.2.9 e 2.3, e Reunião 4):
  - lista as demandas com id, título, tipo, prioridade, status, projeto,
    responsável, data de criação e prazo de finalização;
  - FILTRA por parâmetros na URL (todos opcionais; se vários forem
    informados, a demanda precisa atender a TODOS):
        status       -> Aberta, Em andamento, Em revisão, Concluída, Cancelada
        prioridade   -> Crítica, Alta, Média, Baixa
        tipo         -> Tarefa, Defeito, Melhoria, Documentação
        responsavel  -> id do usuário responsável (número)
        projeto      -> id do projeto (número)
  - BUSCA por texto no título ou na descrição: ?busca=login
  - ORDENA: ?ordenarPor=prioridade | dataCriacao | prazo | status
            &ordem=asc | desc   (padrão: asc)

Exemplos:
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
  - A senha dos usuários nunca é lida aqui: só pegamos o nome do responsável.
*/
import express from 'express';
import type { Request, Response } from 'express';
import {
    demandas,
    projetos,
    usuarios,
    TIPOS_DEMANDA,
    PRIORIDADES,
    STATUS_DEMANDA,
} from '../dados/banco.js';

import type { Demanda } from '../dados/banco.js';

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

/**
 * Devolve um número que representa a posição da demanda no campo escolhido.
 * Assim conseguimos comparar qualquer campo da mesma forma:
 *   - prioridade: posição na lista (Crítica = 0, Alta = 1, Média = 2, Baixa = 3)
 *   - status: posição no fluxo (Aberta = 0, ... , Cancelada = 4)
 *   - dataCriacao / prazo: a data convertida em número
 */
function valorParaOrdenar(demanda: Demanda, campo: string): number {
    if (campo === 'prioridade') {
        return PRIORIDADES.indexOf(demanda.prioridade);
    }
    if (campo === 'status') {
        return STATUS_DEMANDA.indexOf(demanda.status);
    }
    if (campo === 'dataCriacao') {
        return Date.parse(demanda.dataCriacao);
    }
    // campo === 'prazo' (os casos sem prazo são tratados antes, na ordenação)
    return Date.parse(demanda.prazoFinalizacao as string);
}

router.get('/demandas', (req: Request, res: Response) => {
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
    const textoBusca = normalizar(String(req.query.busca ?? ''));
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

    // 4) Filtra e busca: só entra no resultado quem passa por TODOS os testes
    const resultado: Demanda[] = [];
    for (const demanda of demandas) {
        if (status !== null && demanda.status !== status) {
            continue;
        }
        if (prioridade !== null && demanda.prioridade !== prioridade) {
            continue;
        }
        if (tipo !== null && demanda.tipo !== tipo) {
            continue;
        }
        if (responsavelId !== null && demanda.responsavelId !== responsavelId) {
            continue;
        }
        if (projetoId !== null && demanda.projetoId !== projetoId) {
            continue;
        }
        if (textoBusca !== '') {
            const noTitulo = normalizar(demanda.titulo).includes(textoBusca);
            const naDescricao = normalizar(demanda.descricao).includes(textoBusca);
            if (!noTitulo && !naDescricao) {
                continue;
            }
        }
        resultado.push(demanda);
    }

    // 5) Ordena (se foi pedido). Em empate, a ordem original (por id) é mantida.
    if (campoOrdenacao !== null) {
        const campo = campoOrdenacao;
        resultado.sort((a, b) => {
            // demandas sem prazo vão sempre para o fim, em qualquer sentido
            if (campo === 'prazo') {
                if (a.prazoFinalizacao === null && b.prazoFinalizacao === null) {
                    return 0;
                }
                if (a.prazoFinalizacao === null) {
                    return 1;
                }
                if (b.prazoFinalizacao === null) {
                    return -1;
                }
            }

            const valorA = valorParaOrdenar(a, campo);
            const valorB = valorParaOrdenar(b, campo);

            let comparacao = 0;
            if (valorA < valorB) {
                comparacao = -1;
            } else if (valorA > valorB) {
                comparacao = 1;
            }

            if (sentido === 'desc') {
                comparacao = -comparacao;
            }
            return comparacao;
        });
    }

    // 6) Monta a resposta trocando os ids de projeto e responsável pelos nomes
    const lista = [];
    for (const demanda of resultado) {
        const projeto = projetos.find((p) => p.id === demanda.projetoId);
        const responsavel = usuarios.find((u) => u.id === demanda.responsavelId);

        lista.push({
            id: demanda.id,
            titulo: demanda.titulo,
            tipo: demanda.tipo,
            prioridade: demanda.prioridade,
            status: demanda.status,
            projeto: projeto ? projeto.nome : null,
            responsavel: responsavel ? responsavel.nome : null, // null = sem responsável
            dataCriacao: demanda.dataCriacao,
            prazoFinalizacao: demanda.prazoFinalizacao, // 'AAAA-MM-DD' ou null
        });
    }

    res.status(200).json({ total: lista.length, demandas: lista });
});

export default router;
