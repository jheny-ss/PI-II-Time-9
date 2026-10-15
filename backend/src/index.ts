
import express, { Request, Response, NextFunction } from 'express';
import loginRouter from './rotas/login.js';
// Cada integrante importa aqui o arquivo da sua rota, por exemplo:
// import dashboardRouter from './rotas/dashboard';
// import demandasRouter from './rotas/demandas';

const app = express();
const PORTA = Number(process.env.PORT) || 3000;

// Permite ler o corpo das requisições em JSON
app.use(express.json());

// Rota de verificação: confirma que o servidor está no ar
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ mensagem: 'API do Sistema de Acompanhamento de Demandas em execução.' });
});

// Registro das rotas
app.use(loginRouter);
// app.use(dashboardRouter);
// app.use(demandasRouter);

// 404: rota inexistente
app.use((_req: Request, res: Response) => {
    res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Tratamento de erros: JSON malformado vira 400; qualquer outro erro vira 500
app.use((erro: any, _req: Request, res: Response, _next: NextFunction) => {
    if (erro?.type === 'entity.parse.failed') {
        res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
        return;
    }
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
});

app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});