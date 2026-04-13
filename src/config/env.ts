import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().int().min(1).default(3333),
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1),
});

const parseEnv = envSchema.safeParse(process.env);

if(!parseEnv.success){
    throw new Error("TA FALTANDO VARIAVEL!")
}

export const env = parseEnv.data;