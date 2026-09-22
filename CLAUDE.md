# Tabletop Game Events

Event calendar + registration app for a game store. Spec: `SPECS.md`. Run instructions and design decisions: `README.md`.

- `client/` – React 19 + TypeScript (Vite), MUI v9. **Follow `.claude/rules/frontend.md`** for structure (one folder per page/component with `.ts`, `.template.tsx`, `.spec.ts`, `.css`, `index.ts`).
- `server/` – .NET 10 Web API, EF Core 10, Npgsql, FluentValidation, xUnit. **Follow `.claude/rules/backend.md`.** In short: HTTP endpoints are `Services/<Name>Service/<Name>Service.cs` (`[ApiController]` classes, not `*Controller`) with their request validators beside them; all EF Core access lives in `Repositories/<Name>Repository/` behind `I<Name>Repository` interfaces; FK properties are named `Game` / `Format` as in `SPECS.md` with no navigation properties. Validators and repositories each have tests in `TabletopEvents.Api.Tests/`.
- Postgres 16 via `docker-compose.yml`. The API applies migrations + seed data on startup.

**Validation lives only in the API** (FluentValidation, nullable request DTOs). The client never validates; it submits what was typed and displays the server's property-keyed errors.

## Verify before finishing

- Client: `cd client && npm test && npx tsc -b`
- Server: `cd server && dotnet test TabletopEvents.slnx`
- Full stack: `docker compose up --build` then check http://localhost:3000
