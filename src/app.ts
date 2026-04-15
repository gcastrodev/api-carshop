import Fastify from 'fastify';
import cors from '@fastify/cors';
import { carsRoutes } from './modules/cars/cars.routes.js';

export async function buildApp() {
    const app = Fastify({
        logger: true,
    })

    await app.register(cors, { origin: true })

    app.get("/teste", async () => ({
        status: true,
        message: "FUNCIONOOOU!",
    }));


    app.register(carsRoutes);

    return app;
}