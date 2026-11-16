/*
Autor: Jhenyfer da Silva Souza
Responsabilidade: verificar se o perfil pode acessar a rota.
*/

import { Request, Response, NextFunction } from 'express';

export function autorizar(...perfisPermitidos: number[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.usuario) {
            res.status(401).json({
                erro: 'Usuário não autenticado.'
            });
            return;
        }

        if (!perfisPermitidos.includes(req.usuario.idPerfil)) {
            res.status(403).json({
                erro: 'Você não tem permissão para realizar esta ação.'
            });
            return;
        }

        next();
    };
}