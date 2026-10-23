# Test Results

## Environment

- Date: 2026-10-22
- OS: Windows (win32)
- Shell: PowerShell 7
- Node.js: v25.6.1 (local; non-LTS)
- npm: 11.9.0
- Project root: repository checkout (local Windows run)
- Repository: https://github.com/bigtwighomes/BuildScope, branch `main`, verified source commit `4eac0a3`
- Working tree: clean in the fresh recovery clone; docs-only recovery evidence was committed separately
- Browser: installed Microsoft Edge
- Master prompt SHA-256: `B36FAFB37E281E31FCEB565C24E05EA80B9A26A5E03B920D6B277B2ABB28D391`

## Current verification (2026-10-22)

Command: `npm run verify`

| Stage          | Actual                                                                                                                                            | Status |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `format:check` | All matched files use Prettier code style                                                                                                         | PASS   |
| `lint`         | ESLint completed with no findings                                                                                                                 | PASS   |
| `typecheck`    | `tsc --noEmit` completed                                                                                                                          | PASS   |
| `test`         | 6 files, 46 tests passed (`config` 8, `documents-money` 6, `documents-changes` 5, `documents-analysis` 11, `analyze-api` 8, `documents-intake` 8) | PASS   |
| `build`        | Next.js 16.4.2 production build; `/`, `/_not-found`, `/demo`, `/icon.svg` static; `/analyze` and both APIs dynamic                                | PASS   |

Browser command: `npm run verify:browser`

The harness builds the application, starts `next start` on `http://127.0.0.1:3117`, runs 24 scenarios, and stops the server.

| Check                    | Actual                                                                                                | Status |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | ------ |
| Full Edge browser suite  | `125/125 checks passed`                                                                               | PASS   |
| Five-step flow           | Project, documents, review, compare and report steps are reachable and gated correctly                | PASS   |
| Landing and legacy route | Landing 200; `/demo` redirects to `/analyze?sample=1`; demo navigation removed                        | PASS   |
| Project setup            | New-home, bathroom and materials-package types persist into the documents step                        | PASS   |
| Sample review            | 3 documents, 32 line items and synthetic provenance visible                                           | PASS   |
| Corrections              | Pricing-basis correction marks the document, logs the change and resets cleanly                       | PASS   |
| Scope comparison         | Project-aware rows, needs-review filter and evidence drilldown work                                   | PASS   |
| Responsibility matrix    | Contractor/owner roles remain populated                                                               | PASS   |
| Costs and unknowns       | `$486,540.00`, `$508,162.40`, `$2,500.00` difference and `Cost data OFF` visible                      | PASS   |
| Changes                  | Two sample changes; new change computes `$930.00`; unknown exposure stays visible; removal works      | PASS   |
| Site questions           | Sourced cards remain `Not evaluated`; sample location carried; external links use `noreferrer`        | PASS   |
| Questions                | Copy-question feedback is announced and clipboard content is populated                                | PASS   |
| Prompt-injection markup  | Fixture `<script>` text is present as inert text; `window.__buildscopeInjected` remains unset         | PASS   |
| Report                   | Eight sections, inline evidence, print CSS, `artifacts/browser-check/report-print.pdf` (about 360 KB) | PASS   |
| Start over               | Clears documents, returns to step 1 and restores safe defaults                                        | PASS   |
| Upload rejection         | Image-only and encrypted files show named rejection reasons; sample reloads                           | PASS   |
| Bathroom fixtures        | Waterproofing and ventilation compare; no sitework row; Willow `$40,957.50`; Harbor `$27,700.00`      | PASS   |
| Materials package        | Type persists to the documents step                                                                   | PASS   |
| Security headers         | nosniff, frame denial, no-referrer and CSP framing/object restrictions present                        | PASS   |
| Streamed request limit   | Oversized browser upload returns 413                                                                  | PASS   |
| Keyboard                 | Visible 3px focus outline; sidebar tab order reachable                                                | PASS   |
| Tablet/mobile            | No page-level horizontal overflow; responsive scope cards replace the wide table                      | PASS   |
| axe WCAG 2.1 A/AA        | No violations on landing, review, all six compare views, report, tablet or mobile                     | PASS   |
| Console and page errors  | No unexpected console errors or uncaught page errors                                                  | PASS   |

Artifacts are gitignored under `artifacts/browser-check/`; `results.json` records the complete check list. The expected 413 response is excluded from the console-error check because the oversized-upload test intentionally triggers it.

## Test inventory

| File                                           | Tests | Focus                                                                                        |
| ---------------------------------------------- | ----: | -------------------------------------------------------------------------------------------- |
| `tests/unit/config.test.ts`                    |     8 | Cost-data and payment gates, production restrictions, secret-safe output                     |
| `tests/unit/documents-money.test.ts`           |     6 | Integer-cent parsing, formatting and unsafe input                                            |
| `tests/unit/documents-changes.test.ts`         |     5 | Change arithmetic, unknown exposure, project-specific scope, screening statuses              |
| `tests/integration/documents-analysis.test.ts` |    11 | Sample ground truth, evidence integrity, findings, corrections and prompt-injection handling |
| `tests/integration/analyze-api.test.ts`        |     8 | Sample/upload API behavior, provenance, rejection responses and request-size errors          |
| `tests/integration/documents-intake.test.ts`   |     8 | Bathroom extraction, PDF validation, limits, partial PDFs, duplicate/empty/non-PDF rejection |

## Ground-truth verification

| Check                            | Actual                                                                                                | Status |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- | ------ |
| Northline arithmetic             | Subtotal `$459,000.00`; 6% tax `$27,540.00`; total `$486,540.00`; matches stated                      | PASS   |
| Cascade arithmetic               | 8 lines; materials total `$209,200.00`; tax unreported; matches stated                                | PASS   |
| Sagebrush arithmetic             | Expected `$505,662.40`; stated `$508,162.40`; discrepancy `$2,500.00`                                 | PASS   |
| Ambiguous tax treatment          | Unknown tax inclusion yields `insufficient_data` and no fabricated expected total                     | PASS   |
| Willow bathroom                  | Stated total `$40,957.50`; waterproofing and ventilation included; bathroom scope only                | PASS   |
| Harbor bathroom                  | Stated total `$27,700.00`; waterproofing and ventilation excluded; no sitework row                    | PASS   |
| Comparison statuses              | Expected status cells match fixture ground truth, including conflicts and separately contracted scope | PASS   |
| Evidence coordinates             | Every cited document/page/line/span resolves; silent cells carry no evidence                          | PASS   |
| Prompt injection                 | 2 security findings; instruction text retained as evidence; no execution or prompt leakage            | PASS   |
| Image-only and encrypted PDFs    | Zero accepted documents; `NO_TEXT` and `ENCRYPTED` rejections visible in review                       | PASS   |
| Partial PDF                      | Page 1 retained; pages 2-3 marked unreadable; affected roofing scope `UNREADABLE`                     | PASS   |
| Duplicate/empty/non-PDF/oversize | Rejected with `DUPLICATE`, `EMPTY_FILE`, `NOT_PDF`, `FILE_TOO_LARGE`                                  | PASS   |
| Corrected total                  | Recalculates to match and removes arithmetic finding; original remains unchanged                      | PASS   |
| Line-category correction         | Updates comparison cell and records reviewer audit entry; original category preserved                 | PASS   |

## API and security verification

| Check                       | Actual                                                                                     | Status |
| --------------------------- | ------------------------------------------------------------------------------------------ | ------ |
| `POST /api/analyze/sample`  | HTTP 200; 3 documents; 21 findings; 20 with evidence; 32 line items; `SAMPLE-*` provenance | PASS   |
| `POST /api/analyze`         | HTTP 200 raw analysis; sanitized file name; `DOC-*` ID; `no-store`                         | PASS   |
| Analysis IDs                | Upload `DOC-*`; sample `SAMPLE-*`; empty `DOC-EMPTY` / `SAMPLE-EMPTY`                      | PASS   |
| Declared oversize request   | HTTP 413 with sanitized message                                                            | PASS   |
| Streamed oversize request   | Browser multipart request stopped at 8 MiB and returns HTTP 413                            | PASS   |
| Unsupported content type    | HTTP 415 JSON                                                                              | PASS   |
| Missing/too many files      | HTTP 400 JSON                                                                              | PASS   |
| Rejection reasons in review | Named reasons render when no document passes validation                                    | PASS   |
| Security headers            | nosniff, `DENY` framing, no-referrer, permissions policy, COOP, CORP and CSP restrictions  | PASS   |
| Cache-Control               | `no-store` on analysis responses                                                           | PASS   |
| Secrets                     | No server secret is exposed through `NEXT_PUBLIC_*`; `.env.example` contains placeholders  | PASS   |

## Fresh-clone recovery (2026-10-22)

Recovery source: `main` at `4eac0a3`; fresh clone in a temporary directory under `%TEMP%`; no local files copied.

| Check                    | Actual                                                                                                      | Status |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- | ------ |
| Clone                    | `git clone https://github.com/bigtwighomes/BuildScope.git`; HEAD `4eac0a3`; working tree clean              | PASS   |
| Master prompt            | SHA-256 `B36FAFB37E281E31FCEB565C24E05EA80B9A26A5E03B920D6B277B2ABB28D391`                                  | PASS   |
| Environment              | Node.js v25.6.1; npm 11.9.0                                                                                 | PASS   |
| `npm ci`                 | 390 packages installed; 5 high-severity development-toolchain advisories remain                             | PASS   |
| `npm run verify`         | Format, lint, typecheck, 6 files / 46 tests and production build passed                                     | PASS   |
| `npm run verify:browser` | 125/125 Edge checks passed; print artifact 370,673 bytes                                                    | PASS   |
| Build warning            | Next.js emitted a non-fatal Turbopack root warning because the temporary clone was under the home directory | NOTED  |
| GitHub Actions           | CI run `39885055503` passed on `4eac0a3`                                                                    | PASS   |

The recovery clone proves the committed source, fixtures and commands are sufficient to rebuild and verify the synthetic application. It does not verify deployment, production data, real documents, AI extraction, licensed cost data or payments.

## Historical baseline (2026-10-20)

The original P0-P3 baseline on HEAD `8398425` recorded:

- `npm run verify` passed with 6 test files / 51 tests and a production build.
- `npm run verify:browser` passed 84/84 checks against the P2 demo plus P3 lab.
- GitHub Actions CI run `39514595890` passed format, lint, typecheck, tests and production build on Ubuntu/Node 24.
- Initial publication workflow `39514336718` passed on commit `c05924b`.
- Master prompt SHA-256 remained `B36FAFB37E281E31FCEB565C24E05EA80B9A26A5E03B920D6B277B2ABB28D391`.

The 2026-10-22 unified five-step revision replaced the separate P2 demo source, added project-specific scope, change reviews and screening questions, and moved tests/browser checks to the current counts above. The historical results remain evidence for the earlier commit, not the current source commit.

## P1 public endpoint reachability (2026-10-20)

| Check                              | Command / endpoint                                             | Actual                                                         | Status          |
| ---------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | --------------- |
| Census structured-address geocoder | `locations/onelineaddress` with `benchmark=Public_AR_Current`  | HTTP `200`; coordinates and ZIP components returned            | PASS            |
| FEMA NFHL service metadata         | `NFHL/MapServer?f=json` via `curl.exe`                         | HTTP `200`; `currentVersion 11.1`; layer 28 Flood Hazard Zones | PASS            |
| FEMA NFHL point query              | Layer 28, `inSR=4326`, `returnGeometry=false`                  | HTTP `200`; `FLD_ZONE: X` with levee note                      | PASS            |
| USGS EPQS                          | `/v1/json?x=-122.4194&y=37.7749&wkid=4326&units=Feet`          | HTTP `200`; elevation `54.1719` ft                             | PASS            |
| USGS EPQS documentation            | `https://epqs.nationalmap.gov/v1/docs`                         | HTTP `500` earlier in P1                                       | FAIL / recorded |
| Craftsman NEC API specification    | `https://nec-api.craftsman-book.com/nec-api/v1.0/nec-api.json` | HTTP `200`; 19,339 bytes; six documented paths                 | PASS            |

Reachability does not mean terms, rate limits or commercial use are verified. No adapter was built and no provider data was stored or redistributed.

## Not executed / unverified

- Edge browser harness in GitHub Actions. It remains a local Windows check.
- Deployment, hosting or production behavior.
- Screen-reader behavior with assistive technology; automated axe checks do not prove screen-reader usability.
- Independent human product and accessibility review.
- AI extraction, OCR, arbitrary-vendor PDF accuracy, approved extraction corpus and prompt-injection variants beyond the synthetic fixtures.
- Authentication, authorization, tenant isolation, origin policy, rate limiting and retention/deletion.
- Stripe, webhooks, entitlements, secure downloads and server-side PDF.
- Deployment packaging for the `fixtures/samples/` sample route.
- Live public-data adapters, caches, contract tests or fallbacks.
- Paid cost-data modes, providers or licenses.
- Real customer document processing.
- Competitor functionality under identical inputs (this is not a benchmark).

## Known issues

- Full `npm audit` was not rerun for this revision; the prior development-only `braces` advisory remains recorded and production dependencies were clean.
- ESLint 9.39.5 is deprecated; retained because `eslint-plugin-react` peer support stops at ESLint 9.
- The local Node v25.6.1 is outside REA's documented support list, so REA setup is deferred.
- The PDF extraction timeout stops the wait and destroys the document once available, but cannot synchronously cancel a `getDocumentProxy` promise that never settles.
- The parser is template-specific; no arbitrary-vendor extraction accuracy is claimed.
- Changes and screening questions are local/session-only and remain unverified.
- The sample route depends on `fixtures/samples/` being present next to the running server.
