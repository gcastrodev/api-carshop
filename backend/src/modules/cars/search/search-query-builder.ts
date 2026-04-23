import { and, eq, gte, ilike, lte, type SQL } from "drizzle-orm";
import type { SearchFilters } from "../cars.schema.js";
import { cars } from "../../../db/schema/cars.js";

export function buildSearchQueryParts (
    filters: SearchFilters
){

    const parts: SQL[] = [];

    if(filters.brand) {
        parts.push(ilike(cars.brand, `%${filters.brand}%`))
    }

    if(filters.model) {
        parts.push(ilike(cars.model, `%${filters.model}%`))
    }

    if(filters.version) {
        parts.push(ilike(cars.version, `%${filters.version}%`))
    }

    if(filters.year !== undefined) {
        parts.push(eq(cars.year, filters.year))
    }

    if(filters.yearMin !== undefined) {
        parts.push(gte(cars.year, filters.yearMin))
    }

    if(filters.yearMax !== undefined) {
        parts.push(lte(cars.year, filters.yearMax))
    }

    if(filters.mileage !== undefined) {
        parts.push(eq(cars.mileage, filters.mileage))
    }

    if(filters.mileageMin !== undefined) {
        parts.push(gte(cars.mileage, filters.mileageMin))
    }

    if(filters.mileageMax !== undefined) {
        parts.push(lte(cars.mileage, filters.mileageMax))
    }

    if(!parts.length) {
        return {}
    }

    return { where: parts.length === 1 ? parts[0] : and(...parts)}
}