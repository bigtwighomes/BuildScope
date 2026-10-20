# Craftsman Cost-Data Licensing

- **Status:** BLOCKED. No production cost data is enabled. The inquiry is prepared but **not sent**.
- **Master prompt baseline:** v1.0, research baseline October 20, 2026.
- **Independent re-verification in this repository:** API specification re-queried 2026-10-20; consumer pricing and licensing-page text are recorded from the master prompt unless a page is cited below.

## Independently verified API facts (2026-10-20)

Official public API documentation:

- Swagger UI: <https://nec-api.craftsman-book.com/> (`200`, static Swagger page).
- Specification: `https://nec-api.craftsman-book.com/nec-api/v1.0/nec-api.json` (`200`, 19,339 bytes).
- Title/version: `National Estimator Cloud API`, `v1.0`.
- Description: `Programming Interface for Craftsman's National Estimator Cloud Database`.
- Declared servers:
  - Sandbox: `https://nec-api-sandbox.craftsman-book.com`
  - Production: `https://nec-api.craftsman-book.com`
- Authentication: API key in header. Security scheme `ApiKey`, type `apiKey`, name `api-key`, location `header`.
- Documented paths:
  - `GET /AreaMods` — query parameter `postalCode`
  - `GET /Costbooks`
  - `GET /CostCategories/ByCostbook/{costbookId}`
  - `GET /CostCategories/ByParent/{parentId}`
  - `GET /CostData/ByCostCategory/{costCategoryId}`
  - `POST /CostData/ByIds`
- The specification itself does not publish prices, rate limits, redistribution rights, coverage guarantees or update cadence.

These facts confirm the API shape and sandbox/production split. They do **not** grant any data rights and do not establish cost.

## Recorded baseline facts (master prompt, not re-priced here)

These remain recorded from the authoritative master prompt and are not independent quote evidence:

- National Estimator Cloud contractor software is publicly advertised at **$13.99/month** or **$167.88/year**. This is not a redistribution or embedding license for BuildScope.
- The NEC API includes a **free demo-data sandbox** and a **paid production-data license**.
- Craftsman does not publish a standard commercial production API price; a vendor quote is required. Exact price: **UNKNOWN**.
- Reported cost areas include construction, renovation/insurance repair, plumbing/HVAC and electrical; current API scope and costbook IDs require confirmation.
- No per-call, per-report or minimum-commitment figure may be assumed.

Official resources:

- <https://craftsman-book.com/data-licensing>
- <https://intercom.help/craftsman/en/articles/9791025-getting-started-national-estimator-cloud-nec-api>
- <https://nec-api-stage.craftsman-book.com/>
- <https://craftsman-book.com/national-estimator-cloud>
- <https://craftsman-book.com/national-construction-estimator>

## Draft inquiry (prepared, not authorized to send)

> Subject: Commercial API and report-display licensing inquiry — BuildScope Check
>
> Hello Craftsman licensing team,
>
> BuildScope Check is a small U.S. consumer-facing software product that compares homeowner-supplied construction proposals by scope. We are evaluating whether the National Estimator Cloud API could power optional, clearly labeled regional planning ranges with citation and data-period attribution. Our initial report volume is low and would scale only with actual demand.
>
> Before we can design a paid feature, please provide a written quote and terms covering:
>
> 1. Onboarding, minimum annual commitment, subscription/base/seat fees and renewal escalators.
> 2. Per-call, per-project, per-item and per-report pricing; rate limits; overage, caching, sandbox and production keys.
> 3. Exact costbook coverage, update cadence, ZIP/local area factors, supported assembly rates, units and labor/material/equipment fields.
> 4. Written permission to calculate and display derived customer-facing ranges, line items, comparison tables and downloadable PDFs, including required branding or attribution.
> 5. Restrictions on storing, caching, retaining, training models on, exporting, sampling or redistributing raw or derived data, and post-termination obligations.
> 6. Coverage for residential new construction, bathroom remodeling, and specialty systems such as log and SIP walls, plus any excluded areas.
> 7. Use in free previews versus paid results; whether end consumers count as sublicensed users; contractor white-label use; and report recipient limits.
> 8. Price lock, termination, audit rights, liability, service levels, licensing territory and test-data terms.
> 9. A worked sample and the data-quality/area-adjustment methodology.
> 10. Direct contacts for licensing/legal and API support.
>
> Thank you.
>
> Suggested contact: `support@costbook.com`, 1-800-829-8123, or the official licensing form.

## Authorization state

| Item                                         | State                   |
| -------------------------------------------- | ----------------------- |
| Vendor inquiry drafted                       | YES — in this document  |
| Inquiry sent                                 | NO                      |
| Written quote received                       | NO                      |
| License approved by owner                    | NO                      |
| `BUILDSCOPE_COST_DATA_MODE=LICENSED` enabled | NO                      |
| Paid cost data used                          | NO                      |
| Scraping, trial abuse or book copying        | NOT DONE and prohibited |

## Product rule while blocked

The product must continue to work with quote analysis only. `CostReferenceProvider` modes remain OFF by default, DEMO only in development, LICENSED gated by written approval. Locally, `src/lib/config.ts` enforces these gates and is covered by unit tests.

## Traceability

- REQ-300, REQ-301, REQ-302, REQ-303.
- Master prompt sections 7 and 17 step 6.
