# Disaster Recovery

This is a source-only development repository. It has no production deployment, database,
customer documents, paid cost data or payment configuration to recover. GitHub is the
authoritative backup. A fresh clone plus the commands below must be sufficient to rebuild the
verified local project.

## Repository identity

- GitHub: `https://github.com/bigtwighomes/BuildScope`
- Default branch: `main`
- Local checkout: use any owner-selected path. Do not depend on `C:\Build Scope`.
- Authoritative product specification: `masterprompt.md` (tracked, unchanged without owner approval).
- Current development phase: `docs/STATUS.md`.
- Authorized next work: `docs/NEXT_ACTIONS.md`.

## Prerequisites

- Git.
- Node.js `22.12.0` or newer.
- npm.
- Microsoft Edge for the local browser verification harness.
- Network access to GitHub and the npm registry for recovery.

The CI baseline uses Node.js 24 LTS. The local development environment may use a newer Node
release, but record the actual version in `docs/tests/TEST_RESULTS.md`.

## Fresh-clone recovery

Run from a temporary parent directory:

```powershell
git clone https://github.com/bigtwighomes/BuildScope.git BuildScope-recovery
Set-Location BuildScope-recovery
npm ci
npm run verify
```

Then run the browser suite:

```powershell
npm run verify:browser
```

The browser harness builds the app, starts a production server on
`http://127.0.0.1:3117`, runs 24 scenarios, writes artifacts to
`artifacts/browser-check/` and stops the server. It expects installed Microsoft Edge.
Artifacts are ignored by Git.

To test a server that is already running instead:

```powershell
$env:BUILDSCOPE_BASE_URL = "http://127.0.0.1:3000"
npm run verify:browser
```

When `BUILDSCOPE_BASE_URL` is set, the harness does not build or start another server.
Set `BUILDSCOPE_SKIP_BUILD=1` only when intentionally reusing an existing `.next` build
for the auto-start path.

Do not copy `.env`, `.env.local`, `node_modules`, `.next`, generated browser artifacts or
local editor files from the old checkout. They are not recovery assets.

## Safe default configuration

No environment file is required for the safe baseline:

- `BUILDSCOPE_COST_DATA_MODE=OFF`
- `BUILDSCOPE_PAYMENT_MODE=disabled`
- synthetic fixtures only
- no real customer documents
- no AI or OCR provider configured

If a local `.env.local` is restored, inspect it without printing secrets and confirm that it has
not enabled licensed cost data, live payments or any unapproved provider. `.env.example` contains
placeholders only.

## Recovery scenarios

### Lost or damaged local checkout

1. Do not attempt to repair the working copy in place.
2. Clone the remote into a new directory as shown above.
3. Run `npm ci` and `npm run verify`.
4. Compare the recovered HEAD with the last recorded commit in `docs/STATUS.md`.
5. Resume work from `docs/NEXT_ACTIONS.md`.

### Uncommitted work in a damaged checkout

1. Preserve a copy of the directory before any destructive command.
2. From the damaged copy, run `git status --short` and `git diff` and save the output outside
   the checkout if needed.
3. Clone the remote separately.
4. Apply only reviewed local changes to the recovery clone. Never force-push a recovered history.

### Bad local commit not yet pushed

1. Do not rewrite published history.
2. If the commit is local only, create a new corrective commit or ask the owner before any
   history rewrite.
3. If the commit was pushed, revert it with a new commit. Never force-push.

### Secrets accidentally staged

1. Stop before committing or pushing.
2. Remove the secret from the working tree and from the index.
3. Rotate the exposed credential through the owning external service when authorized.
4. Follow the owner's security instructions. Do not print the secret in logs, chat or documentation.

### GitHub unavailable

The local checkout remains usable. Continue only with work that does not require remote CI or a
backup push. Record the outage and retry the authorized backup push later. Do not create a
replacement public repository without owner approval.

### CI failure after a backup push

1. Read the failed workflow log.
2. Reproduce the failing command locally with the repository's Node version.
3. Fix the issue and push a new commit.
4. Never delete the workflow, skip the failing check or force-push to hide the failure.

## What must never be in Git

- Real customer, supplier or confidential construction documents.
- Secrets, API keys, Stripe credentials or downloaded commercial datasets.
- `node_modules`, `.next`, coverage output, browser artifacts or build caches.
- Licensed Craftsman, RSMeans or other proprietary cost data.
- Fabricated test evidence, customer claims or production claims.

`.gitignore` and `.env.example` are part of the recovery contract. Review them after dependency
or configuration changes.

## Backup cadence

- Commit after each verified, coherent change set.
- Push non-destructive commits to `main` as a development backup.
- Confirm GitHub Actions result after each push.
- Record the commit hash, commands, actual results and any unverified items in
  `docs/tests/TEST_RESULTS.md`.
- Do not create a public release, deployment or production tag without explicit owner approval.

## Recovery evidence record

Record each recovery exercise with:

- date and operator;
- source commit and branch;
- new checkout path (without exposing private local data);
- Node and npm versions;
- `npm ci`, `npm run verify` and browser-check results;
- commit hashes before and after;
- anything not verified.

The current recovery exercise is recorded in `docs/tests/TEST_RESULTS.md`.

**Current status (2026-10-22):** the unified five-step revision is committed and pushed at
`4eac0a3`. A fresh clone from `main` passed `npm ci`, `npm run verify` (46 tests) and
`npm run verify:browser` (125/125 checks). GitHub Actions CI run `39885055503` passed on that
commit. The docs-only recovery evidence commit is separate from the verified source commit.

## Known recovery limitations

- There is no production data, database or paid entitlement to restore.
- There is no server-side PDF or secure report delivery.
- The Edge browser harness is Windows-specific; Linux CI verifies static checks, tests and build
  only.
- No legal, privacy, licensing or deployment recovery plan is claimed.
