import dados from './dados.json' with { type: 'json' };
// Arrays em memória: os POSTs da equipe fazem push neles (os dados se perdem ao reiniciar o servidor).
export const usuarios = dados.usuarios;
export const projetos = dados.projetos;
export const demandas = dados.demandas;
export const comentarios = dados.comentarios;
//# sourceMappingURL=banco.js.map