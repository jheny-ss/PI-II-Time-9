
/*
    Autor: Rafa
    Tela: Listagem de Demandas
    Arquivo: validacao-listagem.js

    Objetivo (Reunião 3 - PI2):
    Validar o campo de busca do formulário de filtros.

    Regras:
    - A busca é opcional.
    - Quando preenchida, deve possuir pelo menos 2 caracteres.
    - Status e prioridade não são obrigatórios.
*/

// O atributo defer no HTML garante que os elementos já existem.
const formulario = document.querySelector('.barra-filtros');
const campoBusca = document.getElementById('busca');

if (formulario && campoBusca) {

    // Valida antes de o JavaScript da listagem enviar a requisição.
    formulario.addEventListener('submit', function (evento) {

        removeErro(campoBusca);

        const textoBusca = campoBusca.value.trim();

        if (textoBusca.length > 0 && textoBusca.length < 2) {

            // Impede o envio e os demais eventos de submit do formulário.
            evento.preventDefault();
            evento.stopImmediatePropagation();

            mostraErro(
                campoBusca,
                'Digite pelo menos 2 caracteres para buscar.'
            );

            campoBusca.focus();
        }
    });

    // Remove mensagens antigas quando o formulário é limpo.
    formulario.addEventListener('reset', function () {
        removeErro(campoBusca);
    });

}

/**
 * Cria e insere uma mensagem de erro após o campo.
 */
function mostraErro(campo, mensagem) {
    const erro = document.createElement('span');

    erro.className = 'erro-validacao';
    erro.textContent = mensagem;
    erro.setAttribute('data-erro-de', campo.id);

    campo.parentElement.appendChild(erro);
}

/**
 * Remove a mensagem de erro existente no campo.
 */
function removeErro(campo) {
    const erroExistente = document.querySelector(
        '[data-erro-de="' + campo.id + '"]'
    );

    if (erroExistente) {
        erroExistente.remove();
    }
}
