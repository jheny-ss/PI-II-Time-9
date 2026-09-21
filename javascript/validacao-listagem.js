/*
    Autor: Rafa
    Tela: Listagem de Demandas
    Arquivo: validacao-listagem.js

    Objetivo (Reunião 3 - PI2):
    Adicionar validação em JavaScript ao formulário de filtros
    desta tela, seguindo as regras da atividade.

    Por que só o campo de busca é validado:
    - O campo "Buscar por título" é opcional (o usuário pode deixar
      em branco para ver todas as demandas). Ainda assim, se ele
      digitar algo, o texto precisa ter no mínimo 2 caracteres,
      evitando buscas sem sentido (ex: digitar uma única letra).
    - Os selects de Status e Prioridade já possuem as opções
      "Todos" e "Todas" como valor padrão, então não fazem sentido
      como campos obrigatórios nesta tela (o enunciado pede para
      não criar validação que não se aplique ao caso).
*/

// Espera o HTML terminar de carregar antes de rodar o script
document.addEventListener('DOMContentLoaded', function () {

    // Elementos usados na validação
    const formulario = document.querySelector('.barra-filtros');
    const campoBusca = document.getElementById('busca');

    // Valida o formulário toda vez que o usuário tenta filtrar
    formulario.addEventListener('submit', function (evento) {

        // Limpa qualquer mensagem de erro exibida anteriormente
        removeErro(campoBusca);

        // Remove espaços em branco das pontas do texto digitado
        const textoBusca = campoBusca.value.trim();

        // Só valida o tamanho se o usuário tiver digitado algo
        if (textoBusca.length > 0 && textoBusca.length < 2) {
            // Impede o envio do formulário enquanto o dado for inválido
            evento.preventDefault();

            // Mostra uma mensagem de erro clara para o usuário
            mostraErro(campoBusca, 'Digite pelo menos 2 caracteres para buscar.');
        }
    });

    // Cria e insere a mensagem de erro logo após o campo informado
    function mostraErro(campo, mensagem) {
        const erro = document.createElement('span');
        erro.className = 'erro-validacao';
        erro.textContent = mensagem;

        // Guarda a referência do campo, para localizar o erro depois
        erro.setAttribute('data-erro-de', campo.id);

        campo.parentElement.appendChild(erro);
    }

    // Remove a mensagem de erro de um campo, caso ela exista
    function removeErro(campo) {
        const erroExistente = document.querySelector('[data-erro-de="' + campo.id + '"]');

        if (erroExistente) {
            erroExistente.remove();
        }
    }

});
