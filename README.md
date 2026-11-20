# Task Assignment Dashboard

A Nuxt 4 dashboard that shows and compares the two optimization variants (**minimum total cost** and **minimum makespan**) computed by the Laravel backend (`bjr-api`). The optimization logic isn't reimplemented here: the frontend only displays results and derives table, chart and comparison data from them.

## Running it

Requires Node `^22.21` or `^24.11` (Nuxt 4.6).

### With Docker

The `docker-compose.yml` lives in the backend repo (`bjr-api`) and starts the backend, Redis and this app together. Clone both repos side by side:

```bash
git clone https://github.com/tempnamebcr/bjr-api.git
git clone https://github.com/tempnamebcr/bjr-front.git
cd bjr-api
docker compose up --build        # → http://localhost:3000
```

### Locally

```bash
npm ci
NUXT_BACKEND_URL=http://localhost:8000 npm run dev   # backend running (php artisan serve)
NUXT_USE_MOCK=true npm run dev                       # no backend needed
```

On Windows PowerShell, set variables first: `$env:NUXT_USE_MOCK='true'; npm run dev`.

| Env | Default | Purpose |
|---|---|---|
| `NUXT_BACKEND_URL` | `http://localhost:8000` | Laravel base URL. Only the Nuxt server uses it; the browser never sees it |
| `NUXT_USE_MOCK` | `false` | `true` serves `server/mock/mock-results.json` instead of calling the backend |

### Scripts

| Command | |
|---|---|
| `npm run dev` / `build` / `preview` | Nuxt dev server, production build, preview |
| `npm test` | Vitest (pure functions and composables) |
| `npm run typecheck` | `vue-tsc` over the whole app (TS strict) |

## What's on the page

| Brief requirement | Where |
|---|---|
| Configurable backend URL + mock mode | `nuxt.config.ts` (server-only `runtimeConfig`), `server/utils/assignment-source.ts` |
| Loading via `useFetch`, loading/error states, backend unreachable | `composables/useAssignments.ts`, `LoadingState`, `ErrorState` (502 → "The assignment service could not be reached…" + retry) |
| Variant switcher | `VariantTabs`, persisted in the URL (`?variant=makespan`) |
| Summary cards (price, makespan, tasks, employees with work) | `SummaryCards`, plus the lower bound / "proven optimal" |
| Assignments table + employee filter | `AssignmentsTable` (with filtered totals), `EmployeeFilter` |
| Workload bars relative to the makespan; critical highlighted, idle muted | `WorkloadChart` |
| Infeasible state with the unassignable task ids | `InfeasibleNotice` (replaces table and charts) |
| *Nice to have:* shared API types | `shared/types/assignment.ts` + runtime guard |
| *Nice to have:* side-by-side comparison | `VariantComparison` ("finishing 40 h earlier costs 7,590.00 more") |
| *Nice to have:* Gantt timeline | `GanttTimeline` (blocks coloured by required skill) |
| *Nice to have:* edit/upload JSON and re-run | `DatasetEditor` → `POST /api/assignments` |
| *Nice to have:* Vitest | `test/` (join, task cost, workload, timeline, comparison, guards, …) |
| *Nice to have:* docker-compose | `../bjr-api/docker-compose.yml` |

## Architecture

```
Browser ──▶ Nuxt server routes (/api/assignments) ──▶ Laravel (/api/v1/assignments)
                │                                       or server/mock/mock-results.json
                ▼
  shared/types (contract) + isAssignmentResponse (runtime guard)
                │
  pages/index.vue ── useAssignments (useFetch)
                  ── useVariantView ── app/utils/assignment.ts (pure: join, totals, workload, timeline, comparison)
                  ── components (props in, markup out; no derivation in templates)
```

**The browser never calls Laravel.**
- `runtimeConfig` holds only server-side keys. The built client bundle contains no backend URL.
- `server/utils/backend.ts` is the single place that calls Laravel. It uses a 10 s timeout.
- When Laravel returns an error (for example a 422 with field errors), the route passes it through unchanged.
- When Laravel doesn't answer at all, the route returns a 502 with a readable message.

**One source of validation.**
- The Nuxt server forwards POST bodies as they are.
- The dataset editor only checks JSON syntax in the browser.
- Field rules live in Laravel. Its 422 errors are shown per field, for example "tasks.0.estimation: … must be greater than 0".

**Keeping the contract in sync** (the repos are separate, so types can't be imported across them):
1. `server/mock/mock-results.json` is real backend output, not hand-written:
   ```bash
   php ../bjr-api/artisan assignment:solve --json > server/mock/mock-results.json
   ```
2. A Vitest test checks that file against the runtime guard.
3. The Nuxt server rejects a backend response that fails the guard (502), instead of rendering malformed data.

**Derived data stays out of templates.**
- Every join, total, filter, percentage and position is a pure function in `app/utils/` and is unit-tested.
- `useVariantView` wraps them in `computed()` for the selected variant and filter.
- Components only receive values and format them.

## Decisions worth knowing

- **Bar and block sizes use inline `style`.** Styling is Tailwind-only, but Tailwind generates classes at build time, and a width like `90.9%` comes from data at runtime. A `style` binding is the standard approach for data-driven sizes.
- **Fixed `en-US` number formatting.** Server and client must format numbers identically, or hydration mismatches. Prices have no currency symbol because the brief defines none.
- **Both variants are fetched once.** Switching tabs and the comparison need no further requests.
- **Custom results replace the sample** (`shown = custom ?? sample`) until "Reset to sample data", so every view works for uploaded data without duplicating anything.
- **The employee filter lists only employees with work** in the current variant. It resets when the variant or the dataset changes.

## Tests

```bash
npm test
```

There are 62 tests, run with plain Vitest (no Nuxt runtime needed):
- **Data join and task costs.** Per-row costs must add up to the backend's `totalPrice` on the sample data.
- **Filtering and totals.**
- **Workload.** Percentages, critical employees (3, 4 and 8 on the sample makespan) and idle employees.
- **Timeline.** Blocks run back to back and the last one ends at the employee's load.
- **Axis ticks and the comparison deltas.**
- **The contract guard, run against the generated mock.**
- **Query parsing, formatting and error messages.** The error messages include Laravel's 422 field errors in the exact shape the browser receives them.

## Known limitations

- **In mock mode, re-running a custom dataset returns the sample results.** The mock can't solve anything.
- **There are no browser end-to-end tests.** Server rendering and the data paths are covered, but clicks (tabs, filter, editor) aren't automated. Playwright would be the next step.
- **On Windows, run Vitest from an uppercase `C:\…` working directory.** With a lowercase `c:\…` path, Vite loads Vitest twice and every suite fails at `describe()`.
