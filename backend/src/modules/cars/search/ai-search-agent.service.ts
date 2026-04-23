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
    ano: z.number().int().min(1950).optional(),
    ano_min: z.number().int().min(1950).optional(),
    ano_max: z.number().int().min(1950).optional(),
    quilometragem: z.number().int().min(0).optional(),
    quilometragem_min: z.number().int().min(0).optional(),
    quilometragem_max: z.number().int().min(0).optional(),
});

const BUSCAR_CARROS_TOOL = {
    type: "function" as const,
    function: {
        name: TOOL_NAME,
        description: "Consulta o catálogo por critérios. Sempre preencha os campos explícitos na pergunta: `marca` (fabricante), `nome` (modelo), `versao` (motor/trim), `ano` (ano exato), `ano_min` (a partir de), `ano_max` (até), `quilometragem` (km exato), `quilometragem_min` (km mínimo), `quilometragem_max` (km máximo). Ex.: 'tem BMW 2020?' => {\"marca\":\"BMW\",\"ano\":2020}. 'a partir de 2021' => {\"ano_min\":2021}. 'até 50 mil km' => {\"quilometragem_max\":50000}. Use {} somente se não houver marca, modelo, versão, ano ou km.",
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
                ano: {
                    type: "integer",
                    description: "Ano exato do veículo (ex.: 2020)"
                },
                ano_min: {
                    type: "integer",
                    description: "Ano mínimo quando o usuário indicar 'a partir de', 'no mínimo'..."
                },
                ano_max: {
                    type: "integer",
                    description: "Ano máximo quando o usuário indicar 'até', 'no máximo'..."
                },
                quilometragem: {
                    type: "integer",
                    description: "Quilometragem exata em km (ex.: 50000)"
                },
                quilometragem_min: {
                    type: "integer",
                    description: "Quilometragem mínima quando o usuário indicar 'acima de', 'a partir de'..."
                },
                quilometragem_max: {
                    type: "integer",
                    description: "Quilometragem máxima quando o usuário indicar 'até', 'no máximo'..."
                },
            },
        },
    },
} satisfies OpenAI.ChatCompletionTool


function naturalReply(itemCount: number): string{
    if(itemCount === 0){
        return "Não encontrei nenhum veículo no nosso catálogo."
    }

    if(itemCount === 1){
        return "Encontrei um veículo com essas características."
    }

    return `Encontrei ${itemCount} veículos no catálogo pra você.`
}


function toolJsonToFilters(raw: string): SearchFilters{
    try{
        const parsed = toolArgsSchema.safeParse(JSON.parse(raw) as unknown)

        if(!parsed.success){
            return {}
        }

        const {
            marca,
            versao,
            nome,
            ano,
            ano_min,
            ano_max,
            quilometragem,
            quilometragem_min,
            quilometragem_max,
        } = parsed.data;

        return {
            ...(marca ? { brand: marca } : {} ),
            ...(versao ? { version: versao } : {} ),
            ...(nome ? { model: nome } : {} ),
            ...(ano !== undefined ? { year: ano } : {} ),
            ...(ano_min !== undefined ? { yearMin: ano_min } : {} ),
            ...(ano_max !== undefined ? { yearMax: ano_max } : {} ),
            ...(quilometragem !== undefined ? { mileage: quilometragem } : {} ),
            ...(quilometragem_min !== undefined ? { mileageMin: quilometragem_min } : {} ),
            ...(quilometragem_max !== undefined ? { mileageMax: quilometragem_max } : {} ),
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

        const completion = await this.client.chat.completions.create({
            model: env.OPENAI_MODEL as string,
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: "Assistente de catálogo de veículos (português). Chame buscar_carros exatamente uma vez. Preencha `marca` se o usuário citar fabricante (BMW, Volkswagem, Fiat...), `nome` para modelo (GOL, Civic), `versao` para motor/trim (1.4, TSI, Confortline, M Sport). Para ano e km, use campo exato quando o usuário der valor direto ('ano 2020', '50 mil km'), use `ano_min`/`quilometragem_min` para 'a partir de', 'acima de', 'no mínimo', e `ano_max`/`quilometragem_max` para 'até', 'no máximo'. Vários campos podem vir juntos. Só passe {} quando a mensagem não mencionar marca, modelo, versão, ano nem km."
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



        const { items } = await this.repository.searchFilterCars({ filters })

        return {
            items,
            reply: naturalReply(items.length),
        };
    }
} 