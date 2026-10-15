/*
Autor: Eduardo Zinetti Betini
*/

import type { TipoDemanda, Prioridade, StatusDemanda } from './banco.js';
import { diasAtras, prazoEmDias } from './datas.js';

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

export const demandas: Demanda[] = [
  // 1) exemplo normal: criada há 2 dias, prazo em 10 dias
  { id: 1, titulo: "Corrigir erro no cálculo de frete", descricao: "O frete fica negativo para alguns CEPs.", tipo: "Defeito", prioridade: "Alta", status: "Aberta", projetoId: 1, responsavelId: 4, dataCriacao: diasAtras(2), dataAtualizacao: diasAtras(2), prazoFinalizacao: prazoEmDias(10) },

  // 2) exemplo atrasada: prazo já venceu (número negativo), mas ainda está em andamento
  { id: 2, titulo: "Atualizar biblioteca de pagamentos", descricao: "Versão atual está descontinuada pelo fornecedor.", tipo: "Tarefa", prioridade: "Crítica", status: "Em andamento", projetoId: 2, responsavelId: 5, dataCriacao: diasAtras(15), dataAtualizacao: diasAtras(3), prazoFinalizacao: prazoEmDias(-4) },

  // 3) exemplo sem responsável e sem prazo definido ainda
  { id: 3, titulo: "Revisar textos de ajuda da tela de login", descricao: "Alguns textos estão desatualizados.", tipo: "Documentação", prioridade: "Baixa", status: "Aberta", projetoId: 3, responsavelId: null, dataCriacao: diasAtras(1), dataAtualizacao: diasAtras(1), prazoFinalizacao: null },

  { id: 4, titulo: "Erro ao gerar nota fiscal duplicada no checkout", descricao: "Em alguns pedidos, duas notas fiscais são geradas para a mesma compra.", tipo: "Defeito", prioridade: "Crítica", status: "Em revisão", projetoId: 1, responsavelId: 2, dataCriacao: diasAtras(8), dataAtualizacao: diasAtras(1), prazoFinalizacao: prazoEmDias(2) },

  { id: 5, titulo: "Configurar monitoramento das métricas dos novos servidores", descricao: "Acompanhar CPU, memória e disco após a migração para a nuvem.", tipo: "Tarefa", prioridade: "Alta", status: "Em andamento", projetoId: 3, responsavelId: 6, dataCriacao: diasAtras(6), dataAtualizacao: diasAtras(1), prazoFinalizacao: prazoEmDias(5) },

  { id: 6, titulo: "Adicionar busca por categoria no catálogo do aplicativo", descricao: "Permitir filtrar produtos por categoria na tela de pedidos em campo.", tipo: "Melhoria", prioridade: "Média", status: "Aberta", projetoId: 2, responsavelId: 5, dataCriacao: diasAtras(1), dataAtualizacao: diasAtras(1), prazoFinalizacao: prazoEmDias(15) },

  { id: 7, titulo: "Documentar fluxo de autenticação do portal do cliente", descricao: "Registrar o passo a passo de login, recuperação de senha e sessão.", tipo: "Documentação", prioridade: "Baixa", status: "Concluída", projetoId: 1, responsavelId: 4, dataCriacao: diasAtras(20), dataAtualizacao: diasAtras(5), prazoFinalizacao: prazoEmDias(-5) },

  { id: 8, titulo: "Migrar banco de dados de produção para o novo provedor de nuvem", descricao: "Mover o banco principal sem perda de dados nem indisponibilidade prolongada.", tipo: "Tarefa", prioridade: "Crítica", status: "Aberta", projetoId: 3, responsavelId: null, dataCriacao: diasAtras(3), dataAtualizacao: diasAtras(3), prazoFinalizacao: prazoEmDias(7) },

  { id: 9, titulo: "Corrigir cálculo de comissão exibido incorretamente no app", descricao: "O valor de comissão do vendedor aparece zerado em pedidos parcelados.", tipo: "Defeito", prioridade: "Média", status: "Em andamento", projetoId: 2, responsavelId: 3, dataCriacao: diasAtras(10), dataAtualizacao: diasAtras(2), prazoFinalizacao: prazoEmDias(3) },

  { id: 10, titulo: "Otimizar tempo de carregamento da listagem de pedidos", descricao: "A listagem está demorando mais de 5 segundos para carregar no portal.", tipo: "Melhoria", prioridade: "Alta", status: "Aberta", projetoId: 1, responsavelId: 2, dataCriacao: diasAtras(4), dataAtualizacao: diasAtras(4), prazoFinalizacao: prazoEmDias(12) },

  { id: 11, titulo: "Configurar backup automático dos servidores migrados", descricao: "Garantir rotina diária de backup após a migração de infraestrutura.", tipo: "Tarefa", prioridade: "Média", status: "Concluída", projetoId: 3, responsavelId: 6, dataCriacao: diasAtras(25), dataAtualizacao: diasAtras(10), prazoFinalizacao: prazoEmDias(-10) },

  { id: 12, titulo: "Atualizar manual do usuário do aplicativo de vendas", descricao: "Incluir as telas novas de pedido e catálogo no manual atual.", tipo: "Documentação", prioridade: "Baixa", status: "Aberta", projetoId: 2, responsavelId: null, dataCriacao: diasAtras(2), dataAtualizacao: diasAtras(2), prazoFinalizacao: null },

  { id: 13, titulo: "Corrigir travamento ao aplicar cupom de desconto inválido", descricao: "O app fecha inesperadamente ao digitar um cupom que não existe.", tipo: "Defeito", prioridade: "Alta", status: "Aberta", projetoId: 1, responsavelId: 4, dataCriacao: diasAtras(1), dataAtualizacao: diasAtras(1), prazoFinalizacao: prazoEmDias(6) },

  { id: 14, titulo: "Implementar exportação de relatório de vendas em PDF", descricao: "Permitir que o vendedor exporte o resumo mensal de vendas em PDF.", tipo: "Tarefa", prioridade: "Alta", status: "Concluída", projetoId: 2, responsavelId: 5, dataCriacao: diasAtras(18), dataAtualizacao: diasAtras(4), prazoFinalizacao: prazoEmDias(-4) },

  { id: 15, titulo: "Padronizar nomenclatura dos recursos na nova infraestrutura", descricao: "Unificar o padrão de nomes de servidores e buckets após a migração.", tipo: "Melhoria", prioridade: "Média", status: "Em revisão", projetoId: 3, responsavelId: 1, dataCriacao: diasAtras(12), dataAtualizacao: diasAtras(1), prazoFinalizacao: prazoEmDias(1) },

  { id: 16, titulo: "Corrigir falha de segurança no upload de anexos do portal", descricao: "Anexos eram aceitos sem validação de tipo de arquivo, risco de upload malicioso.", tipo: "Defeito", prioridade: "Crítica", status: "Cancelada", projetoId: 1, responsavelId: 2, dataCriacao: diasAtras(30), dataAtualizacao: diasAtras(14), prazoFinalizacao: null },
];
