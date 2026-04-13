import Fastify from 'fastify';
import cors from '@fastify/cors';

export async function buildApp() {
    const app = Fastify({
        logger: true,
    })

    await app.register(cors, { origin: true })

    app.get("/teste", async () => ({
        status: true,
        message: "FUNCIONOOOU!",
    }));


    // CARREGAR NOSSAS ROTAS..
    // /cars < cadastrar um carro...

    return app;
}