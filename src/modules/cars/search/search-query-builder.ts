import { and, ilike, type SQL} from "drizzle-orm";
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

    if(!parts.length) {
        return {}
    }

    return { where: parts.length === 1 ? parts[0] : and(...parts)}
}