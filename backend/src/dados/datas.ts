/*
Autor: Eduardo Zinetti Betini
*/

const DIA_MS = 24 * 60 * 60 * 1000;

// Data/hora (ISO 8601) de N dias atrás. Usada em dataCriacao, dataAtualizacao, dataHora.
export const diasAtras = (dias: number): string =>
  new Date(Date.now() - dias * DIA_MS).toISOString();

// Data (AAAA-MM-DD) daqui a N dias; use número negativo para prazos vencidos.
export const prazoEmDias = (dias: number): string =>
  new Date(Date.now() + dias * DIA_MS).toISOString().slice(0, 10);
