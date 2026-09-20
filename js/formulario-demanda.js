/*
    Autor: Eduardo Zinetti Betini
    Tela: Cadastro/Edição de Demanda
*/


const campoTitulo = document.getElementById("titulo");
const erroTitulo = document.getElementById("erro-titulo");

const campoDescricao = document.getElementById("descricao");
const erroDescricao = document.getElementById("erro-descricao");

const campoTipo = document.getElementById("tipo");
const erroTipo = document.getElementById("erro-tipo");

const campoPrioridade = document.getElementById("prioridade");
const erroPrioridade = document.getElementById("erro-prioridade");

const campoStatus = document.getElementById("status");
const erroStatus = document.getElementById("erro-status");

const campoProjeto = document.getElementById("projeto");
const erroProjeto = document.getElementById("erro-projeto");

const campoResponsavel = document.getElementById("responsavel");
const erroResponsavel = document.getElementById("erro-responsavel");

const campoPrazo = document.getElementById("prazo");
const erroPrazo = document.getElementById("erro-prazo");

const modoToggle = document.getElementById("modo-toggle");
const botaoSalvar = document.getElementById("btn-salvar");

const formulario = document.querySelector(".form-demanda");


function mostrarErro(elementoErro, mensagem) {
    elementoErro.textContent = mensagem;
}

function limparErro(elementoErro) {
    elementoErro.textContent = "";
}


function validarTitulo(valor) {
    return valor.trim() !== "";
}

function validarDescricao(valor) {
    return valor.trim() !== "";
}

function validarTipo(valor) {
    const tiposValidos = ["tarefa", "bug", "melhoria", "documentacao"];
    return tiposValidos.includes(valor);
}

function validarPrioridade(valor) {
    const prioridadesValidas = ["critica", "alta", "media", "baixa"];
    return prioridadesValidas.includes(valor);
}

function validarStatus(statusAtual, novoStatus) {
    const transicoesValidas = {
        aberta: ["em_andamento", "cancelada"],
        em_andamento: ["em_revisao", "cancelada"],
        em_revisao: ["concluida", "em_andamento", "cancelada"],
        concluida: [],
        cancelada: []
    };

    const opcoesPermitidas = transicoesValidas[statusAtual] || [];
    return opcoesPermitidas.includes(novoStatus);
}

function validarProjeto(valor) {
    return valor !== "";
}

function validarResponsavel(valor) {
    if (valor === "") {
        return true;
    }

    const responsaveisValidos = ["nao_atribuido", "sabrina", "ariana"];
    return responsaveisValidos.includes(valor);
}

function validarPrazo(valor) {
    return valor !== "";
}

function ehFeriado(valor) {
    const feriadosSimulados = ["2026-09-07", "2026-11-15", "2026-12-25"];
    return feriadosSimulados.includes(valor);
}

function ehDataPassada(valor) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataPrazo = new Date(`${valor}T00:00:00`);
    return dataPrazo < hoje;
}


campoTitulo.addEventListener("input", function () {
    if (validarTitulo(campoTitulo.value)) {
        limparErro(erroTitulo);
    } else {
        mostrarErro(erroTitulo, "O título é obrigatório.");
    }
});

campoDescricao.addEventListener("input", function () {
    if (validarDescricao(campoDescricao.value)) {
        limparErro(erroDescricao);
    } else {
        mostrarErro(erroDescricao, "A descrição é obrigatória.");
    }
});

campoTipo.addEventListener("change", function () {
    if (validarTipo(campoTipo.value)) {
        limparErro(erroTipo);
    } else {
        mostrarErro(erroTipo, "Selecione um tipo válido.");
    }
});

campoPrioridade.addEventListener("change", function () {
    if(validarPrioridade(campoPrioridade.value)) {
        limparErro(erroPrioridade);
    } else {
        mostrarErro(erroPrioridade, "Selecione uma prioridade válida");
    }
});

campoProjeto.addEventListener("change", function () {
    if(validarProjeto(campoProjeto.value)) {
        limparErro(erroProjeto);
    } else {
        mostrarErro(erroProjeto, "Selecione um projeto");
    }
});

campoResponsavel.addEventListener("change", function () {
    if(validarResponsavel(campoResponsavel.value)) {
        limparErro(erroResponsavel);
    } else {
        mostrarErro(erroResponsavel, "Responsável inválido");
    }
});

campoStatus.addEventListener("change", function () {
    const statusAtual = campoStatus.dataset.statusAtual;

    if (validarStatus(statusAtual, campoStatus.value)) {
        limparErro(erroStatus);
    } else {
        mostrarErro(erroStatus, "Essa transição de status não é permitida.");
    }
});

campoPrazo.addEventListener("input", function () {
    if (!validarPrazo(campoPrazo.value)) {
        mostrarErro(erroPrazo, "O prazo de finalização é obrigatório.");
    } else if (ehFeriado(campoPrazo.value)) {
        mostrarErro(erroPrazo, "⚠ Esta data coincide com um feriado nacional. Escolha outra data.");
    } else if (ehDataPassada(campoPrazo.value)){
        mostrarErro(erroPrazo, "⚠ Esta é uma data passada. Escolha outra data.");
    } else {
        limparErro(erroPrazo);
    }
});

function formularioValido() {
    const camposBaseValidos =
        validarTitulo(campoTitulo.value) &&
        validarDescricao(campoDescricao.value) &&
        validarTipo(campoTipo.value) &&
        validarPrioridade(campoPrioridade.value) &&
        validarProjeto(campoProjeto.value) &&
        validarResponsavel(campoResponsavel.value) &&
        validarPrazo(campoPrazo.value) &&
        !ehFeriado(campoPrazo.value) &&
        !ehDataPassada(campoPrazo.value);

    if (!modoToggle.checked) {
        return camposBaseValidos;
    }

    const statusAtual = campoStatus.dataset.statusAtual;
    return camposBaseValidos && validarStatus(statusAtual, campoStatus.value);
}

function atualizarBotaoSalvar() {
    botaoSalvar.disabled = !formularioValido();
}

formulario.addEventListener("input", atualizarBotaoSalvar);
formulario.addEventListener("change", atualizarBotaoSalvar);
modoToggle.addEventListener("change", atualizarBotaoSalvar);

atualizarBotaoSalvar();