# Repository Guidelines

## Project Structure & Module Organization

SkyCrypt is a SvelteKit 2 application built with TypeScript and Svelte 5. Application code lives in `src/`: reusable UI belongs in `lib/components`, structural composition in `lib/layouts`, domain features in `lib/sections`, utilities and API clients in `lib/shared`, server-only code in `lib/server`, and reactive contexts in `context`. Routes live in `src/routes`, while static assets belong in `static/`. Colocate tests with implementation files; place shared test helpers in `src/test-utils`.

Follow the `components -> layouts -> sections` layering. Initialize global contexts in `src/routes/+layout.svelte`. Do not edit Orval-generated API files manually; regenerate them with the configured generator.

## Build, Test, and Development Commands

Use Node 24 and pnpm 11; other package managers are unsupported.

- `pnpm dev`: start the Vite development server.
- `pnpm build`: create a production build.
- `pnpm preview`: serve the production build locally.
- `pnpm check`: run Svelte and TypeScript diagnostics.
- `pnpm lint`: run Prettier, ESLint, and correctness checks.
- `pnpm test`: run Vitest once.
- `pnpm test:coverage`: run tests with V8 coverage.
- `pnpm test:e2e`: run Playwright end-to-end tests.
- `pnpm format`: apply repository formatting.

## Coding Style & Naming Conventions

Prettier enforces two-space indentation, double quotes, no trailing commas, and ordered Tailwind classes. Keep TypeScript strict and prefer aliases such as `$lib`, `$ctx`, and `$types`. Use Svelte 5 runes (`$state`, `$derived`, `$props`) and snippets instead of legacy reactive declarations, `export let`, or slots. Name Svelte components in PascalCase, utilities in camelCase, and route files using SvelteKit conventions. Prefer Tailwind v4 utilities and the shared `cn()` helper.

## Testing Guidelines

Write focused Vitest tests beside the code. Use `*.spec.ts` for Node tests and `*.svelte.spec.ts` for browser/component tests. Add regression coverage for behavior changes and use Playwright for complete user flows. Run `pnpm lint` and relevant tests before submitting changes.

## Commit & Pull Request Guidelines

Use Conventional Commits, for example `feat(newsroom): add post filters` or `fix(theme): preserve contrast`. Keep commits scoped and intentional. Pull requests should explain the problem and solution, link relevant issues, list verification commands, and include before/after screenshots for visible UI changes. Add a changeset for user-facing release changes when appropriate.

## Configuration & Security

Copy `.env.example` for local configuration and never commit secrets. Keep credentials in server-only modules; expose client values only when intentionally configured as public.
