import { db } from '../../db/client.js';
import { cars } from '../../db/schema/cars.js';
import type { CreateCarInput } from './cars.schema.js';

export class CarsRepository {
    async createCar(data: CreateCarInput) {
        const [row] = await db
        .insert(cars)
        .values({
            brand: data.brand,
            model: data.model,
            version: data.version,
            year: data.year,
            price: data.price.toFixed(2),
            fuel: data.fuel,
            transmission: data.transmission,
            mileage: data.mileage,
            imageUrl: data.imageUrl ?? "",
        })
        .returning();

        if (!row) {
            throw new Error('FALHA AO CADASTRAR O CARRO');
        }

        return row
        }
    }