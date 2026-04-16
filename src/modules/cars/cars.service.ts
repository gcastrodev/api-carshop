import type { CarsRepository } from "./cars.repository.js";
import type { CreateCarInput } from "./cars.schema.js";

export class CarsService {
    constructor(private readonly repository: CarsRepository){}

    async createCar(input: CreateCarInput) {
        const created = await this.repository.createCar(input);
    return created;
    }
}