# Tabletop Game Events

Event calendar and registration app for a game store. See [SPECS.md](SPECS.md) for the feature spec.

- `client/` – React 19 + TypeScript (Vite), MUI v9, MUI X Scheduler, `ics`, `qrcode.react`
- `server/TabletopEvents.Api/` – .NET 10 Web API, EF Core 10, Npgsql
- Postgres 16 via Docker

## Run everything with Docker

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Web app | http://localhost:3000 |
| API | http://localhost:5000/api/events |
| Postgres | localhost:5432 (`tabletop` / `tabletop`) |

The API applies migrations and seed data on startup, so no manual database step is needed.

## Frontend structure

Every page and component lives in its own folder with a fixed set of files:

| File | Purpose |
|---|---|
| `Name.ts` | All TypeScript logic: the `useName()` hook, view-model types and pure helpers. No JSX. |
| `Name.template.tsx` | The JSX only. The component calls `useName()` and renders the result. |
| `Name.spec.ts` | Vitest unit tests for the hook and helpers, plus simple render checks via `createElement`. |
| `Name.css` | Static layout styles imported by the template. MUI `sx` is kept only for theme-dependent values. |
| `index.ts` | Barrel re-exporting the component and hook. |

```
src/
  App/          routes + route helpers
  components/   Layout, EventForm, InfoRow
  pages/        CalendarPage, CreateEventPage, EventPage, RegisterPage
  api/          fetch client + DTO types
  lib/          dates and ics helpers (+ specs)
  test/         Vitest setup, router wrappers, fixtures
```

Run the tests with `npm test` (or `npm run test:watch`) in `client/`.

The full convention is written down in [.claude/rules/frontend.md](.claude/rules/frontend.md) and enforced by `client/src/test/structure.spec.ts`, which fails when a page or component folder is missing a required file, contains stray files, or keeps state in its template.

## Local development

Prerequisites: .NET 10 SDK, Node 24, Docker.

```bash
# 1. database only
docker compose up db

# 2. API (http://localhost:5000, applies migrations on start)
cd server/TabletopEvents.Api
dotnet run

# 3. frontend (http://localhost:5173, proxies /api to :5000)
cd client
npm install
npm run dev
```

### Backend tests

```bash
cd server
dotnet test TabletopEvents.slnx
```

### Backend structure

```
server/TabletopEvents.Api/
  Services/<Name>Service/        HTTP endpoints: <Name>Service.cs + its request validator(s)
  Repositories/<Name>Repository/ I<Name>Repository + EF Core implementation (only layer touching AppDbContext)
  Validation/                    FluentValidationActionFilter (runs validators, returns 400 ProblemDetails)
  Dtos/  Models/  Data/  Migrations/
server/TabletopEvents.Api.Tests/ validator + repository tests (in-memory EF, seeded)
```

Endpoint classes are named `<Name>Service` and marked `[ApiController]`, which is what ASP.NET uses to discover them. Request DTOs are validated with [FluentValidation](https://docs.fluentvalidation.net/); failures return a 400 `ValidationProblemDetails` with `errors` keyed by property name (`Name`, `Format`, `PlayerName`, …). The full convention is in [.claude/rules/backend.md](.claude/rules/backend.md).

### Migrations

```bash
cd server/TabletopEvents.Api
dotnet ef migrations add <Name>
```

Requires the `dotnet-ef` global tool (`dotnet tool install -g dotnet-ef`). Migrations run automatically when the API starts.

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
| POST | `/api/events/{id}/registrations` | `{ playerName }` → 201, or **409** when the event is full |

## Decisions and assumptions

- **Entity Framework**: the spec says EF6; this uses EF Core 10 on .NET 10.
- **Foreign keys** are named as in the spec (`Game`, `Format`) rather than `GameId`/`FormatId`. Entities therefore have no navigation properties; relationships are configured in `AppDbContext` and queries use explicit joins.
- `Event.Name` is a `varchar(255)` (the spec's `uuid` is a typo).
- `Template.DefaultDurationMinutes` was added so templates can fill the end time (EDH 240 min, others 300 min).
- `Event` has no location column; the `.ics` location comes from the `Store:Location` setting.
- `Template` has no game column; the game is derived through its format.
- Capacity is enforced in the API inside a serializable transaction, so concurrent registrations cannot exceed `maxCapacity`.
- Out of scope per the spec: auth, editing/deleting events, creating templates, payments, emails, recurring events.
