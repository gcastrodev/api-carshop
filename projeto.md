# Projeto Backend - API CarShop

## Visao geral

Este backend e uma API HTTP em Node.js + TypeScript, construída com Fastify e persistencia em PostgreSQL via Drizzle ORM.  
Hoje, o projeto implementa um modulo de dominio principal (`cars`) com endpoint de criacao de carros e infraestrutura basica para inicializacao, configuracao por ambiente e acesso ao banco.

Arquitetura atual: **modular em camadas** (rota -> controller -> service -> repository -> banco).

---

## Stack e tecnologias

- Runtime: `Node.js`
- Linguagem: `TypeScript` (`module: nodenext`, `strict: true`)
- Framework HTTP: `Fastify`
- CORS: `@fastify/cors`
- Validacao:
  - `zod` para payloads de entrada
  - `zod` para validar variaveis de ambiente
- Banco de dados:
  - `PostgreSQL` (driver `pg`)
  - `drizzle-orm` para acesso tipado ao banco
  - `drizzle-kit` para geracao/gestao de migracoes
- Utilitarios:
  - `dotenv` para carregar `.env`
  - `tsx` para dev com hot reload

Dependencia presente mas nao utilizada na implementacao atual:
- `openai`

---

## Estrutura de pastas (estado atual)

```text
backend/
  drizzle.config.ts
  package.json
  tsconfig.json
  src/
    app.ts
    server.ts
    config/
      env.ts
    db/
      client.ts
      migrations/
        0000_silent_longshot.sql
        meta/
          0000_snapshot.json
          _journal.json
      schema/
        cars.ts
        index.ts
    modules/
      cars/
        cars.routes.ts
        cars.controller.ts
        cars.service.ts
        cars.repository.ts
        cars.schema.ts
```

---

## Ciclo de inicializacao da aplicacao

### 1) `src/server.ts` (entrypoint)

- Importa `buildApp()` de `src/app.ts`.
- Importa `env` de `src/config/env.ts`.
- Cria a app e chama `app.listen({ port: env.PORT, host: "0.0.0.0" })`.
- Em falha de boot, registra erro no logger do Fastify e encerra processo com `process.exit(1)`.

Observacao:
- O nome da funcao esta como `bootsctrap` (typo de `bootstrap`), mas funcionalmente nao quebra o fluxo.

### 2) `src/app.ts` (composicao da app)

- Cria instancia Fastify com `logger: true`.
- Registra CORS global: `origin: true` (aceita qualquer origem).
- Exponibiliza rota utilitaria `GET /teste`.
- Registra as rotas do modulo `cars` via `app.register(carsRoutes)`.

---

## Configuracao de ambiente e validacao

Arquivo: `src/config/env.ts`

- Carrega variaveis com `import "dotenv/config"`.
- Define schema Zod para o ambiente:
  - `NODE_ENV`: `development | production | test`
  - `PORT`: inteiro >= 1, com default `3333`
  - `DATABASE_URL`: obrigatoria
  - `OPENAI_API_KEY`: obrigatoria
  - `OPENAI_MODEL`: obrigatoria
- Executa `safeParse(process.env)`.
- Se faltar/invalidar variavel, lanca erro imediato: `"TA FALTANDO VARIAVEL!"`.

Impacto pratico:
- A aplicacao nao inicia sem `OPENAI_*`, mesmo sem uso desses valores no codigo atual.

---

## Camada de dados e banco

### Conexao (`src/db/client.ts`)

- Cria `Pool` do `pg` com `connectionString: env.DATABASE_URL`.
- Cria instancia `db` via `drizzle({ client: pool, schema })`.

### Schemas Drizzle

- `src/db/schema/cars.ts`: define tabela `cars` com colunas:
  - `id` UUID PK com `defaultRandom()`
  - `brand`, `model`, `year`, `price` obrigatorios
  - `version`, `fuel`, `transmission`, `mileage`, `imageUrl` opcionais
  - `createdAt` e `updatedAt` com `defaultNow()` e `notNull()`
- `src/db/schema/index.ts`: re-exporta schemas (`export * from "./cars.js"`).

### Migracoes

- Configuracao em `drizzle.config.ts`:
  - `schema: "./src/db/schema/index.ts"`
  - `out: "./src/db/migrations"`
  - `dialect: "postgresql"`
- Migracao atual:
  - `src/db/migrations/0000_silent_longshot.sql` cria tabela `cars`
  - metadados em `src/db/migrations/meta/`

---

## Arquitetura do modulo `cars`

O projeto usa separacao de responsabilidades por camada:

1. **Rota** (`cars.routes.ts`)  
   Define endpoint HTTP e injeta dependencias.

2. **Controller** (`cars.controller.ts`)  
   Recebe request/reply, valida entrada e formata resposta HTTP.

3. **Service** (`cars.service.ts`)  
   Camada de negocio (atualmente delega diretamente ao repositorio).

4. **Repository** (`cars.repository.ts`)  
   Camada de persistencia com Drizzle e SQL tipado.

5. **Schema de entrada** (`cars.schema.ts`)  
   Contrato de validacao do payload de criacao (`createCarSchema`).

### Endpoint implementado

- `POST /cars`
  - Definido em `cars.routes.ts`
  - Handler: `controller.createCar`

### Contrato de entrada (`createCarSchema`)

Campos validados:
- `brand`: string obrigatoria
- `model`: string obrigatoria
- `version`: string obrigatoria
- `year`: inteiro >= 1950
- `price`: numero positivo
- `fuel`: string obrigatoria
- `transmission`: string obrigatoria
- `mileage`: inteiro >= 0
- `imageUrl`: URL valida opcional (max 2048)

---

## Fluxo completo de uma requisicao (`POST /cars`)

1. Cliente envia requisicao para `POST /cars`.
2. Fastify encaminha para rota em `cars.routes.ts`.
3. `CarsController.createCar`:
   - valida `request.body` com `createCarSchema.parse(...)`;
   - chama `this.service.createCar(body)`.
4. `CarsService.createCar` repassa para `CarsRepository.createCar`.
5. `CarsRepository.createCar`:
   - executa `insert` na tabela `cars`;
   - formata preco com `toFixed(2)`;
   - usa `imageUrl ?? ""` quando ausente;
   - retorna a linha criada com `.returning()`;
   - se nada retornar, lanca erro.
6. Controller responde `reply.status(200).send(result)`.

Observacoes de comportamento:
- Para criacao, o codigo retorna `200` (convencionalmente APIs REST costumam usar `201`).
- Erros de validacao (`zod`) e de banco sobem para o pipeline padrao de erro do Fastify.

---

## Tratamento de erros

Estado atual:

- Existe tratamento de erro no bootstrap (`server.ts`) apenas para falha ao subir servidor.
- Nao existe `setErrorHandler` global customizado em `app.ts`.
- Nao ha padrao unico de erro de dominio (ex.: classes customizadas por tipo).

Consequencia:
- O formato de erro para validacoes e excecoes depende do padrao interno do Fastify/Zod, sem contrato centralizado definido pela aplicacao.

---

## Seguranca

Implementado:

- CORS habilitado globalmente (`origin: true`).

Nao identificado na base atual:

- Autenticacao (JWT, session, API key, etc.)
- Autorizacao (roles/permissoes)
- Rate limiting
- Headers de seguranca (`helmet`)
- CSRF/cookies seguras
- Criptografia de senha (bcrypt/argon2)

Interpretacao:
- O backend esta em estagio inicial e ainda nao possui camada de seguranca robusta para producao.

---

## Scripts e execucao local

Scripts em `package.json`:

- `npm run dev`: sobe servidor em watch (`tsx watch src/server.ts`)
- `npm run build`: compila TypeScript (`tsc -p tsconfig.json`)

Passos recomendados para rodar local:

1. Instalar dependencias:
   - `npm install`
2. Criar `.env` com variaveis obrigatorias:
   - `NODE_ENV`
   - `PORT`
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
3. Garantir banco Postgres ativo e migracao aplicada.
4. Iniciar app:
   - `npm run dev`

Observacao:
- Nao ha script npm dedicado para migracao/seed no `package.json`; uso do Drizzle e manual no estado atual.

---

## Testes e qualidade

Nao foram encontrados:

- Arquivos de testes (`*.test.ts`, `*.spec.ts`)
- Framework de teste configurado (`jest`, `vitest`, etc.)
- Pipeline de testes automatizados

Impacto:
- Regressao de comportamento depende de teste manual.

---

## Decisoes arquiteturais evidentes

- **Separacao por modulo de dominio** (`src/modules/cars`)
- **Camadas claras** (controller/service/repository)
- **Validacao de entrada e ambiente com Zod**
- **Persistencia isolada em repositorio**
- **ORM tipado com Drizzle**

Essas decisoes deixam uma base boa para escalar novos modulos seguindo o mesmo padrao.

---

## Gaps tecnicos atuais (prioridade pratica)

1. Falta de tratamento global de erros e padrao de resposta.
2. Ausencia de autenticacao/autorizacao.
3. Sem testes automatizados.
4. Apenas um endpoint funcional (`POST /cars`).
5. Variaveis `OPENAI_*` obrigatorias sem uso no dominio atual.
6. Sem scripts de migracao/seed no ciclo principal de desenvolvimento.

---

## Como evoluir mantendo o padrao existente

Para crescer com consistencia, novos dominios devem repetir o mesmo desenho:

- `src/modules/<dominio>/<dominio>.schema.ts`
- `src/modules/<dominio>/<dominio>.repository.ts`
- `src/modules/<dominio>/<dominio>.service.ts`
- `src/modules/<dominio>/<dominio>.controller.ts`
- `src/modules/<dominio>/<dominio>.routes.ts`

E registrar no `src/app.ts` com `app.register(...)`.

Essa abordagem preserva acoplamento baixo entre HTTP, regra de negocio e banco.

---

## Resumo executivo

O backend do CarShop esta funcional para cadastro de carros e possui fundacao arquitetural correta para evolucao: TypeScript estrito, Fastify, Zod, Drizzle e separacao por camadas.  
No entanto, ainda esta em fase inicial, com cobertura funcional limitada e sem componentes de maturidade de producao (auth, testes, padrao de erro e seguranca reforcada).  
Com a estrutura ja criada, a expansao para novos modulos e fluxos e direta, desde que os mesmos contratos e camadas sejam mantidos.
