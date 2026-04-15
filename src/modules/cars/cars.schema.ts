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

export type CreateCarInput = z.infer<typeof createCarSchema>;