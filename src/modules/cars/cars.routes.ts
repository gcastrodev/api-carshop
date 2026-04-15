// CRIAR AS ROTAS endpoints do cars
import type { FastifyInstance } from "fastify";


export async function carsRoutes(app: FastifyInstance) {
    app.get('/cars/teste', () => ({ teste: "OK OK" }));
}