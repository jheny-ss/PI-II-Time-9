
/*
Autor: Jhenyfer da Silva Souza
Tela: Login
*/

// Elementos do formulário
const formulario = document.querySelector('.form-login');
const email = document.querySelector('#email');
const senha = document.querySelector('#senha');
const botaoEntrar = formulario.querySelector('button[type="submit"]');

// Endereço da API
const API_URL = 'http://localhost:3000';

// Exibe mensagem de erro em um campo
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

// Remove mensagem de erro de um campo
function limparErro(campo) {
    campo.classList.remove('campo-invalido');

    const mensagemErro = campo.parentElement.querySelector('.mensagem-erro');

    if (mensagemErro) {
        mensagemErro.remove();
    }
}

// Validação do e-mail
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

// Validação da senha
function validarSenha() {
    const valor = senha.value;

    if (valor.trim() === '') {
        mostrarErro(senha, 'A senha é obrigatória.');
        return false;
    }

    limparErro(senha);
    return true;
}

// Exibe mensagem geral na tela
function mostrarMensagem(mensagem, tipo = 'erro') {
    let alerta = document.querySelector('.mensagem-login');

    if (!alerta) {
        alerta = document.createElement('div');
        alerta.classList.add('mensagem-login');
        formulario.prepend(alerta);
    }

    alerta.textContent = mensagem;

    alerta.className = `mensagem-login alert ${
        tipo === 'erro' ? 'alert-danger' : 'alert-success'
    }`;
}

// Valida os campos ao sair deles
email.addEventListener('blur', validarEmail);
senha.addEventListener('blur', validarSenha);

// Envio do formulário
formulario.addEventListener('submit', async function (event) {
    event.preventDefault();

    const emailValido = validarEmail();
    const senhaValida = validarSenha();

    if (!emailValido || !senhaValida) {
        return;
    }

    botaoEntrar.disabled = true;
    botaoEntrar.textContent = 'Entrando...';

    try {
        const resposta = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.value.trim(),
                senha: senha.value
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarMensagem(
                dados.erro || 'Não foi possível realizar o login.'
            );
            return;
        }

        // Armazena o token e os dados públicos do usuário na sessão
        sessionStorage.setItem('token', dados.token);
        sessionStorage.setItem('usuario', JSON.stringify(dados.usuario));

        mostrarMensagem('Login realizado com sucesso!', 'sucesso');

        // Redireciona para o dashboard
        window.location.href = './dashboard.html';

    } catch (erro) {
        console.error('Erro ao conectar com a API:', erro);

        mostrarMensagem(
            'Não foi possível conectar ao servidor. Tente novamente.'
        );

    } finally {
        botaoEntrar.disabled = false;
        botaoEntrar.textContent = 'Entrar';
    }
});
