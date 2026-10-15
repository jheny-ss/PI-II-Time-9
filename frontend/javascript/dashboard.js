/*
    Autor: Arthur Peripolli da Silva
    Tela: Dashboard - Validação de Busca
*/

document.addEventListener("DOMContentLoaded", function(){
    const formBusca = document.getElementById("formBusca");
    const inputBusca = document.getElementById("inputBusca");
    const erroBusca = document.getElementById("erroBusca");

    formBusca.addEventListener("submit", function(event){
        // Pega o valor e remove espaços em branco das pontas
        const valorBusca = inputBusca.value.trim();

        // Limpa erros anteriores
        erroBusca.classList.add("d-none");
        inputBusca.classList.remove("is-invalid");

        //impede que envie vazio
        if(valorBusca===""){
            event.preventDefault(); // impede o envio
            erroBusca.classList.remove("d-none"); //mostra o balao de erro
            inputBusca.classList.add("is-invalid"); //fica vermelho
        }
    });
});