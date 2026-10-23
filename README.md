# BuildScope Check

**Evidence-linked comparison of construction proposals, scope responsibilities, change exposure and open questions.**

BuildScope Check explores a practical problem in residential construction: a materials-only kit, an installed fixed-price bid and a cost-plus estimate cannot be compared by their headline totals. The product turns supplied proposals into scope status, responsibility assignments, cited evidence, customer-entered change exposure and prioritized questions for the correct bidder.

> [!WARNING]
> **This is a synthetic research and development prototype, not a production service.** Do not upload confidential, customer or proprietary documents. There is no AI extraction, OCR, durable storage, authentication, payment, entitlement or licensed cost data. Nothing in this repository is a real quote, legal opinion, cost estimate, property report or professional certification.

[![CI](https://github.com/bigtwighomes/BuildScope/actions/workflows/ci.yml/badge.svg)](https://github.com/bigtwighomes/BuildScope/actions/workflows/ci.yml)

## Current experience

The application is one five-step review flow:

| Step | What the customer does                                                                             |
| ---- | -------------------------------------------------------------------------------------------------- |
| 1    | Choose a project type, project name and optional location.                                         |
| 2    | Add two or three text-based PDF proposals, or load the allowlisted synthetic example.              |
| 3    | Review extracted fields and line items, correct mistakes, and inspect rejection reasons.           |
| 4    | Compare scope, responsibilities, costs and unknowns, customer-entered changes, and site questions. |
| 5    | Print or save the evidence-linked report, including limitations and unverified items.              |

Routes:

- `/` - landing page.
- `/analyze` - empty five-step review.
- `/analyze?sample=1` - bundled synthetic example.
- `/demo` - compatibility redirect to `/analyze?sample=1`.
- `POST /api/analyze` - text-PDF analysis.
- `POST /api/analyze/sample` - allowlisted synthetic sample analysis.

## Core capabilities

### Project-aware scope comparison

- Project types: whole-home/new build, materials package or kit, and bathroom renovation.
- Seven explicit statuses: `INCLUDED`, `EXCLUDED`, `NOT_SPECIFIED`, `SEPARATELY_CONTRACTED`, `CONFLICTING`, `UNREADABLE` and `NOT_APPLICABLE`.
- Project-specific scope libraries, plus categories observed in the uploaded documents:
  - whole-home/materials package: 22 areas including survey, permits, demolition, sitework, drainage, foundation, structure, roofing, exterior, windows, plumbing, electrical, HVAC, insulation, drywall, finishes, appliances, utilities, inspections, freight, waste and landscaping;
  - bathroom renovation: 14 areas including demolition, plumbing, electrical, ventilation, drywall, waterproofing, tile, vanity, finishes and inspections.
- Silence is represented as `NOT_SPECIFIED`, never as included or free.
- Filters and source-evidence drilldown.

### Responsibility matrix

Eight roles are tracked separately: `supplies`, `purchases`, `pays`, `installs`, `coordinates`, `delivers`, `unloads` and `warrants`.

Each populated cell carries the responsible party, the source statement and an evidence citation. A missing responsibility remains visible as unknown.

### Evidence contract

Extracted facts, comparison cells and material findings carry a `SourceEvidence` object:

```text
documentId + page + section + lineNumber + quoted span + quality + classification
```

Evidence is preserved when a reviewer corrects a displayed value. Findings that cannot be supported by source text do not receive fabricated evidence.

### Financial reconciliation

Money is parsed and calculated in integer cents. The analysis separates:

- stated proposal totals;
- line-item extensions and allowances;
- expected tax where a rate is stated;
- calculated totals and deltas;
- excluded or separately contracted scope;
- unpriced or unknown conditions.

The synthetic Sagebrush fixture intentionally contains a **$2,500.00** discrepancy between its line-item arithmetic plus tax (`$505,662.40`) and its stated total (`$508,162.40`). The analysis reports the discrepancy instead of silently accepting either total.

### Change review

The Changes view records customer-reported working notes. Additions, credits, baseline amount, percentage fee, fixed fee and schedule impact remain separate. A percentage fee applies only to positive changed work. Unknown fees, financing and indirect impacts stay visible instead of becoming zero. Entries are held only in the current browser session and are not extracted from contract terms.

### Site and project questions

The Site questions view is a sourced checklist, not a screening result. Flood, permits, radon, contractor licence, concealed moisture and bathroom ventilation questions are marked `not_evaluated`, include official source links where available, and state what BuildScope did not check. No address is geocoded and no risk conclusion is asserted.

### Prompt-injection resistance

Instruction-like text inside a PDF is treated as untrusted source content. It can appear in evidence and produce a security finding, but it is never executed or treated as an instruction. The browser suite verifies that fixture markup is rendered as inert text and does not execute.

## How analysis works

```text
PDF upload
   |
   v
Bounded intake
   - streamed request body, 8 MiB request limit
   - up to 3 files, 4 MiB each
   - PDF magic bytes and duplicate SHA-256 detection
   - 40 pages and 500,000 extracted characters per document
   - 20-second extraction timeout
   |
   v
Native text extraction (unpdf / PDF.js, per page)
   |
   v
Typed deterministic parser
   - project and bidder fields
   - pricing basis
   - line items, quantities, amounts and categories
   - allowances, exclusions, specifications, terms and responsibilities
   |
   v
Analysis builder
   - project-aware scope comparison
   - responsibility matrix
   - integer-cent arithmetic
   - evidence-linked findings, change review and screening questions
   |
   v
Five-step workspace
   - review, corrections and rejection reasons
   - comparison views
   - printable report
```

PDF bytes are processed in memory for the lifetime of the request and are not written to disk, a database or a queue. The sample route reads allowlisted PDFs from `fixtures/samples/`. Uploaded analyses use `DOC-*` identifiers; the bundled sample uses `SAMPLE-*` identifiers with synthetic-fixture provenance.

## Technology

| Layer          | Choice                                                              |
| -------------- | ------------------------------------------------------------------- |
| Framework      | Next.js 16.4 App Router, React 19.3                                 |
| Language       | TypeScript 5.9 strict                                               |
| Styling        | CSS with custom properties; no UI framework                         |
| PDF extraction | `unpdf` / PDF.js native text extraction                             |
| Tests          | Vitest 4.1                                                          |
| Browser checks | `playwright-core` against installed Microsoft Edge, plus `axe-core` |
| Quality        | ESLint 9 flat config, Prettier                                      |
| CI             | GitHub Actions on Node.js 24                                        |

## Quick start

Requirements: **Node.js 22.12 or newer** and npm. The repository does not depend on a fixed local drive or installation path.

```bash
git clone https://github.com/bigtwighomes/BuildScope.git
cd BuildScope
npm install
npm run dev
```

Open:

- `http://localhost:3000/` - landing page
- `http://localhost:3000/analyze` - empty five-step review
- `http://localhost:3000/analyze?sample=1` - synthetic example

No environment file is required for the default safe configuration. To customize local settings, copy `.env.example` to `.env.local`. Never commit `.env.local` or real credentials.

## API

### `POST /api/analyze/sample`

Analyzes the allowlisted synthetic fixtures. No request body is required.

### `POST /api/analyze`

Accepts `multipart/form-data`:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "projectType=new_home" \
  -F "files=@tests/fixtures/synthetic/northline-builders-proposal.pdf" \
  -F "files=@tests/fixtures/synthetic/sagebrush-construction-cost-plus.pdf"
```

Responses use `Cache-Control: no-store` and return the raw `Analysis` JSON object. Rejections are represented per document with named codes such as `NO_TEXT`, `ENCRYPTED`, `DUPLICATE`, `NOT_PDF` and `TOO_MANY_PAGES`.

| Status | Meaning                                                    |
| ------ | ---------------------------------------------------------- |
| `200`  | Analysis completed; inspect `documents` and `rejections`   |
| `400`  | Missing files, invalid form data or too many files         |
| `413`  | Declared or streamed request size exceeds the 8 MiB limit  |
| `415`  | Request is not multipart form data                         |
| `500`  | Unexpected server failure; no document content is returned |

The APIs have **no authentication, authorization, origin policy or rate limiting**. Do not expose this lab to the internet or use it with confidential documents.

## Configuration

| Variable                                | Default                 | Purpose                                                                |
| --------------------------------------- | ----------------------- | ---------------------------------------------------------------------- |
| `BUILDSCOPE_APP_URL`                    | `http://localhost:3000` | Server-side application URL; not a secret.                             |
| `BUILDSCOPE_COST_DATA_MODE`             | `OFF`                   | `OFF`, `DEMO` or `LICENSED`. `DEMO` is blocked in production.          |
| `BUILDSCOPE_COST_DATA_LICENSE_APPROVED` | `false`                 | Required before `LICENSED` mode is accepted.                           |
| `BUILDSCOPE_PAYMENT_MODE`               | `disabled`              | `disabled`, `test` or `live`. Live payments require explicit approval. |
| `BUILDSCOPE_LIVE_PAYMENTS_APPROVED`     | `false`                 | Required before live payment mode is accepted.                         |
| `STRIPE_SECRET_KEY`                     | empty                   | Placeholder only; Stripe is not implemented.                           |
| `STRIPE_WEBHOOK_SECRET`                 | empty                   | Placeholder only.                                                      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`    | empty                   | Placeholder only.                                                      |
| `AI_PROVIDER_API_KEY`                   | empty                   | Placeholder only; no AI provider is integrated.                        |

Additional browser-check settings:

| Variable                  | Default                                                  | Purpose                                                             |
| ------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| `BUILDSCOPE_BASE_URL`     | unset; auto-starts production on `http://127.0.0.1:3117` | Use an already-running app instead of auto-starting                 |
| `BUILDSCOPE_SKIP_BUILD`   | unset                                                    | Set to `1` to reuse the existing `.next` build before auto-starting |
| `BUILDSCOPE_BROWSER_PATH` | Windows Edge path                                        | Override the browser executable                                     |

## Verification

Run the complete baseline:

```bash
npm run verify
```

This executes:

```text
prettier --check .
eslint .
tsc --noEmit
vitest run
next build
```

Current local baseline:

- **6 test files, 46 tests passing**
- Production build succeeds for `/`, `/_not-found`, `/demo`, `/analyze`, `/icon.svg`, `/api/analyze` and `/api/analyze/sample`
- **125/125 automated Edge browser checks passing**, including axe WCAG 2.1 A/AA, keyboard focus, tablet/mobile reflow, print PDF generation, upload rejection, corrections, changes, screening questions and the synthetic sample

Run the browser suite:

```powershell
npm run verify:browser
```

The harness builds, starts a production server on port 3117 by default, runs 24 scenarios, writes artifacts to `artifacts/browser-check/`, and stops the server. It targets Windows and installed Microsoft Edge. To test an already-running server:

```powershell
$env:BUILDSCOPE_BASE_URL = "http://127.0.0.1:3000"
npm run verify:browser
```

GitHub Actions runs format checking, lint, typecheck, tests and the production build; it does not run the Edge harness.

### Synthetic fixture ground truth

| Fixture   | Project type        | Pricing basis     | Stated total  | Expected reconciliation                                |
| --------- | ------------------- | ----------------- | ------------- | ------------------------------------------------------ |
| Northline | New home            | Fixed price       | `$486,540.00` | Matches: `$459,000.00` subtotal + 6% tax               |
| Cascade   | New home            | Materials package | `$209,200.00` | Matches stated materials total; tax not stated         |
| Sagebrush | New home            | Cost plus         | `$508,162.40` | Expected `$505,662.40`; discrepancy `$2,500.00`        |
| Willow    | Bathroom renovation | Fixed price       | `$40,957.50`  | Bathroom scope with waterproofing and ventilation      |
| Harbor    | Bathroom renovation | Fixed price       | `$27,700.00`  | Bathroom scope excluding waterproofing and ventilation |

The fixtures also exercise excluded scope, separately contracted work, conflicting specifications, duplicate delivery lines, partial/unreadable pages, image-only PDFs, encrypted PDFs, prompt-injection text and reviewer corrections.

## Project structure

```text
src/
  app/
    page.tsx                  Landing page
    demo/page.tsx             Compatibility redirect to the sample flow
    analyze/page.tsx          Five-step document workspace
    api/analyze/route.ts      Bounded multipart PDF upload API
    api/analyze/sample/route.ts Allowlisted synthetic sample API
    globals.css               Shared responsive and print styles
  components/
    analyze/                  Five-step workspace, panels and report
  lib/
    documents/                Types, PDF extraction, parser, analysis, changes, risks and intake
    config.ts                 Safety-gated configuration
scripts/
  generate-fixtures.mjs       Regenerates synthetic PDF fixtures
  browser-check.mjs           Edge/axe production verification
tests/
  unit/                       Configuration, money change and risk tests
  integration/                PDF intake, analysis and API tests
  fixtures/synthetic/         Synthetic PDFs used by tests
fixtures/samples/             Allowlisted PDFs served by the sample API
docs/
  STATUS.md                   Evidence-backed phase ledger
  NEXT_ACTIONS.md             Authorized next work and approval queue
  REQUIREMENTS_TRACEABILITY.md Requirement-to-evidence map
  DECISIONS.md                Architecture and safety decisions
  DISASTER_RECOVERY.md        Fresh-clone and recovery procedure
  tests/                      Test plan, results and release gates
  research/                   Public-source research and licensing status
```

## Safety boundaries

- **Synthetic data only.** No real customer, supplier or confidential documents.
- **No AI or OCR.** Extraction is deterministic and template-specific.
- **No durable storage.** Uploads are held in memory for the request and discarded; corrections and changes live only in the browser session.
- **Unknown is not zero.** Missing scope, unpriced work, unknown fees and unknown responsibilities remain explicit.
- **No fabricated evidence.** Findings without support do not receive invented citations.
- **No paid cost data.** Cost-data mode defaults to `OFF`; licensed data requires written approval.
- **No live payments.** Payment mode defaults to `disabled`.
- **No live screening.** Site questions are checklist items, not flood, permit or hazard findings.
- **No deployment or production claim.** This repository is not production-ready.

## Known limitations

- The parser is built around the generated synthetic templates; arbitrary vendor PDF layouts are not supported.
- No OCR, image-only PDF support, AI extraction or model-based classification.
- No three-way planning-estimate dataset; known costs and unknown items are separated, but no localized ranges exist.
- Change entries are customer-reported session notes, not extracted or verified change orders.
- Site questions are unverified checklist items with source links; no live data integration exists.
- No authentication, authorization, origin policy, rate limiting, tenant isolation or retention/deletion policy.
- The extraction timeout stops the request wait but cannot synchronously cancel a PDF.js promise that never settles.
- `/analyze?sample=1` and `/api/analyze/sample` depend on `fixtures/samples/` being present in the checkout.
- No server-side PDF generation; reports print through the browser.
- No database, file storage, accounts, entitlements, Stripe, webhooks or secure report delivery.
- Automated browser checks are not a substitute for independent human accessibility or product review.

## Product status

The project is a locally verified synthetic prototype:

- P0 foundation: verified locally.
- P1 research: complete with licensing and REA setup blocked.
- Unified five-step product UX: implemented and locally verified; owner acceptance pending.
- P3 deterministic document lab: implemented and locally verified; full AI/commercial P3 gate remains blocked.
- P4 local change and screening-question support: partial.
- P5-P9: not started, planned or blocked.

The authoritative project brief is [`masterprompt.md`](masterprompt.md). Detailed evidence and limitations are recorded in [`docs/STATUS.md`](docs/STATUS.md) and [`docs/tests/TEST_RESULTS.md`](docs/tests/TEST_RESULTS.md).

## Contributing and security

This is a tightly scoped prototype. Before proposing a change, read [`AGENTS.md`](AGENTS.md) and the relevant decision records. Do not add real documents, credentials, paid cost data, vendor integrations, live payments or production claims without explicit owner approval.

Do not report security vulnerabilities in a public issue. Contact the repository owner privately until a disclosure process exists.

## License

No open-source license is included in this repository. Do not assume permission to copy, redistribute or use the code or fixtures outside this project without the owner's written permission.
