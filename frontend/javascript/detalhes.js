/*
Autor: Eduardo Zinetti Betini
Tela: Detalhes de Demanda (integração com a API - Reunião 5)
*/

const API_URL = "http://localhost:3000";
const id = new URLSearchParams(window.location.search).get("id");

const mensagemErro = document.getElementById("mensagemErro");
const campoTitulo = document.getElementById("campoTitulo");
const campoStatus = document.getElementById("campoStatus");
const campoPrioridade = document.getElementById("campoPrioridade");
const campoDescricao = document.getElementById("campoDescricao");
const campoTipo = document.getElementById("campoTipo");
const campoProjeto = document.getElementById("campoProjeto");
const campoResponsavel = document.getElementById("campoResponsavel");
const campoDataCriacao = document.getElementById("campoDataCriacao");
const campoDataAtualizacao = document.getElementById("campoDataAtualizacao");
const campoPrazo = document.getElementById("campoPrazo");

const listaComentarios = document.getElementById("listaComentarios");
const formComentario = document.getElementById("formComentario");
const campoNovoComentario = document.getElementById("campoNovoComentario");
const erroComentario = document.getElementById("erroComentario");

function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

function formatarData(iso) {
    return iso ? new Date(iso).toLocaleDateString("pt-BR") : "-";
}

function mostrarErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.hidden = false;
}

function cabecalhoAutenticado() {
    return { "Authorization": `Bearer ${tokenSessao()}` };
}

async function carregarDemanda() {
    if (!id) {
        mostrarErro("Nenhuma demanda informada na URL (use detalhes-tela.html?id=NUMERO).");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/demandas/${id}`, { headers: cabecalhoAutenticado() });
        const demanda = await resposta.json();

        if (!resposta.ok) {
            mostrarErro(demanda.erro || "Não foi possível carregar a demanda.");
            return;
        }

        campoTitulo.textContent = demanda.titulo;
        campoStatus.textContent = demanda.status;
        campoPrioridade.textContent = demanda.prioridade;
        campoDescricao.value = demanda.descricao;
        campoTipo.textContent = demanda.tipo;
        campoProjeto.textContent = demanda.projeto?.nome ?? "-";
        campoResponsavel.textContent = demanda.responsavel?.nome ?? "Não atribuído";
        campoDataCriacao.textContent = formatarData(demanda.dataCriacao);
        campoDataAtualizacao.textContent = formatarData(demanda.dataAtualizacao);
        campoPrazo.textContent = demanda.prazoFinalizacao ? formatarData(demanda.prazoFinalizacao) : "Sem prazo";
    } catch (erro) {
        console.error("Erro ao carregar demanda:", erro);
        mostrarErro("Não foi possível conectar ao servidor para carregar a demanda.");
    }
}

function montarComentario(comentario) {
    const item = document.createElement("li");
    item.innerHTML = `
        <span class="autor-comentario">${escaparHtml(comentario.usuario.nome)}</span>
        <span class="data-comentario">${new Date(comentario.dataHora).toLocaleString("pt-BR")}</span>
        <p>${escaparHtml(comentario.texto)}</p>
    `;
    return item;
}

async function carregarComentarios() {
    if (!id) return;

    try {
        const resposta = await fetch(`${API_URL}/demandas/${id}/comentarios`, { headers: cabecalhoAutenticado() });
        const comentarios = await resposta.json();

        if (!resposta.ok) {
            mostrarErro(comentarios.erro || "Não foi possível carregar os comentários.");
            return;
        }

        listaComentarios.innerHTML = "";
        if (comentarios.length === 0) {
            listaComentarios.innerHTML = "<li>Nenhum comentário ainda.</li>";
            return;
        }
        comentarios.forEach((comentario) => listaComentarios.appendChild(montarComentario(comentario)));
    } catch (erro) {
        console.error("Erro ao carregar comentários:", erro);
    }
}

formComentario.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    erroComentario.hidden = true;

    const texto = campoNovoComentario.value.trim();
    if (texto === "") {
        erroComentario.textContent = "O comentário não pode ficar vazio.";
        erroComentario.hidden = false;
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/demandas/${id}/comentarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...cabecalhoAutenticado() },
            body: JSON.stringify({ texto })
        });
        const dados = await resposta.json();

        if (!resposta.ok) {
            erroComentario.textContent = dados.erro || "Não foi possível registrar o comentário.";
            erroComentario.hidden = false;
            return;
        }

        if (listaComentarios.children.length === 1 && listaComentarios.children[0].textContent === "Nenhum comentário ainda.") {
            listaComentarios.innerHTML = "";
        }
        listaComentarios.appendChild(montarComentario(dados));
        campoNovoComentario.value = "";
    } catch (erro) {
        console.error("Erro ao registrar comentário:", erro);
        erroComentario.textContent = "Não foi possível conectar ao servidor.";
        erroComentario.hidden = false;
    }
});

exigirLogin();
montarBarraUsuario("nomeUsuarioLogado", "botaoSair");
carregarDemanda();
carregarComentarios();
