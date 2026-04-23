# API CarShop

Projeto de catálogo de carros com API em Node.js + TypeScript.

No momento, o repositório possui o backend funcional e já está preparado para evoluir para uma aplicação completa com frontend.

## Estrutura do projeto

```text
api-carshop/
  backend/   # API Fastify + Drizzle + PostgreSQL
  frontend/  # (planejado) interface web
```

## Stack atual (backend)

- Node.js
- TypeScript
- Fastify
- Drizzle ORM + PostgreSQL
- Zod (validação)
- OpenAI (busca por linguagem natural)

## Requisitos

- Node.js 20+ (recomendado)
- npm
- PostgreSQL em execução
- Chave da OpenAI

## Como rodar o backend

1. Entre na pasta do backend:

```bash
cd backend
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env` (exemplo):

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://usuario:senha@localhost:5432/carshop
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4o-mini
```

4. Inicie em modo desenvolvimento:

```bash
npm run dev
```

Servidor disponível em `http://localhost:3333`.

## Scripts úteis

Dentro de `backend/`:

- `npm run dev`: sobe a API com `tsx watch`
- `npm run build`: compila TypeScript
- `npx drizzle-kit studio`: abre interface para inspecionar o banco

## Rotas atuais

- `GET /teste`
  - Check simples de funcionamento.

- `POST /cars`
  - Cria um carro no catálogo.
  - Campos esperados: `brand`, `model`, `version`, `year`, `price`, `fuel`, `transmission`, `mileage`, `imageUrl` (opcional).

- `POST /cars/search`
  - Busca carros com texto livre (ex.: "tem gol 1.4?").
  - Body:
    ```json
    {
      "search": "quero um civic"
    }
    ```

## Próximos passos (roadmap)

- Criar o frontend para consumo da API.
- Melhorar UX da busca inteligente.
- Adicionar testes automatizados (unitário e integração).
- Evoluir tratamento de erros e padronização das respostas.
- Preparar deploy completo (backend + frontend).

## Status do projeto

Em desenvolvimento ativo.  
Backend funcional e pronto para expansão com frontend.
