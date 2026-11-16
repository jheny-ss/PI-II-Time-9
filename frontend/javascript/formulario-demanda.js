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
const tituloPagina = document.getElementById("tituloPagina");
const campoDataCriacaoReal = document.getElementById("dataCriacaoReal");
const campoDataAtualizacaoReal = document.getElementById("dataAtualizacaoReal");

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
    // "" (nada selecionado) e "nao_atribuido" são válidos (responsável é opcional);
    // qualquer outro valor precisa ser um id numérico real, vindo do carregarListasReais()
    if (valor === "" || valor === "nao_atribuido") {
        return true;
    }

    return /^\d+$/.test(valor);
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
    // na edição, quem não pode reatribuir (ver podeGerenciarAtribuicao) vê prioridade/
    // responsável/prazo desabilitados com o valor real que já existia - então não faz
    // sentido validar "data passada" nesses campos, já que o usuário nem pode mudá-los
    // (uma demanda antiga pode legitimamente ter um prazo que já passou).
    const prazoEditavel = !campoPrazo.disabled;

    const camposBaseValidos =
        validarTitulo(campoTitulo.value) &&
        validarDescricao(campoDescricao.value) &&
        validarTipo(campoTipo.value) &&
        validarPrioridade(campoPrioridade.value) &&
        validarProjeto(campoProjeto.value) &&
        validarResponsavel(campoResponsavel.value) &&
        (!prazoEditavel || (
            validarPrazo(campoPrazo.value) &&
            !ehFeriado(campoPrazo.value) &&
            !ehDataPassada(campoPrazo.value)
        ));

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


// =====================================================================
// Integração com a API (Reunião 5). O que está acima é a validação
// visual da Reunião 2/3; a partir daqui é o envio de verdade pro backend.
// =====================================================================

const API_URL = "http://localhost:3000";
const mensagemServidor = document.getElementById("mensagem-servidor");

// os <option> do html usam códigos simples (reunião 2); o banco guarda os nomes
// completos com acento, então a tradução acontece só na hora de enviar.
const MAPA_TIPO = {
    tarefa: "Tarefa",
    bug: "Defeito",
    melhoria: "Melhoria",
    documentacao: "Documentação"
};

const MAPA_PRIORIDADE = {
    critica: "Crítica",
    alta: "Alta",
    media: "Média",
    baixa: "Baixa"
};

// mapas inversos: usados só na edição, pra converter o que vem do banco (nome
// com acento) de volta pro código do <option> quando a tela carrega os dados existentes.
const MAPA_TIPO_REVERSO = Object.fromEntries(Object.entries(MAPA_TIPO).map(([k, v]) => [v, k]));
const MAPA_PRIORIDADE_REVERSO = Object.fromEntries(Object.entries(MAPA_PRIORIDADE).map(([k, v]) => [v, k]));

// id da demanda sendo editada (vem de ?id= na url); null = tela em modo cadastro
const idEdicao = new URLSearchParams(window.location.search).get("id");

function mostrarMensagemServidor(mensagem, tipo) {
    mensagemServidor.textContent = mensagem;
    mensagemServidor.hidden = false;
    mensagemServidor.classList.toggle("mensagem-sucesso", tipo === "sucesso");
}

function esconderMensagemServidor() {
    mensagemServidor.hidden = true;
    mensagemServidor.textContent = "";
}

// busca os projetos e usuários reais do banco e substitui as opções estáticas de exemplo
async function carregarListasReais() {
    try {
        const [respostaProjetos, respostaUsuarios] = await Promise.all([
            fetch(`${API_URL}/projetos`),
            fetch(`${API_URL}/usuarios`)
        ]);

        const projetos = await respostaProjetos.json();
        const usuarios = await respostaUsuarios.json();

        // mantém só a opção "selecione" original, remove projeto_a/projeto_b
        campoProjeto.querySelectorAll("option[value]:not([value=''])").forEach((op) => op.remove());
        projetos.forEach((projeto) => {
            const opcao = document.createElement("option");
            opcao.value = String(projeto.ID_PROJETO);
            opcao.textContent = projeto.NOME;
            campoProjeto.appendChild(opcao);
        });

        // mantém "selecione" e "não atribuído", remove sabrina/ariana
        campoResponsavel.querySelectorAll("option[value]:not([value='']):not([value='nao_atribuido'])")
            .forEach((op) => op.remove());
        usuarios.forEach((usuario) => {
            const opcao = document.createElement("option");
            opcao.value = String(usuario.ID_USUARIO);
            opcao.textContent = usuario.NOME;
            campoResponsavel.appendChild(opcao);
        });
    } catch (erro) {
        console.error("Erro ao carregar projetos/usuários:", erro);
        mostrarMensagemServidor("Não foi possível carregar projetos e usuários do servidor.", "erro");
    }
}

// modo edição: busca a demanda real (GET /demandas/:id) e preenche o formulário.
// precisa rodar depois de carregarListasReais(), pra já existir a opção certa no
// select de projeto/responsável quando a gente tenta selecioná-la.
async function carregarDemandaParaEdicao() {
    if (!idEdicao) {
        return;
    }

    tituloPagina.textContent = "Edição de Demanda";
    modoToggle.checked = true;

    // responsável/prioridade/prazo só podem ser reatribuídos por administrador/líder
    // (mesma regra do PATCH /demandas/:id/atribuicao no backend) - pra quem não pode,
    // esses 3 campos ficam desabilitados, mostrando só o valor que já existe.
    const usuario = usuarioLogado();
    const podeAtribuir = podeGerenciarAtribuicao(usuario);
    campoPrioridade.disabled = !podeAtribuir;
    campoResponsavel.disabled = !podeAtribuir;
    campoPrazo.disabled = !podeAtribuir;

    // status ainda não tem rota de backend pra transição real - fica só informativo.
    // projeto também não é alterável depois de criada a demanda (o PUT /demandas/:id
    // nunca aceitou esse campo, pra ninguém) - desabilita pra não sugerir que funciona.
    campoStatus.disabled = true;
    campoProjeto.disabled = true;

    try {
        const resposta = await fetch(`${API_URL}/demandas/${idEdicao}`);
        const demanda = await resposta.json();

        if (!resposta.ok) {
            mostrarMensagemServidor(demanda.erro || "Não foi possível carregar a demanda.", "erro");
            return;
        }

        campoTitulo.value = demanda.titulo;
        campoDescricao.value = demanda.descricao;
        campoTipo.value = MAPA_TIPO_REVERSO[demanda.tipo] ?? "";
        campoPrioridade.value = MAPA_PRIORIDADE_REVERSO[demanda.prioridade] ?? "";
        campoProjeto.value = String(demanda.projetoId);
        campoResponsavel.value = demanda.responsavelId ? String(demanda.responsavelId) : "nao_atribuido";
        campoPrazo.value = demanda.prazoFinalizacao ?? "";

        campoDataCriacaoReal.textContent = new Date(demanda.dataCriacao).toLocaleDateString("pt-BR");
        campoDataAtualizacaoReal.textContent = new Date(demanda.dataAtualizacao).toLocaleDateString("pt-BR");

        atualizarBotaoSalvar();
    } catch (erro) {
        console.error("Erro ao carregar demanda:", erro);
        mostrarMensagemServidor("Não foi possível conectar ao servidor para carregar a demanda.", "erro");
    }
}

// pt1: título/descrição/tipo - qualquer pessoa logada pode editar
async function salvarEdicaoBasica(token) {
    const resposta = await fetch(`${API_URL}/demandas/${idEdicao}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            titulo: campoTitulo.value.trim(),
            descricao: campoDescricao.value.trim(),
            tipo: MAPA_TIPO[campoTipo.value]
        })
    });

    return { ok: resposta.ok, dados: await resposta.json() };
}

// pt2: responsável/prioridade/prazo - só é chamada quando podeGerenciarAtribuicao() é true,
// pra não mandar uma requisição que o backend vai recusar com 403 de qualquer jeito
async function salvarAtribuicao(token) {
    const responsavelSelecionado = campoResponsavel.value;
    const responsavelId = (responsavelSelecionado && responsavelSelecionado !== "nao_atribuido")
        ? Number(responsavelSelecionado)
        : null;

    const resposta = await fetch(`${API_URL}/demandas/${idEdicao}/atribuicao`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            responsavelId,
            prioridade: MAPA_PRIORIDADE[campoPrioridade.value],
            prazoFinalizacao: campoPrazo.value || null
        })
    });

    return { ok: resposta.ok, dados: await resposta.json() };
}

async function salvarCriacao(token) {
    // responsável é opcional; "não atribuído" ou nada selecionado = sem responsável
    const responsavelSelecionado = campoResponsavel.value;
    const responsavelId = (responsavelSelecionado && responsavelSelecionado !== "nao_atribuido")
        ? Number(responsavelSelecionado)
        : null;

    const corpo = {
        titulo: campoTitulo.value.trim(),
        descricao: campoDescricao.value.trim(),
        tipo: MAPA_TIPO[campoTipo.value],
        prioridade: MAPA_PRIORIDADE[campoPrioridade.value],
        projetoId: Number(campoProjeto.value),
        responsavelId,
        prazoFinalizacao: campoPrazo.value || null
    };

    const resposta = await fetch(`${API_URL}/demandas`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(corpo)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        mostrarMensagemServidor(dados.erro || "Não foi possível criar a demanda.", "erro");
        return;
    }

    mostrarMensagemServidor(`Demanda #${dados.ID_DEMANDA} criada com sucesso!`, "sucesso");
    formulario.reset();
    atualizarBotaoSalvar();
}

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    esconderMensagemServidor();

    if (!formularioValido()) {
        return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
        mostrarMensagemServidor("Sua sessão expirou. Faça login novamente.", "erro");
        return;
    }

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando...";

    try {
        if (!idEdicao) {
            await salvarCriacao(token);
            return;
        }

        const basico = await salvarEdicaoBasica(token);
        if (!basico.ok) {
            mostrarMensagemServidor(basico.dados.erro || "Não foi possível salvar a edição.", "erro");
            return;
        }

        if (podeGerenciarAtribuicao(usuarioLogado())) {
            const atribuicao = await salvarAtribuicao(token);
            if (!atribuicao.ok) {
                mostrarMensagemServidor(
                    atribuicao.dados.erro || "Título/descrição/tipo salvos, mas não foi possível atualizar responsável/prioridade/prazo.",
                    "erro"
                );
                return;
            }
        }

        mostrarMensagemServidor("Demanda atualizada com sucesso!", "sucesso");
    } catch (erro) {
        console.error("Erro ao conectar com a API:", erro);
        mostrarMensagemServidor("Não foi possível conectar ao servidor. Tente novamente.", "erro");
    } finally {
        botaoSalvar.disabled = !formularioValido();
        botaoSalvar.textContent = "Salvar";
    }
});

exigirLogin();
montarBarraUsuario("nomeUsuarioLogado", "botaoSair");
carregarListasReais().then(carregarDemandaParaEdicao);