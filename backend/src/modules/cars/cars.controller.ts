import type { FastifyReply, FastifyRequest } from "fastify";
import { CarsService } from "./cars.service.js";
import { createCarSchema, searchRequestSchema } from "./cars.schema.js";

export class CarsController{
    constructor(
        private readonly service: CarsService){}

    createCar = async (request: FastifyRequest, reply: FastifyReply) => {
        const body = createCarSchema.parse(request.body)
        const result = await this.service.createCar(body);

        return reply.status(200).send(result);
    };

    searchCars = async (request: FastifyRequest, reply: FastifyReply) => {
        const body = searchRequestSchema.parse(request.body)
        const result = await this.service.searchCars(body);

        return reply.status(200).send(result);
    };
}