# Test Results

## Environment

- Date: 2026-10-20
- OS: Windows (win32)
- Shell: PowerShell 7 / `curl.exe` for FEMA TLS
- Node.js: v25.6.1 (local; non-LTS)
- npm: 11.9.0
- Project root: repository checkout (local Windows run)
- Repository: local Git, branch `main`, no commits, no remote
- Master prompt SHA-256: `B36FAFB37E281E31FCEB565C24E05EA80B9A26A5E03B920D6B277B2ABB28D391`

## Final P0-P3 verification (2026-10-20)

Command: `npm run verify`

| Stage          | Actual                                                                                                                                         | Status |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `format:check` | All matched files use Prettier code style                                                                                                      | PASS   |
| `lint`         | ESLint completed with no findings                                                                                                              | PASS   |
| `typecheck`    | `tsc --noEmit` completed                                                                                                                       | PASS   |
| `test`         | 6 files, 51 tests passed (`config` 8, `documents-money` 6, `demo-analysis` 11, `documents-analysis` 11, `analyze-api` 8, `documents-intake` 7) | PASS   |
| `build`        | Next.js 16.4.2 production build; `/`, `/_not-found`, `/demo`, `/icon.svg` static; `/analyze` and both APIs dynamic                             | PASS   |

Static production server smoke test (`npm start`, port 3000):

| Check                            | Actual                                                                       | Status |
| -------------------------------- | ---------------------------------------------------------------------------- | ------ |
| `/` responds                     | HTTP `200`                                                                   | PASS   |
| `/demo` responds                 | HTTP `200`                                                                   | PASS   |
| `/analyze` responds              | HTTP `200`, 103,436 bytes                                                    | PASS   |
| Analyze sample renders           | Sample workspace present                                                     | PASS   |
| `POST /api/analyze/sample`       | HTTP `200`; 3 docs, 21 findings, 131 evidence refs, 17 rows                  | PASS   |
| `POST /api/analyze` (3 fixtures) | HTTP `200`, 94,957-byte analysis JSON                                        | PASS   |
| `Cache-Control` on analysis APIs | `no-store`                                                                   | PASS   |
| Master prompt SHA-256            | `B36FAFB37E281E31FCEB565C24E05EA80B9A26A5E03B920D6B277B2ABB28D391` unchanged | PASS   |

## P3 ground-truth verification

| Check                                   | Actual                                                                                        | Status |
| --------------------------------------- | --------------------------------------------------------------------------------------------- | ------ |
| Northline arithmetic                    | Subtotal `$459,000.00`; 6% tax `$27,540.00`; total `$486,540.00`; matches stated              | PASS   |
| Cascade arithmetic                      | 8 lines; materials total `$209,200.00`; tax unreported; matches stated                        | PASS   |
| Sagebrush arithmetic                    | Expected `$505,662.40`; stated `$508,162.40`; discrepancy `$2,500.00`                         | PASS   |
| Comparison statuses (51 cells)          | All match fixture ground truth, including base/spec conflicts and separately contracted scope | PASS   |
| Evidence coordinates                    | Every cited document/page/line/span resolves; silent cells carry no evidence                  | PASS   |
| Prompt injection                        | 2 security findings; instruction text retained as evidence; no execution or prompt leakage    | PASS   |
| Image-only and encrypted PDFs           | Zero accepted documents and findings; `NO_TEXT` / `ENCRYPTED` rejections                      | PASS   |
| Partial PDF                             | Page 1 retained; pages 2-3 marked unreadable; affected roofing scope `UNREADABLE`             | PASS   |
| Duplicate/empty/non-PDF/oversized files | Rejected with `DUPLICATE`, `EMPTY_FILE`, `NOT_PDF`, `FILE_TOO_LARGE`                          | PASS   |
| Corrected total                         | Recalculates to match and removes arithmetic finding; original remains unchanged              | PASS   |
| Line-category correction                | Updates comparison cell and records reviewer audit entry, original category preserved         | PASS   |

## Browser, accessibility and print verification (2026-10-20)

Command:

```powershell
$env:BUILDSCOPE_BASE_URL = "http://127.0.0.1:3000"
npm run verify:browser
```

| Check                               | Actual                                                            | Status |
| ----------------------------------- | ----------------------------------------------------------------- | ------ |
| Full P2/P3 Edge suite               | `84/84 checks passed`                                             | PASS   |
| axe WCAG 2.1 A/AA                   | No violations on landing, demo or analyze at tested widths        | PASS   |
| Keyboard                            | Visible focus outline; next nav item reachable                    | PASS   |
| Desktop / tablet / mobile           | No page-level horizontal overflow; scope cards reflow             | PASS   |
| P2 print PDF                        | `artifacts/browser-check/report-print.pdf`, 89,465 bytes          | PASS   |
| P3 print PDF                        | `artifacts/browser-check/analyze-report-print.pdf`, 353,696 bytes | PASS   |
| P3 sample and navigation            | 3 documents, 7 sections, 17 scope rows                            | PASS   |
| P3 corrections and reset            | Correction tag/audit log; reset removes correction                | PASS   |
| P3 filters, evidence, copy question | Filtered rows, evidence drilldown and clipboard verified          | PASS   |
| P3 upload rejections                | Image-only and encrypted files rejected; sample reloads           | PASS   |
| Prompt-injection markup             | Escaped; no injected global or script execution                   | PASS   |
| Browser console / uncaught errors   | None recorded                                                     | PASS   |

Artifacts are gitignored under `artifacts/browser-check/`; `results.json` records the check list. Automated browser checks do not replace owner acceptance or independent human accessibility review.

## P1 public endpoint reachability (2026-10-20)

| Check                              | Command / endpoint                                             | Actual                                                         | Status          |
| ---------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | --------------- |
| Census structured-address geocoder | `locations/onelineaddress` with `benchmark=Public_AR_Current`  | HTTP `200`; coordinates and ZIP components returned            | PASS            |
| FEMA NFHL service metadata         | `NFHL/MapServer?f=json` via `curl.exe`                         | HTTP `200`; `currentVersion 11.1`; layer 28 Flood Hazard Zones | PASS            |
| FEMA NFHL point query              | Layer 28, `inSR=4326`, `returnGeometry=false`                  | HTTP `200`; `FLD_ZONE: X` with levee note                      | PASS            |
| USGS EPQS                          | `/v1/json?x=-122.4194&y=37.7749&wkid=4326&units=Feet`          | HTTP `200`; elevation `54.1719` ft                             | PASS            |
| USGS EPQS documentation            | `https://epqs.nationalmap.gov/v1/docs`                         | HTTP `500` earlier in P1                                       | FAIL / recorded |
| Craftsman NEC API specification    | `https://nec-api.craftsman-book.com/nec-api/v1.0/nec-api.json` | HTTP `200`; 19,339 bytes; six documented paths                 | PASS            |

Notes:

- PowerShell `Invoke-WebRequest` could not establish TLS with `hazards.fema.gov` in this environment; `curl.exe` succeeded with identical output. This is an environment/network observation, not a FEMA outage claim.
- Reachability does not mean terms, rate limits or commercial use are verified. No adapter was built.
- No provider data was stored or redistributed.

## P2 unit test mapping

| ID      | Requirement      | Result |
| ------- | ---------------- | ------ |
| T-P2-01 | REQ-105, REQ-210 | PASS   |
| T-P2-02 | REQ-105          | PASS   |
| T-P2-03 | REQ-102          | PASS   |
| T-P2-04 | REQ-103          | PASS   |
| T-P2-05 | REQ-500          | PASS   |
| T-P2-06 | REQ-210          | PASS   |
| T-P2-07 | REQ-212          | PASS   |
| T-P2-08 | REQ-212          | PASS   |
| T-P2-09 | REQ-500          | PASS   |

## P0 historical results

- `npm install --no-audit --no-fund`: dependencies installed; ESLint 9.39.5 deprecation warning noted.
- `npm run verify` passed at P0 with 8 tests and a two-route build.
- `npm audit --omit=dev`: 0 vulnerabilities.
- `npm audit` (all): 5 high-severity `braces` advisories in the development lint toolchain; no non-breaking fix applied.
- `Get-FileHash -Algorithm SHA256 masterprompt.md`: hash unchanged.

## Not executed / unverified

- GitHub Actions CI (no remote).
- Node.js 24 and CI Linux behavior.
- Screen-reader behavior with assistive technology; automated axe checks do not prove screen-reader usability.
- Independent human product and accessibility review.
- AI extraction, OCR, arbitrary-vendor PDF accuracy, approved extraction corpus, prompt-injection variants beyond the synthetic fixtures.
- Authentication, authorization, tenant isolation, rate limiting, streaming request-body enforcement and retention/deletion.
- Stripe, webhooks, entitlements, secure downloads, server-side PDF.
- Deployment packaging for the fixture-backed sample route.
- Any live public-data adapter, cache, contract test or fallback.
- Any paid cost-data mode, provider or license.
- Any real customer document processing.
- Competitor functionality under identical inputs (this is not a benchmark).

## Known issues

- Full `npm audit` is not clean for development-only tooling (`braces` via `eslint-config-next`). Production dependencies are clean. The proposed `npm audit fix --force` downgrade was not applied.
- ESLint 9.39.5 is deprecated; retained because `eslint-plugin-react` peer support stops at ESLint 9.
- The local Node v25.6.1 is outside REA's documented support list, so REA setup is deferred.
- `POST /api/analyze` enforces the 8 MiB request limit after multipart parsing; no streaming/proxy limit has been verified.
- The PDF extraction timeout stops the wait but does not synchronously cancel PDF.js work.
- The sample route depends on `tests/fixtures/synthetic` being present next to the running server.
