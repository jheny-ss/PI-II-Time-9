/*
    Autor: Arthur Peripolli da Silva
    Tela: Dashboard - Integração com GET /dashboard e Validação de Busca
*/

const API_URL = "http://localhost:3000";

// Guarda os dados carregados do banco para permitir filtragem rápida na busca
let dadosDashboard = null;

// Evita problemas se título/descrição tiverem caracteres especiais HTML
function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

// Define cor da badge conforme prioridade
function corPrioridade(prioridade) {
    switch (prioridade) {
        case "Crítica": return "bg-danger";
        case "Alta": return "bg-primary";
        case "Média": return "bg-info text-dark";
        default: return "bg-secondary";
    }
}

// Monta o HTML de cada card de demanda no padrão Bootstrap da tela
function criarCardDemanda(demanda) {
    const prazoTexto = demanda.prazoFinalizacao ? demanda.prazoFinalizacao : "Sem prazo";
    const responsavelTexto = demanda.responsavel ? demanda.responsavel : "Não atribuído";
    const projetoTexto = demanda.projeto ? demanda.projeto : `Projeto #${demanda.projetoId}`;

    return `
        <div class="col-12 col-sm-6 col-md-4 mb-4">
            <div class="card h-100 text-center custom-demanda-card">
                <div class="card-body d-flex flex-column justify-content-between">
                    <div>
                        <h5 class="card-title fw-bold">#${demanda.id} - ${escaparHtml(demanda.titulo)}</h5>
                        <small class="text-muted d-block mb-2">${escaparHtml(projetoTexto)} | ${escaparHtml(demanda.tipo)}</small>
                        <hr>
                        <p class="card-text">${escaparHtml(demanda.descricao)}</p>
                    </div>
                    <div class="mt-3">
                        <div class="mb-2">
                            <span class="badge ${corPrioridade(demanda.prioridade)}">${escaparHtml(demanda.prioridade)}</span>
                            <span class="badge bg-warning text-dark">${escaparHtml(demanda.status)}</span>
                        </div>
                        <small class="d-block text-muted">Responsável: ${escaparHtml(responsavelTexto)}</small>
                        <small class="d-block text-muted">Prazo: ${escaparHtml(prazoTexto)}</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderiza uma lista de demandas dentro de um container
function renderizarLista(containerId, demandas, mensagemVazio) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!demandas || demandas.length === 0) {
        container.innerHTML = `<div class="col-12"><p class="text-light fst-italic">${mensagemVazio}</p></div>`;
        return;
    }

    container.innerHTML = demandas.map(criarCardDemanda).join("");
}

// Preenche os contadores e listas com o JSON vindo da API
function preencherDashboard(dados, termoFiltro = "") {
    document.getElementById("totalDemandas").textContent = dados.total ?? 0;

    document.getElementById("statusAberta").textContent = dados.porStatus?.["Aberta"] ?? 0;
    document.getElementById("statusAndamento").textContent = dados.porStatus?.["Em andamento"] ?? 0;
    document.getElementById("statusRevisao").textContent = dados.porStatus?.["Em revisão"] ?? 0;
    document.getElementById("statusConcluida").textContent = dados.porStatus?.["Concluída"] ?? 0;
    document.getElementById("statusCancelada").textContent = dados.porStatus?.["Cancelada"] ?? 0;

    document.getElementById("prioCritica").textContent = dados.porPrioridade?.["Crítica"] ?? 0;
    document.getElementById("prioAlta").textContent = dados.porPrioridade?.["Alta"] ?? 0;
    document.getElementById("prioMedia").textContent = dados.porPrioridade?.["Média"] ?? 0;
    document.getElementById("prioBaixa").textContent = dados.porPrioridade?.["Baixa"] ?? 0;

    document.getElementById("tipoTarefa").textContent = dados.porTipo?.["Tarefa"] ?? 0;
    document.getElementById("tipoDefeito").textContent = dados.porTipo?.["Defeito"] ?? 0;
    document.getElementById("tipoMelhoria").textContent = dados.porTipo?.["Melhoria"] ?? 0;
    document.getElementById("tipoDocumentacao").textContent = dados.porTipo?.["Documentação"] ?? 0;

    // Aplica o filtro textual nos cards caso o usuário tenha buscado algo
    const filtro = termoFiltro.toLowerCase();
    const filtrar = (lista) => {
        if (!filtro) return lista;
        return lista.filter((d) =>
            (d.titulo && d.titulo.toLowerCase().includes(filtro)) ||
            (d.descricao && d.descricao.toLowerCase().includes(filtro))
        );
    };

    const criticasFiltradas = filtrar(dados.criticasEmAberto ?? []);
    const prazoFiltradas = filtrar(dados.proximasDoPrazo ?? []);

    document.getElementById("qtdCriticasAberto").textContent = criticasFiltradas.length;
    document.getElementById("qtdProximasPrazo").textContent = prazoFiltradas.length;

    renderizarLista("listaCriticas", criticasFiltradas, "Nenhuma demanda crítica em aberto encontrada.");
    renderizarLista("listaPrazo", prazoFiltradas, "Nenhuma demanda próxima do prazo encontrada.");
}

// Busca os dados reais na rota GET /dashboard
async function carregarDashboard() {
    const erroApi = document.getElementById("erroApi");
    erroApi.classList.add("d-none");
    erroApi.textContent = "";

    try {
        const resposta = await fetch(`${API_URL}/dashboard`);
        const dados = await resposta.json();

        // Se a API retornar erro (400, 404, 500...), exibe a mensagem na tela
        if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao consultar os dados do dashboard.");
        }

        dadosDashboard = dados;
        preencherDashboard(dados);
    } catch (erro) {
        erroApi.textContent = `Erro ao carregar dashboard: ${erro.message}`;
        erroApi.classList.remove("d-none");
        console.error("Erro ao carregar dashboard:", erro);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // exige login (Reunião 5) - sem token, manda de volta pro login.html
    exigirLogin();
    montarBarraUsuario("nomeUsuarioLogado", "botaoSair");

    const formBusca = document.getElementById("formBusca");
    const inputBusca = document.getElementById("inputBusca");
    const erroBusca = document.getElementById("erroBusca");
    const btnLimpar = document.getElementById("btnLimpar");

    // Carrega o dashboard assim que a página abre
    carregarDashboard();

    // Validação de busca (Reunião 3) + filtragem dos cards
    formBusca.addEventListener("submit", function (event) {
        event.preventDefault(); // evita recarregar a página e perder os dados

        const valorBusca = inputBusca.value.trim();

        erroBusca.classList.add("d-none");
        inputBusca.classList.remove("is-invalid");

        if (valorBusca === "") {
            erroBusca.classList.remove("d-none");
            inputBusca.classList.add("is-invalid");
            return;
        }

        if (dadosDashboard) {
            preencherDashboard(dadosDashboard, valorBusca);
        }
    });

    // Botão Limpar restaura todos os cards sem filtro
    btnLimpar.addEventListener("click", function () {
        inputBusca.value = "";
        erroBusca.classList.add("d-none");
        inputBusca.classList.remove("is-invalid");
        if (dadosDashboard) {
            preencherDashboard(dadosDashboard);
        }
    });
});