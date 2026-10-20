# Pricing and Unit Economics

- **Phase:** P1 (REQ-011, REQ-610).
- **Rule:** no invented costs, no implied profitability, no claims that any price is validated. Competitor prices below are public claims retrieved 2026-10-20 and are informational only.
- **Status:** hypothesis. No production pricing, checkout or payment method is active.

## Observed public pricing (informational, not tested)

| Product                     | Public price points                                                                                                                      | Model                         | Source label                           |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------- |
| RemodelerIQ                 | Free tier; $19.99 every 6 months per remodel; $99.99 one-time Home Pass                                                                  | Freemium subscription         | `PUBLIC CLAIM`                         |
| EstimateHawk                | Free check; $9 single report; $39 Project Pass; $99/month Professional; $149 done-for-you; API credits (10/$150, 100/$1,200, 500/$4,500) | Freemium + subscription + API | `PUBLIC CLAIM`                         |
| BidCompare AI / GreatBuildz | Free for homeowners; contractors pay placement fees                                                                                      | Lead generation               | `VERIFIED` (model), no price published |

These prices do not establish BuildScope's willingness-to-pay, cost structure or viable price. They are context only.

## BuildScope pricing hypothesis (master prompt, not activated)

- **Core one-time report:** test **$49–$79**. No subscription requirement for homeowners.
- **Optional future licensed-cost-data report:** test **$99–$149**, only if a written cost-data license supports the margin and report-display rights.
- **No production pricing switch** without explicit owner approval (`BUILDSCOPE_PAYMENT_MODE` defaults to `disabled`; live requires `BUILDSCOPE_LIVE_PAYMENTS_APPROVED=true`).

All prices are hypotheses to be tested with 5–10 legitimate paid or binding pilot indications before expanding the roadmap (REQ-011).

## Cost categories that must be measured (REQ-610)

| Category                      | Status  | Notes                                                                       |
| ----------------------------- | ------- | --------------------------------------------------------------------------- |
| AI extraction/inference       | UNKNOWN | No provider selected. Must measure per-report tokens, retries and timeouts. |
| Document intake/storage       | UNKNOWN | Text PDFs first; retention and deletion behavior not implemented.           |
| Hosting/compute               | UNKNOWN | Local development only; no deployment authorized.                           |
| Payment fees                  | UNKNOWN | Stripe not integrated; live mode blocked.                                   |
| Cost-data license             | BLOCKED | Craftsman production price unpublished. No quote received.                  |
| Refunds and support           | UNKNOWN | No support process, no refund data.                                         |
| Marketing/acquisition         | UNKNOWN | Organic/educational distribution hypothesis only.                           |
| Owner time                    | UNKNOWN | Must be tracked separately from cash costs.                                 |
| Free-preview analysis funding | UNKNOWN | Free analyses must be capped before paid conversion is tested.              |

## Margin logic and guardrails

- A report cannot be priced before per-report AI and document-processing cost is measured.
- If a cost-data license would break contribution margin or forbid report display, ship the MVP **without localized numeric ranges**.
- Track contribution (receipts minus measured variable costs), not gross sales portrayed as profit.
- Cap free analyses and use request budgets, max cost/timeout and bounded concurrency once any AI provider exists.
- Keep the architecture simple to avoid always-on infrastructure cost.

## What is explicitly not claimed

- That $49–$79 is viable.
- That any 90-day revenue target is guaranteed.
- That competitor pricing validates BuildScope pricing.
- That licensed data will be affordable or available.
- That current operating costs are known.

## Validation plan

1. Finish the synthetic P2 walkthrough.
2. Collect structured feedback on trust, usefulness and willingness to pay.
3. Secure 5–10 legitimate paid or binding pilot indications.
4. Only then invest in P3 extraction, and measure real cost per report.
5. Revisit pricing after measured accuracy, cost and pilot feedback exist.

## Traceability

- REQ-011, REQ-302, REQ-600, REQ-610; master prompt sections 1, 7, 13, 14, 16.
