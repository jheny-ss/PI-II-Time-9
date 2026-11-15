
/*
Autor: Rafa

Serviço de feriados nacionais (Reunião 5, item 2.2.5 do Documento de Visão).

Usa a BrasilAPI para verificar se uma data é feriado nacional.

Endpoint:
    GET https://brasilapi.com.br/api/feriados/v1/{ano}

Funções disponíveis:
    verificarFeriado(data) -> true se for feriado nacional, false se não for
    buscarFeriado(data)    -> feriado encontrado ou null

A lista de cada ano consultado fica guardada em memória enquanto
o servidor estiver rodando.

Erros:
    - Data inválida: Error
    - Falha ao consultar ou interpretar a resposta da API:
      ErroConsultaFeriado
*/

export interface Feriado {
    date: string;
    name: string;
    type: string;
}

export class ErroConsultaFeriado extends Error {
    constructor(mensagem: string) {
        super(mensagem);
        this.name = 'ErroConsultaFeriado';
    }
}

const URL_BASE = 'https://brasilapi.com.br/api/feriados/v1';
const TEMPO_LIMITE_MS = 5000;

// Guarda os feriados já consultados de cada ano.
const feriadosPorAno = new Map<number, Feriado[]>();

/**
 * Confere se a data existe e está no formato AAAA-MM-DD.
 */
function dataValida(data: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false;
    }

    const convertida = new Date(data + 'T00:00:00Z');

    if (Number.isNaN(convertida.getTime())) {
        return false;
    }

    return convertida.toISOString().slice(0, 10) === data;
}

/**
 * Busca os feriados nacionais de determinado ano.
 * Se o ano já foi consultado, utiliza a lista guardada em memória.
 */
async function buscarFeriadosDoAno(ano: number): Promise<Feriado[]> {
    const guardados = feriadosPorAno.get(ano);

    if (guardados !== undefined) {
        return guardados;
    }

    let resposta: Response;

    try {
        resposta = await fetch(`${URL_BASE}/${ano}`, {
            signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
        });
    } catch {
        throw new ErroConsultaFeriado(
            'Não foi possível consultar a API de feriados. Verifique sua conexão e tente novamente.'
        );
    }

    if (!resposta.ok) {
        throw new ErroConsultaFeriado(
            `A API de feriados respondeu com erro (código ${resposta.status}). Tente novamente em instantes.`
        );
    }

    let conteudo: unknown;

    try {
        conteudo = await resposta.json();
    } catch {
        throw new ErroConsultaFeriado(
            'A API de feriados retornou uma resposta inválida. Tente novamente em instantes.'
        );
    }

    // Confere se a resposta possui o formato esperado.
    if (
        !Array.isArray(conteudo) ||
        !conteudo.every((item) =>
            item !== null &&
            typeof item === 'object' &&
            typeof item.date === 'string' &&
            typeof item.name === 'string' &&
            typeof item.type === 'string'
        )
    ) {
        throw new ErroConsultaFeriado(
            'A API de feriados retornou dados em um formato inesperado.'
        );
    }

    // Considera somente os feriados nacionais.
    const lista = (conteudo as Feriado[]).filter(
        (feriado) => feriado.type === 'national'
    );

    // Só guarda a lista depois de confirmar que a resposta é válida.
    feriadosPorAno.set(ano, lista);

    return lista;
}

/**
 * Procura uma data entre os feriados nacionais.
 * Retorna o feriado encontrado ou null.
 */
export async function buscarFeriado(data: string): Promise<Feriado | null> {
    if (!dataValida(data)) {
        throw new Error(
            `Data inválida: "${data}". Use o formato AAAA-MM-DD.`
        );
    }

    const ano = Number(data.slice(0, 4));
    const lista = await buscarFeriadosDoAno(ano);

    for (const feriado of lista) {
        if (feriado.date === data) {
            return feriado;
        }
    }

    return null;
}

/**
 * Retorna true se a data for feriado nacional.
 */
export async function verificarFeriado(data: string): Promise<boolean> {
    const feriado = await buscarFeriado(data);

    return feriado !== null;
}
