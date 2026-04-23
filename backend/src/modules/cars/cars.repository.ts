import { desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { cars } from '../../db/schema/cars.js';
import type { CreateCarInput, SearchFilters } from './cars.schema.js';
import { buildSearchQueryParts } from './search/search-query-builder.js';

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


        async searchFilterCars(params: { filters: SearchFilters}){
            const queryParts = buildSearchQueryParts(params.filters)

            let itemsQuery = db.select().from(cars).$dynamic();

            if(queryParts.where){
                itemsQuery = itemsQuery.where(queryParts.where)
            }

            const items = await itemsQuery.orderBy(desc(cars.createdAt))

            return { items }
        }
    }