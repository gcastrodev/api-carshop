import type { CarsRepository } from "../cars.repository.js";
import { OpenAI } from "openai";
import { env } from "../../../config/env.js";



export class AISearchAgentService {
    private readonly client = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
    });

    constructor(
        private readonly repository: CarsRepository
    ){}


    async run(userMessage: string) {
        console.log("MENSAGEM", userMessage);

        const completion = await this.client.chat.completions.create({
            model: env.OPENAI_MODEL as string,
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: "Assistente de catálogo de veículos (português). Chame buscar_carros exatamente uma vez. Preencha `marca` se o usuário citar fabricante (BMW, Volkswagem, Fiat...), mesmo em frases curtas como 'tem BMW?' ou 'vocês tem Audi?'. Preencha `nome` para modelo (GOL, Civic). Preencha `versão` se citar motor ou versão (1.4, TSI, Confortline). Vários campos podem vir juntos. Só passe {} quando a mensagem não mencionar nenhuma marca, modelo nem versão (pergunta totalmente genérica sobre listar tudo)."
                }
            ]
        })
    }
}