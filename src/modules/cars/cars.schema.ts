import { z } from "zod";    


export const createCarSchema = z.object({
    brand: z.string().min(1),
    model: z.string().min(1),
    version: z.string().min(1),
    year: z.number().int().min(1950),
    price: z.number().positive(),
    fuel: z.string().min(1),
    transmission: z.string().min(1), 
    mileage: z.number().int().min(0), 
    imageUrl: z.string().trim().url().max(2048).optional(),
});

export const searchRequestSchema = z.object({
    search: z.string().min(1),
})

export const filtersSchema = z.object({
    brand: z.string().trim().min(1).optional(),
    model: z.string().trim().min(1).optional(),
    version: z.string().trim().min(1).max(120).optional(),
})

export type SearchCarsRequestInput = z.infer<typeof searchRequestSchema>;
export type CreateCarInput = z.infer<typeof createCarSchema>;
export type SearchFilters = z.infer<typeof filtersSchema>;