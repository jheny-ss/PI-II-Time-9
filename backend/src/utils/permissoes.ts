
/*
Autor: Jhenyfer da Silva Souza
Responsabilidade: centralizar os perfis, status e regras de
permissão para alteração de status das demandas.
*/

export const PERFIS = {
    ADMINISTRADOR: 1,
    LIDER_PROJETO: 2,
    MEMBRO_EQUIPE: 3
} as const;

export const STATUS_DEMANDA = {
    ABERTA: 1,
    EM_ANDAMENTO: 2,
    EM_REVISAO: 3,
    CONCLUIDA: 4,
    CANCELADA: 5
} as const;

/*
Regras:

Administrador:
- Pode realizar as transições previstas para o sistema.
- Pode cancelar demandas.

Líder de Projeto:
- Pode realizar as transições previstas para o sistema.
- Pode cancelar demandas dos projetos aos quais está vinculado.

Membro da Equipe:
- Pode iniciar demandas atribuídas a ele.
- Pode encaminhar demandas atribuídas a ele para revisão.
- Não pode concluir ou cancelar demandas.
*/

const TRANSICOES_ADMIN_LIDER: Record<number, number[]> = {
    [STATUS_DEMANDA.ABERTA]: [
        STATUS_DEMANDA.EM_ANDAMENTO,
        STATUS_DEMANDA.CANCELADA
    ],

    [STATUS_DEMANDA.EM_ANDAMENTO]: [
        STATUS_DEMANDA.EM_REVISAO,
        STATUS_DEMANDA.CANCELADA
    ],

    [STATUS_DEMANDA.EM_REVISAO]: [
        STATUS_DEMANDA.EM_ANDAMENTO,
        STATUS_DEMANDA.CONCLUIDA,
        STATUS_DEMANDA.CANCELADA
    ],

    [STATUS_DEMANDA.CONCLUIDA]: [
        STATUS_DEMANDA.CANCELADA
    ],

    [STATUS_DEMANDA.CANCELADA]: []
};

const TRANSICOES_MEMBRO: Record<number, number[]> = {
    [STATUS_DEMANDA.ABERTA]: [
        STATUS_DEMANDA.EM_ANDAMENTO
    ],

    [STATUS_DEMANDA.EM_ANDAMENTO]: [
        STATUS_DEMANDA.EM_REVISAO
    ],

    [STATUS_DEMANDA.EM_REVISAO]: [],
    [STATUS_DEMANDA.CONCLUIDA]: [],
    [STATUS_DEMANDA.CANCELADA]: []
};

/**
 * Verifica se um usuário pode alterar o status de uma demanda.
 *
 * A verificação de vínculo do líder com o projeto deve ser
 * realizada pela rota responsável.
 *
 * @param idPerfil Perfil do usuário autenticado.
 * @param statusAtual Status atual da demanda.
 * @param novoStatus Status pretendido.
 * @param demandaAtribuidaAoUsuario Indica se a demanda pertence ao membro.
 */
export function podeAlterarStatus(
    idPerfil: number,
    statusAtual: number,
    novoStatus: number,
    demandaAtribuidaAoUsuario: boolean = false
): boolean {

    if (statusAtual === novoStatus) {
        return false;
    }

    if (idPerfil === PERFIS.ADMINISTRADOR ||
        idPerfil === PERFIS.LIDER_PROJETO) {

        return TRANSICOES_ADMIN_LIDER[statusAtual]
            ?.includes(novoStatus) ?? false;
    }

    if (idPerfil === PERFIS.MEMBRO_EQUIPE) {

        if (!demandaAtribuidaAoUsuario) {
            return false;
        }

        return TRANSICOES_MEMBRO[statusAtual]
            ?.includes(novoStatus) ?? false;
    }

    return false;
}
