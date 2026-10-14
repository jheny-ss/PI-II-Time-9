/*
Autor: Jhenyfer da Silva Souza

*/
import { Router } from 'express';
import { usuarios } from '../dados/banco.js';
const router = Router();
// Devolve o usuário sem o campo senha
function removerSenha(usuario) {
    const { senha, ...usuarioPublico } = usuario;
    return usuarioPublico;
}
// POST /login
router.post('/login', (req, res) => {
    // No Express 5, req.body é undefined quando nenhum corpo é enviado
    const { email, senha } = req.body ?? {};
    // 400: campos obrigatórios ausentes (a validação do servidor não depende da tela)
    const camposAusentes = [];
    if (typeof email !== 'string' || email.trim() === '')
        camposAusentes.push('email');
    if (typeof senha !== 'string' || senha.trim() === '')
        camposAusentes.push('senha');
    if (camposAusentes.length > 0) {
        res.status(400).json({
            erro: `Campo(s) obrigatório(s) ausente(s): ${camposAusentes.join(', ')}.`
        });
        return;
    }
    // O e-mail ignora maiúsculas/minúsculas e espaços; a senha é comparada exatamente
    const emailNormalizado = email.trim().toLowerCase();
    const usuario = usuarios.find((u) => u.email.toLowerCase() === emailNormalizado && u.senha === senha);
    // 401: mesma mensagem para e-mail inexistente e senha errada (não revela qual falhou)
    if (!usuario) {
        res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
        return;
    }
    // 200: dados do usuário e perfil, sem a senha
    res.status(200).json({
        mensagem: 'Login realizado com sucesso.',
        usuario: removerSenha(usuario)
    });
});
// GET /usuarios
router.get('/usuarios', (_req, res) => {
    res.status(200).json(usuarios.map(removerSenha));
});
export default router;
//# sourceMappingURL=login.js.map