/*
Autor: Jhenyfer da Silva Souza
Tela: Login.js
*/

const formulario = document.querySelector('.form-login');
const email = document.querySelector('#email');
const senha = document.querySelector('#senha');

function mostrarErro(campo, mensagem) {
    campo.classList.add('campo-invalido');

    let mensagemErro = campo.parentElement.querySelector('.mensagem-erro');

    if (!mensagemErro) {
        mensagemErro = document.createElement('span');
        mensagemErro.classList.add('mensagem-erro');
        campo.parentElement.appendChild(mensagemErro);
    }

    mensagemErro.textContent = mensagem;
}

function limparErro(campo) {
    campo.classList.remove('campo-invalido');

    const mensagemErro = campo.parentElement.querySelector('.mensagem-erro');

    if (mensagemErro) {
        mensagemErro.remove();
    }
}

function validarEmail() {
    const valor = email.value.trim();

    if (valor === '') {
        mostrarErro(email, 'O e-mail é obrigatório.');
        return false;
    }

    if (!email.validity.valid) {
        mostrarErro(email, 'Digite um e-mail válido.');
        return false;
    }

    limparErro(email);
    return true;
}

function validarSenha() {
    const valor = senha.value;

    if (valor.trim() === '') {
        mostrarErro(senha, 'A senha é obrigatória.');
        return false;
    }

    limparErro(senha);
    return true;
}

email.addEventListener('blur', validarEmail);
senha.addEventListener('blur', validarSenha);

formulario.addEventListener('submit', function (event) {
    const emailValido = validarEmail();
    const senhaValida = validarSenha();

    if (!emailValido || !senhaValida) {
        event.preventDefault();
    }
});