// CRIAR AS ROTAS endpoints do cars
import type { FastifyInstance } from "fastify";
import { CarsController } from "./cars.controller.js";
import { CarsRepository } from "./cars.repository.js";
import { CarsService } from "./cars.service.js";

const repository = new CarsRepository();
const service = new CarsService(repository);
const controller = new CarsController(service);

export async function carsRoutes(app: FastifyInstance) {
    app.post('/cars', controller.createCar);
    app.post('/cars/search', () => {});
}