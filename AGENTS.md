# Agent Session Bootstrap

Before any task, read masterprompt.md in full. Treat it as the authoritative requirements, safety gates and acceptance contract. Check actual repository state before proposing changes. Changes to masterprompt.md require explicit owner approval.

## Repository facts

- Product: BuildScope Check.
- Repository root: the current checkout. Do not depend on a fixed local drive or installation path; use paths relative to the checkout.
- GitHub repository: https://github.com/bigtwighomes/BuildScope.
- Authoritative specification: `masterprompt.md` v1.0, research baseline October 20, 2026.
- Recorded master prompt SHA-256 at P0: `B36FAFB37E281E31FCEB565C24E05EA80B9A26A5E03B920D6B277B2ABB28D391`. If the file differs, stop and ask the owner before proceeding.
- Active phase and evidence: `docs/STATUS.md`. Authorized next work: `docs/NEXT_ACTIONS.md`.
- Fresh-clone and recovery procedure: `docs/DISASTER_RECOVERY.md`.
- Stack: Next.js 16 App Router, React 19, TypeScript 5.9 (strict), CSS with custom properties, Vitest, ESLint flat config. See `docs/DECISIONS.md`.

## Non-negotiable safety gates

- Paid cost data is disabled. Craftsman or RSMeans production data may not be activated without written licensing rights and explicit owner approval.
- `BUILDSCOPE_COST_DATA_MODE` defaults to `OFF`. `DEMO` is blocked in production. `LICENSED` requires `BUILDSCOPE_COST_DATA_LICENSE_APPROVED=true` after owner authorization.
- Payments default to `disabled`. Stripe live charging requires explicit owner approval and `BUILDSCOPE_LIVE_PAYMENTS_APPROVED=true`.
- Use synthetic fixtures unless the owner provides explicit permission and handling instructions for real documents.
- Never commit secrets, credentials, customer documents or proprietary cost data. `.env.example` contains placeholders only.
- Routine non-destructive commits and pushes to `bigtwighomes/BuildScope` are authorized as development backups. Do not force-push, rewrite history, deploy, purchase services, change billing, contact vendors or modify external accounts without explicit approval.
- Do not run `npx rea-agents setup` without approval. Do not send the Craftsman licensing inquiry without approval.
- Unknown and unpriced scope is never zero. Do not fabricate costs, provenance, integrations, customers, test results or citations.

## Verification commands

Run the complete baseline before claiming a task is complete:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Run all checks with:

```powershell
npm run verify
```

Run the Windows/Edge production browser suite separately:

```powershell
npm run verify:browser
```

The harness builds and starts a production server unless `BUILDSCOPE_BASE_URL` is set. Record commands, expected/actual results and unverified items in `docs/STATUS.md`, `docs/tests/TEST_RESULTS.md`, `docs/REQUIREMENTS_TRACEABILITY.md` and `docs/NEXT_ACTIONS.md`.

## Conventions

- Use requirement IDs from `masterprompt.md` in tests, reviews and status entries where relevant.
- Keep environment access server-side. Never expose secrets through `NEXT_PUBLIC_*`.
- Prefer server components and small server modules. Add client components only for interaction that requires them.
- Do not create empty architecture merely to match the reference layout; create directories and documents when their phase starts.
- Label work as `PLANNED`, `IMPLEMENTED`, `LOCALLY VERIFIED`, `INTEGRATION VERIFIED`, `PRODUCTION VERIFIED`, `BLOCKED` or `UNVERIFIED`.
- Preserve existing work and Git state. Do not rewrite history.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
