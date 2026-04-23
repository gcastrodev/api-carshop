// CRIAR AS ROTAS endpoints do cars
import type { FastifyInstance } from "fastify";
import { CarsController } from "./cars.controller.js";
import { CarsRepository } from "./cars.repository.js";
import { CarsService } from "./cars.service.js";
import { AiSearchAgentService } from "./search/ai-search-agent.service.js";

const repository = new CarsRepository();
const searchAgent = new AiSearchAgentService(repository);
const service = new CarsService(repository, searchAgent);
const controller = new CarsController(service);

export async function carsRoutes(app: FastifyInstance) {
    app.post('/cars', controller.createCar);
    app.post('/cars/search', controller.searchCars);
}