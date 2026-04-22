import type { CarsRepository } from "./cars.repository.js";
import type { CreateCarInput, SearchCarsRequestInput } from "./cars.schema.js";
import type { AiSearchAgentService } from "./search/ai-search-agent.service.js";

export class CarsService {
    constructor(
        private readonly repository: CarsRepository,
        private readonly searchAgent: AiSearchAgentService
    ){}

    async createCar(input: CreateCarInput) {
        const created = await this.repository.createCar(input);
    return created;
    }

    async searchCars(input: SearchCarsRequestInput) {
        const resul = await this.searchAgent.run(input.search);
        return resul;
    }
}