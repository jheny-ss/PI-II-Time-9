/*
Autor: Eduardo Zinetti Betini
Tela: Listagem de Demandas (integração com GET /demandas - Reunião 5)

Este arquivo só busca e renderiza os dados; a validação do campo de
busca (quantidade mínima de caracteres) é feita antes, pelo
validacao-listagem.js, que roda primeiro e bloqueia o envio se inválido.
*/

const API_URL = "http://localhost:3000";

// nomes diferentes dos usados em validacao-listagem.js: os dois arquivos rodam
// no mesmo escopo global da página (scripts soltos, não são módulos), então
// "formulario" e "campoBusca" já existiam lá e um "const" repetido quebra os dois.
const formularioFiltros = document.getElementById("form-filtros");
const campoBuscaListagem = document.getElementById("busca");
const campoStatus = document.getElementById("filtro-status");
const campoPrioridade = document.getElementById("filtro-prioridade");
const campoOrdenarPor = document.getElementById("ordenar-por");
const campoOrdem = document.getElementById("ordem");
const corpoTabela = document.getElementById("tabela-corpo");
const mensagemErro = document.getElementById("mensagem-erro");
const resumoResultados = document.getElementById("resumo-resultados");

// evita que título/descrição com caracteres especiais quebrem o html da tabela
function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

function formatarData(iso) {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("pt-BR");
}

function montarLinha(demanda) {
    const linha = document.createElement("tr");
    linha.innerHTML = `
        <td>${escaparHtml(demanda.titulo)}</td>
        <td>${escaparHtml(demanda.tipo)}</td>
        <td>${escaparHtml(demanda.prioridade)}</td>
        <td>${escaparHtml(demanda.status)}</td>
        <td>${escaparHtml(demanda.projeto ?? `#${demanda.projetoId}`)}</td>
        <td>${escaparHtml(demanda.responsavel ?? "Não atribuído")}</td>
        <td>${formatarData(demanda.dataCriacao)}</td>
        <td>${demanda.prazoFinalizacao ? formatarData(demanda.prazoFinalizacao) : "Sem prazo"}</td>
        <td>
            <a href="detalhes-tela.html?id=${demanda.id}" class="btn btn-secundario">Ver</a>
            <a href="formulario-demanda.html?id=${demanda.id}" class="btn btn-primario">Editar</a>
        </td>
    `;
    return linha;
}

function mostrarErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.hidden = false;
}

function esconderErro() {
    mensagemErro.hidden = true;
    mensagemErro.textContent = "";
}

// monta a querystring só com os filtros que de fato foram preenchidos
function montarParametros() {
    const parametros = new URLSearchParams();

    if (campoBuscaListagem.value.trim()) parametros.set("busca", campoBuscaListagem.value.trim());
    if (campoStatus.value) parametros.set("status", campoStatus.value);
    if (campoPrioridade.value) parametros.set("prioridade", campoPrioridade.value);
    if (campoOrdenarPor.value) parametros.set("ordenarPor", campoOrdenarPor.value);
    if (campoOrdem.value) parametros.set("ordem", campoOrdem.value);

    return parametros;
}

async function carregarDemandas() {
    esconderErro();
    corpoTabela.innerHTML = "";
    resumoResultados.textContent = "Carregando...";

    try {
        const resposta = await fetch(`${API_URL}/demandas?${montarParametros().toString()}`, {
            headers: { "Authorization": `Bearer ${tokenSessao()}` }
        });
        const dados = await resposta.json();

        // a api devolve 400 com mensagem clara quando algum filtro é inválido
        if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao consultar as demandas.");
        }

        if (!dados.demandas || dados.demandas.length === 0) {
            resumoResultados.textContent = "Nenhuma demanda encontrada.";
            return;
        }

        resumoResultados.textContent = `${dados.total} demanda(s) encontrada(s).`;
        dados.demandas.forEach((demanda) => corpoTabela.appendChild(montarLinha(demanda)));
    } catch (erro) {
        resumoResultados.textContent = "";
        mostrarErro(`Não foi possível carregar as demandas: ${erro.message}`);
        console.error("Erro ao carregar demandas:", erro);
    }
}

formularioFiltros.addEventListener("submit", function (evento) {
    evento.preventDefault();
    carregarDemandas();
});

formularioFiltros.addEventListener("reset", carregarDemandas);

document.addEventListener("DOMContentLoaded", function () {
    exigirLogin();
    montarBarraUsuario("nomeUsuarioLogado", "botaoSair");
    carregarDemandas();
});
