
/*
Autor: Jhenyfer da Silva Souza
Responsabilidade: autenticar o usuário utilizando o Oracle e gerar token JWT.
*/

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import oracledb from 'oracledb';
import { getConn } from '../db.js';
import { autenticar } from '../middlewares/autenticar.js';

const router = Router();

interface UsuarioBanco {
    ID_USUARIO: number;
    NOME: string;
    EMAIL: string;
    SENHA_HASH: string;
    ID_PERFIL: number;
    PERFIL: string;
}

// POST /login
router.post('/login', async (req: Request, res: Response) => {
    const { email, senha } = req.body ?? {};

    // Validação dos campos obrigatórios
    if (
        typeof email !== 'string' ||
        email.trim() === '' ||
        typeof senha !== 'string' ||
        senha.trim() === ''
    ) {
        res.status(400).json({
            erro: 'E-mail e senha são obrigatórios.'
        });
        return;
    }

    // Verifica se a chave JWT está configurada
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        res.status(500).json({
            erro: 'Configuração de autenticação não encontrada.'
        });
        return;
    }

    // Valida o nome do schema, caso tenha sido configurado
    const schema = process.env.DB_SCHEMA?.trim();

    if (schema && !/^[A-Za-z][A-Za-z0-9_$#]*$/.test(schema)) {
        res.status(500).json({
            erro: 'Configuração do schema do banco inválida.'
        });
        return;
    }

    // Permite utilizar um schema específico ou o schema do usuário conectado
    const tabelaUsuario = schema
        ? `${schema}.USUARIO`
        : 'USUARIO';

    const tabelaPerfil = schema
        ? `${schema}.PERFIL`
        : 'PERFIL';

    let conexao: oracledb.Connection | undefined;

    try {
        conexao = await getConn();

        // Busca o usuário ativo e seu respectivo perfil
        const resultado = await conexao.execute<UsuarioBanco>(
            `SELECT
                U.ID_USUARIO,
                U.NOME,
                U.EMAIL,
                U.SENHA_HASH,
                U.ID_PERFIL,
                P.NOME AS PERFIL
             FROM ${tabelaUsuario} U
             INNER JOIN ${tabelaPerfil} P
                ON P.ID_PERFIL = U.ID_PERFIL
             WHERE LOWER(U.EMAIL) = :email
               AND U.ATIVO = 'S'`,
            {
                email: email.trim().toLowerCase()
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        const usuario = resultado.rows?.[0];

        // Não informa se o e-mail ou a senha estão incorretos
        if (!usuario) {
            res.status(401).json({
                erro: 'E-mail ou senha inválidos.'
            });
            return;
        }

        // Compara a senha digitada com o hash armazenado no banco
        const senhaValida = await bcrypt.compare(
            senha,
            usuario.SENHA_HASH
        );

        if (!senhaValida) {
            res.status(401).json({
                erro: 'E-mail ou senha inválidos.'
            });
            return;
        }

        // Gera o token JWT com os dados necessários para identificar o usuário
        const token = jwt.sign(
            {
                idUsuario: usuario.ID_USUARIO,
                email: usuario.EMAIL,
                idPerfil: usuario.ID_PERFIL,
                perfil: usuario.PERFIL
            },
            jwtSecret,
            {
                expiresIn: '2h'
            }
        );

        // Retorna o token e os dados públicos do usuário
        res.status(200).json({
            mensagem: 'Login realizado com sucesso.',
            token,
            usuario: {
                id: usuario.ID_USUARIO,
                nome: usuario.NOME,
                email: usuario.EMAIL,
                idPerfil: usuario.ID_PERFIL,
                perfil: usuario.PERFIL
            }
        });

    } catch (erro) {
        console.error('Erro ao realizar login:', erro);

        res.status(500).json({
            erro: 'Erro interno ao realizar login.'
        });

    } finally {
        if (conexao) {
            try {
                await conexao.close();
            } catch (erro) {
                console.error('Erro ao fechar conexão:', erro);
            }
        }
    }
});

// get /usuarios: lista usuários ativos (id + nome), usada pelo formulário de cadastro/edição
// de demanda para montar o select de "responsável" com dados reais do banco.
router.get('/usuarios', autenticar, async (_req: Request, res: Response) => {
    let conexao: oracledb.Connection | undefined;

    try {
        conexao = await getConn();

        const resultado = await conexao.execute(
            `SELECT ID_USUARIO, NOME FROM USUARIO WHERE ATIVO = 'S' ORDER BY NOME`
        );

        res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao listar usuários:', erro);
        res.status(500).json({ erro: 'Erro interno ao listar usuários.' });
    } finally {
        if (conexao) {
            await conexao.close();
        }
    }
});

export default router;
