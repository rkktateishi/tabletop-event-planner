# Tabletop Game Events

Event calendar and registration app for a game store. Feature spec: [SPECS.md](SPECS.md).

## Architecture

```
client/                      React 19 + TypeScript (Vite), MUI v9, MUI X Scheduler
server/TabletopEvents.Api/   .NET 10 Web API, EF Core 10, Npgsql, FluentValidation
server/TabletopEvents.Api.Tests/  xUnit
docker-compose.yml           Postgres 16, API, nginx-served client
```

In production the client is a static build served by nginx, which also proxies `/api` to the API container so the browser talks to a single origin. The API applies EF Core migrations and seed data on startup.

Conventions for each side are in [.claude/rules/frontend.md](.claude/rules/frontend.md) and [.claude/rules/backend.md](.claude/rules/backend.md).

### Client

One folder per page or component (`src/pages/<Name>/`, `src/components/<Name>/`) containing `<Name>.ts` (hook and logic), `<Name>.template.tsx` (JSX), `<Name>.spec.ts` (tests), `<Name>.css` and `index.ts`. Routes live in `src/App/App.ts`; all HTTP goes through `src/api/client.ts`. Forms disable submit until required fields are present and display the server's validation messages.

### Server

```
Services/<Name>Service/        HTTP endpoints (<Name>Service.cs) + their request validators
Repositories/<Name>Repository/ I<Name>Repository + EF Core implementation (only layer touching AppDbContext)
Validation/                    FluentValidationActionFilter: runs validators, returns 400 ProblemDetails
Dtos/  Models/  Data/  Migrations/
```

Request validation is FluentValidation only. Failures return a 400 `ValidationProblemDetails` with `errors` keyed by property name. Registrations are inserted inside a serializable transaction so capacity cannot be exceeded by concurrent requests.

## Prerequisites

- Docker with Compose
- For local development: .NET 10 SDK, Node 24, and the `dotnet-ef` tool (`dotnet tool install -g dotnet-ef`)

## Run with Docker

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Web app | http://localhost:3000 |
| API | http://localhost:5000/api/events |
| Postgres | localhost:5432 (`tabletop` / `tabletop`) |

## Local development

```bash
# 1. database only
docker compose up db

# 2. API (http://localhost:5000, applies migrations on start)
cd server/TabletopEvents.Api
dotnet run

# 3. client (http://localhost:5173, proxies /api to :5000)
cd client
npm install
npm run dev
```

### Tests

```bash
# client
cd client && npm test

# server
cd server && dotnet test TabletopEvents.slnx
```

### Migrations

```bash
cd server/TabletopEvents.Api
dotnet ef migrations add <Name>
```

Migrations run automatically when the API starts.

### Configuration

| Setting | Env var | Default |
|---|---|---|
| Connection string | `ConnectionStrings__Default` | `Host=localhost;Port=5432;Database=tabletop;Username=tabletop;Password=tabletop` |
| Store location (used in the `.ics` download) | `Store__Location` | `Local Game Store` |

## API

| Method | Route | Notes |
|---|---|---|
| GET | `/api/games` | |
| GET | `/api/formats?game={gameId}` | |
| GET | `/api/templates?game={gameId}` | includes `defaultCapacity`, `defaultDurationMinutes` |
| GET | `/api/events` | calendar summaries |
| GET | `/api/events/{id}` | detail incl. `registrationCount`, `isFull`, `location` |
| POST | `/api/events` | `{ name, game, format, startDateTime, endDateTime, maxCapacity, description }` |
| POST | `/api/events/{id}/registrations` | `{ playerName }` → 201, **400** with field errors, or **409** when full |
