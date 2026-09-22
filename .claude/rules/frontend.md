---
paths:
  - "client/**"
---

# Frontend rules (client/)

React 19 + TypeScript (Vite), MUI v9, MUI X Scheduler, react-router-dom, Vitest + Testing Library.

## One folder per page or component

Every page (`src/pages/<Name>/`) and component (`src/components/<Name>/`) is a folder named in PascalCase containing exactly these files. `<Name>` is the component name.

| File | Contains | Must not contain |
|---|---|---|
| `<Name>.ts` | All TypeScript logic: the `use<Name>()` hook, the `<Name>ViewModel` interface, the props interface, exported pure helpers, string constants shown to users | JSX, MUI component imports |
| `<Name>.template.tsx` | Only JSX. One exported component `<Name>` that calls `use<Name>()` (when one exists) and renders the view model | `useState`, `useEffect`, business logic, API calls, string building beyond simple interpolation |
| `<Name>.spec.ts` | Vitest unit tests for the hook and helpers, plus render checks of the template via `createElement` | JSX (it is a `.ts` file) |
| `<Name>.css` | Static layout/spacing styles for this component | Theme colours (use `sx` for those); styles for other components |
| `index.ts` | Barrel: `export { <Name> } from './<Name>.template.tsx'` and the hook/types from `./<Name>.ts` | Anything else |

`<Name>.css` is optional only when the component has no styling of its own (e.g. a pure wrapper). Every other file is required. `src/test/structure.spec.ts` enforces this and fails `npm test` when a folder is missing a file.

React can't load `.html` templates, so `.template.tsx` is the template file. Do not create `.html` files under `src/`.

## Logic file (`<Name>.ts`)

- Hook is named `use<Name>` and returns a `<Name>ViewModel` object. Everything the template needs (state, derived labels, handlers, paths) comes from that object.
- A purely presentational component (props in, JSX out, no state or effects, e.g. `InfoRow`) has no hook; its `.ts` file holds only the `<Name>Props` interface. The moment it needs state, a derived value or an effect, add `use<Name>()`.
- Derive display strings in the hook (`dateLabel`, `playersLabel`, …), not in the template.
- Export pure helpers (`validateEventForm`, `toSchedulerEvents`, `describeLoadError`) so specs test them directly without rendering.
- Async loads follow the `let cancelled = false` pattern in `useEffect` and expose `error: string | null`.
- All HTTP goes through `src/api/client.ts` (`api.*`). DTO types live in `src/api/types.ts` and mirror the API's JSON exactly (FKs are `game` / `format`, not `gameId`).
- Routes and path builders live in `src/App/App.ts` (`routes`, `eventPath()`, `registerPath()`). Never hard-code `/events/...` strings elsewhere.

## Validation: the server owns it

- **No client-side validation.** Forms do not check required fields, lengths, ranges or ordering before submitting. The API's FluentValidation validators are the single source of truth (see `.claude/rules/backend.md`).
- On submit, convert the form to the request exactly as entered: strings as typed (no trimming), blank selects / dates / numbers as `null`. See `toCreateEventRequest` in `EventForm.ts`.
- On a 400, read `ApiError.errors` (keyed by PascalCase property name) and show each message under its field. A hook may **route** an error to a different field for display (e.g. `StartDateTime` → the date input when the date is blank) but never rewrites or invents messages. Errors with an empty key are shown as a general error.
- Templates keep `required` on inputs only for the asterisk; forms are `noValidate` so the browser does not intercept submission.
- Derived UI state that is not validation (auto-filling end time from a template, default start time) stays in the hook.

## Template file (`<Name>.template.tsx`)

- First statement destructures `use<Name>(props)`. No other hooks except trivial `useId`-style helpers.
- Use plain elements with CSS classes (`<div className="event-page__chips">`) for layout; use MUI components for widgets (buttons, inputs, chips, typography).
- MUI v9 has no system props: `<Stack alignItems>` / `<Typography fontWeight>` do not type-check. Put those in the CSS file or, for theme tokens only, in `sx`.
- Import sibling components through their folder barrel: `import { InfoRow } from '../../components/InfoRow'`, never from a `.template.tsx` directly.
- Conditional UI (loading / error / empty) is driven by hook values such as `status` or `event === null`, not by re-deriving conditions in JSX.

## CSS file (`<Name>.css`)

- BEM-style names, block = kebab-case component name: `.event-page`, `.event-page__panel`, `.event-page__qr-code`.
- One block per component; never style another component's classes.
- Responsive tweaks use `@media (max-width: 900px)` blocks in the same file.
- Import once at the top of the template: `import './<Name>.css'`.

## Spec file (`<Name>.spec.ts`)

- Use helpers and fixtures from `src/test/utils.ts` (`renderHookWithRouter`, `renderWithRouter`, `games`, `eventDetail`, …). Add new fixtures there rather than inlining large objects.
- Mock the API with `vi.mock('../../api/client.ts', …)` returning `{ ...actual, api: { … vi.fn() } }` so `ApiError` stays real; get the mock with `vi.mocked(api)`.
- Mock navigation with `vi.mock('react-router-dom', …)` overriding only `useNavigate`.
- Test hooks with `renderHook` + `act` / `waitFor`; assert on the view model, not on DOM internals.
- Render templates with `createElement(Component, props)` and query by role/text from `@testing-library/react`.
- Cover: happy path, that an empty form still submits (no client checks), API error mapping (400 field errors routed to fields, 404, 409), and any derived-value edge cases (e.g. `spotsLeft` never negative).

## Shared code outside components

- `src/lib/<name>.ts` + `<name>.spec.ts` for pure helpers (dates, ics). No React imports.
- `src/api/` for the fetch client and DTO types. `src/theme.ts` for the MUI theme. `src/test/` for test infrastructure only.

## Adding a new page or component

1. Create `src/pages/<Name>/` or `src/components/<Name>/` with the five files above.
2. Write the hook and helpers in `<Name>.ts` first, then the template, then the spec.
3. If it is a page, add its route to `routes` in `src/App/App.ts` and the `<Route>` in `App.template.tsx`.
4. Run `npm test` and `npx tsc -b` in `client/`; both must pass. `structure.spec.ts` will fail if a file is missing.

## Commands (run in `client/`)

```bash
npm run dev        # Vite dev server on :5173, proxies /api to :5000
npm test           # vitest run
npm run test:watch
npx tsc -b         # type-check (also runs in npm run build)
npm run build
```
