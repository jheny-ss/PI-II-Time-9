
import dados from './dados.json' with { type: 'json' };

export type Perfil = 'Administrador' | 'Líder de Projeto' | 'Membro da Equipe';
export type TipoDemanda = 'Tarefa' | 'Defeito' | 'Melhoria' | 'Documentação';
export type Prioridade = 'Crítica' | 'Alta' | 'Média' | 'Baixa';
export type StatusDemanda = 'Aberta' | 'Em andamento' | 'Em revisão' | 'Concluída' | 'Cancelada';

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    senha: string;
    perfil: Perfil;
}

export interface Projeto {
    id: number;
    nome: string;
    descricao: string;
}

export interface Demanda {
    id: number;
    titulo: string;
    descricao: string;
    tipo: TipoDemanda;
    prioridade: Prioridade;
    status: StatusDemanda;
    projetoId: number;
    responsavelId: number | null;
    dataCriacao: string;
    dataAtualizacao: string;
    prazoFinalizacao: string | null;
}

export interface Comentario {
    id: number;
    demandaId: number;
    usuarioId: number;
    texto: string;
    dataHora: string;
}

// Arrays em memória: os POSTs da equipe fazem push neles (os dados se perdem ao reiniciar o servidor).
export const usuarios: Usuario[] = dados.usuarios as Usuario[];
export const projetos: Projeto[] = dados.projetos as Projeto[];
export const demandas: Demanda[] = dados.demandas as Demanda[];
export const comentarios: Comentario[] = dados.comentarios as Comentario[];