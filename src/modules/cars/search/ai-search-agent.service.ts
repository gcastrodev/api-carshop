import type { CarsRepository } from "../cars.repository.js";
import { OpenAI } from "openai";
import { env } from "../../../config/env.js";
import { z } from "zod";
import type { SearchFilters } from "../cars.schema.js";

const TOOL_NAME = "buscar_carros";

const toolArgsSchema = z.object({
    marca: z.string().trim().min(1).optional(),
    nome: z.string().trim().min(1).optional(),
    versao: z.string().trim().min(1).optional(),
});

const BUSCAR_CARROS_TOOL = {
    type: "function" as const,
    function: {
        name: TOOL_NAME,
        description: "Consulta o catálogo por critérios. Sempre preencha os campos que a pergunta deixar claro. `marca` = fabricante (BMW, Volkswagem, Fiat...). `nome` = modelo (GOL, T-Cross). `versao` = motor/trim citado (1.4, ConfortLine). Ex.: 'tem BMW?' => {\"marca\":\"BMW\"}. 'tem gol 1.4?' => {\"nome\":\"Gol\",\"versao\":\"1.4\"}. Use {} somente se não houver marca, modelo nem versão (ex.: 'mostre tudo', 'liste o catálogo').",
        parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
                marca: {
                    type: "string",
                    description: "Fabricante do veículo (BMW, Volkswagem, Fiat...)"
                },
                nome: {
                    type: "string",
                    description: "Modelo do veículo (GOL, Civic...)",
                },
                versao: {
                    type: "string",
                    description: "Motor/trim citado (1.4, ConfortLine, M Sport...)"
                },
            },
        },
    },
} satisfies OpenAI.ChatCompletionTool


function toolJsonToFilters(raw: string): SearchFilters{
    try{
        const parsed = toolArgsSchema.safeParse(JSON.parse(raw) as unknown)

        if(!parsed.success){
            return {}
        }

        const { marca, versao, nome } = parsed.data;
        return {
            ...(marca ? { brand: marca } : {} ),
            ...(versao ? { brand: versao } : {} ),
            ...(nome ? { brand: nome } : {} ),
        }
    }catch(err){
        return {}
    }
}

export class AiSearchAgentService {
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
                    content: "Assistente de catálogo de veículos (português). Chame buscar_carros exatamente uma vez. Preencha `marca` se o usuário citar fabricante (BMW, Volkswagem, Fiat...), mesmo em frases curtas como 'tem BMW?' ou 'vocês tem Audi?'. Preencha `nome` para modelo (GOL, Civic). Preencha `versão` se citar motor ou versão (1.4, TSI, Confortline, M Sport). Vários campos podem vir juntos. Só passe {} quando a mensagem não mencionar nenhuma marca, modelo nem versão (pergunta totalmente genérica sobre listar tudo)."
                },
                {
                    role: "user",
                    content: userMessage 
                }
            ],
            tools: [BUSCAR_CARROS_TOOL],
            tool_choice: "required"
        });

        const toolCalls = completion.choices[0]?.message.tool_calls ?? [];

        const call = toolCalls.find(
            (c): c is Extract<(typeof toolCalls)[number], {type: "function"}> => 
                c.type === 'function' && c.function.name === TOOL_NAME,
        );

        const filters = call ? toolJsonToFilters(call.function.arguments ?? '{}') 
        : {};

        console.log(filters);

        return { ok: true };
    }
} 