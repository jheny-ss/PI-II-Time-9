
/*
Autor: Jhenyfer da Silva Souza
Responsabilidade: verificar o token JWT do usuário.
*/

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface DadosToken {
    idUsuario: number;
    email: string;
    idPerfil: number;
    perfil: string;
}

declare global {
    namespace Express {
        interface Request {
            usuario?: DadosToken;
        }
    }
}

export function autenticar(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const cabecalho = req.headers.authorization;

    if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
        res.status(401).json({
            erro: 'Autenticação necessária.'
        });
        return;
    }

    const token = cabecalho.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        res.status(500).json({
            erro: 'Configuração de autenticação não encontrada.'
        });
        return;
    }

    try {
        const dados = jwt.verify(token, jwtSecret);

        if (
            typeof dados !== 'object' ||
            dados === null ||
            typeof dados.idUsuario !== 'number' ||
            typeof dados.email !== 'string' ||
            typeof dados.idPerfil !== 'number' ||
            typeof dados.perfil !== 'string'
        ) {
            res.status(401).json({
                erro: 'Token inválido.'
            });
            return;
        }

        req.usuario = {
            idUsuario: dados.idUsuario,
            email: dados.email,
            idPerfil: dados.idPerfil,
            perfil: dados.perfil
        };

        next();

    } catch {
        res.status(401).json({
            erro: 'Token inválido ou expirado.'
        });
    }
}
