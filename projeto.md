# Projeto Backend - API CarShop

## Visao geral

Backend HTTP em Node.js + TypeScript com Fastify, Drizzle ORM e PostgreSQL.

O projeto ja possui:
- cadastro de carros;
- busca semantica em linguagem natural (IA) para consultar o catalogo;
- separacao por camadas no modulo `cars` (routes -> controller -> service -> repository).

---

## Stack e tecnologias

- Runtime: `Node.js`
- Linguagem: `TypeScript`
- HTTP: `Fastify`
- CORS: `@fastify/cors`
- Validacao: `zod`
- Banco: `PostgreSQL` + `pg` + `drizzle-orm`
- Migracoes: `drizzle-kit`
- IA (busca): `openai`
- Ambiente: `dotenv`
- Dev runtime: `tsx`

---

## Estrutura principal

```text
backend/
  src/
    app.ts
    server.ts
    config/env.ts
    db/
      client.ts
      schema/
        cars.ts
        index.ts
      migrations/
    modules/
      cars/
        cars.routes.ts
        cars.controller.ts
        cars.service.ts
        cars.repository.ts
        cars.schema.ts
        search/
          ai-search-agent.service.ts
          search-query-builder.ts
```

---

## Rotas do backend (estado atual)

### `GET /teste`

Rota simples de health/check manual.

Resposta:
- `status: true`
- `message: "FUNCIONOOOU!"`

### `POST /cars`

Cria um carro no catalogo.

Body validado por `createCarSchema`:
- `brand` (string)
- `model` (string)
- `version` (string)
- `year` (int >= 1950)
- `price` (number > 0)
- `fuel` (string)
- `transmission` (string)
- `mileage` (int >= 0)
- `imageUrl` (url opcional)

Observacoes:
- resposta atual com status `200`;
- persistencia no PostgreSQL via Drizzle (`cars.repository.ts`).

### `POST /cars/search`

Busca carros a partir de texto livre (ex.: "tem gol 1.4?", "mostra BMW", "liste tudo").

Body validado por `searchRequestSchema`:
- `search` (string obrigatoria)

Comportamento:
1. `CarsService` envia o texto para `AiSearchAgentService`.
2. A IA chama tool interna `buscar_carros` com argumentos estruturados (`marca`, `nome`, `versao`).
3. Os argumentos sao convertidos em filtros de dominio (`brand`, `model`, `version`).
4. O repositorio monta query dinamica com `ilike` e `and` (`search-query-builder.ts`).
5. Retorno da rota:
   - `items`: lista de carros encontrados;
   - `reply`: frase natural em portugues baseada na quantidade de resultados.

---

## Funcionalidades do backend

### 1) Inicializacao da aplicacao

- `server.ts` cria a app (`buildApp`) e sobe com `host: "0.0.0.0"` e `port` do ambiente.
- Em erro de boot, loga e encerra processo.
- A funcao esta nomeada como `bootsctrap` (typo), mas funciona.

### 2) Configuracao de ambiente

`env.ts` valida com Zod as variaveis:
- `NODE_ENV` (`development | production | test`)
- `PORT`
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Sem essas variaveis, a API nao inicia.

### 3) Persistencia de carros

Tabela `cars` (`db/schema/cars.ts`) com campos:
- identificacao: `id`
- dados comerciais: `brand`, `model`, `version`, `year`, `price`
- atributos: `fuel`, `transmission`, `mileage`, `imageUrl`
- auditoria: `createdAt`, `updatedAt`

No cadastro, o repositorio:
- converte preco para 2 casas (`toFixed(2)`);
- aplica fallback `imageUrl ?? ""`;
- retorna o registro criado via `.returning()`.

### 4) Busca inteligente no catalogo

Funcionalidade nova no backend:
- recebe pergunta em linguagem natural;
- usa OpenAI para extrair filtros;
- aplica filtros no banco com busca parcial case-insensitive (`ilike`);
- devolve resposta amigavel para o usuario final.

---

## Fluxos principais

### Fluxo de cadastro (`POST /cars`)

1. Rota recebe request.
2. Controller valida body com Zod.
3. Service delega ao repository.
4. Repository insere no banco.
5. Controller retorna o item criado.

### Fluxo de busca IA (`POST /cars/search`)

1. Rota recebe texto de busca.
2. Controller valida body.
3. Service chama agente de IA.
4. Agente transforma texto em filtros.
5. Repository consulta banco com filtros dinamicos.
6. Service retorna `items` + `reply`.

---

## Scripts

- `npm run dev` -> `tsx watch src/server.ts`
- `npm run build` -> `tsc -p tsconfig.json`

---

## Estado atual e proximos passos recomendados

Pontos fortes:
- arquitetura limpa por camadas;
- validacao de entrada e ambiente;
- integracao com IA para busca orientada por linguagem natural.

Melhorias recomendadas:
1. Padronizar respostas e tratamento global de erro.
2. Retornar `201` em criacao de recurso (`POST /cars`).
3. Adicionar autenticacao/autorizacao.
4. Criar testes automatizados (unitario/integracao).
5. Adicionar scripts de migracao/seed no ciclo de desenvolvimento.
