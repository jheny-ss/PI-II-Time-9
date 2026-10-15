
import dados from './dados.json' with { type: 'json' };

export type Perfil = 'Administrador' | 'Líder de Projeto' | 'Membro da Equipe';

export const TIPOS_DEMANDA = ['Tarefa', 'Defeito', 'Melhoria', 'Documentação'] as const;
export type TipoDemanda = (typeof TIPOS_DEMANDA)[number];

export const PRIORIDADES = ['Crítica', 'Alta', 'Média', 'Baixa'] as const;
export type Prioridade = (typeof PRIORIDADES)[number];

export const STATUS_DEMANDA = ['Aberta', 'Em andamento', 'Em revisão', 'Concluída', 'Cancelada'] as const;
export type StatusDemanda = (typeof STATUS_DEMANDA)[number];


export interface Usuario {
    id: number;
    nome: string;
    email: string;
    senha: string;
    perfil: Perfil;
    projetoIds: number[]; // projetos aos quais o usuário está vinculado
}

export interface Projeto {
    id: number;
    nome: string;
    descricao: string;
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
export type { Demanda } from './demandas.js';
export { demandas } from './demandas.js';
export const comentarios: Comentario[] = dados.comentarios as Comentario[];