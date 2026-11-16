/*
Autor: Eduardo Zinetti Betini
Sessão do usuário logado (Reunião 5) - usado por todas as telas que exigem login:
dashboard, listagem e cadastro/edição de demandas.
*/

const PERFIS_ID = {
    ADMINISTRADOR: 1,
    LIDER_PROJETO: 2,
    MEMBRO_EQUIPE: 3
};

function usuarioLogado() {
    const bruto = sessionStorage.getItem("usuario");
    return bruto ? JSON.parse(bruto) : null;
}

function tokenSessao() {
    return sessionStorage.getItem("token");
}

// chama no topo de toda tela que só pode ser vista por quem já fez login;
// manda de volta pro login se não tiver token na sessão.
function exigirLogin() {
    if (!tokenSessao()) {
        window.location.href = "login.html";
    }
}

// só administrador e líder de projeto podem reatribuir responsável/prioridade/prazo
// (mesma regra do middleware autorizar() no backend, em PATCH /demandas/:id/atribuicao)
function podeGerenciarAtribuicao(usuario) {
    return !!usuario && (
        usuario.idPerfil === PERFIS_ID.ADMINISTRADOR ||
        usuario.idPerfil === PERFIS_ID.LIDER_PROJETO
    );
}

function sair() {
    sessionStorage.clear();
    window.location.href = "login.html";
}

// preenche um elemento com "nome (perfil)" e liga o botão de sair, se existirem na página
function montarBarraUsuario(idElementoNome, idBotaoSair) {
    const usuario = usuarioLogado();
    const elementoNome = document.getElementById(idElementoNome);
    if (elementoNome && usuario) {
        elementoNome.textContent = `${usuario.nome} (${usuario.perfil})`;
    }

    const botaoSair = document.getElementById(idBotaoSair);
    if (botaoSair) {
        botaoSair.addEventListener("click", sair);
    }
}
