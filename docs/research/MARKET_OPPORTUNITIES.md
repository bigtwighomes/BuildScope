# Market Opportunities and Differentiation

- **Phase:** P1 (REQ-030, REQ-010, REQ-011, REQ-012).
- **Evidence base:** `COMPETITOR_MATRIX.md`, `PRICING_AND_UNIT_ECONOMICS.md`, `REA_EVIDENCE.md`. All statements below are `INFERENCE` or `HYPOTHESIS` unless explicitly marked `VERIFIED` in the competitor matrix. No market size, customer count or revenue figure is fabricated.
- **Status:** hypotheses for testing, not conclusions.

## Problem statement (REQ-010)

Homeowners and owner-builders receive proposals that are not comparable: materials-only kits, installation-only contracts, turnkey bids, cost-plus estimates and owner-supply arrangements. Headline totals hide differences in who supplies, pays, installs, coordinates, delivers and warrants the work, and they hide unpriced conditions and change-order exposure. Existing tools mostly compare bids against a market target or score them; BuildScope's hypothesis is that **evidence-linked scope and responsibility comparison** is the more defensible core.

## Target segments (REQ-012)

1. Homeowners comparing building or renovation proposals.
2. Homeowners planning a bathroom renovation (smaller, faster, easier to test).
3. Owner-builders and materials-package customers: log, SIP, conventional frame and hybrid builds.

Contractors and professional teams are later, after the consumer workflow is proven.

## Differentiation hypotheses

| Hypothesis                                                                                                                | Evidence / source                                                                              | Test required                                                    |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Mixed proposal types (materials-only vs installed vs cost-plus) are underserved by public competitor positioning.         | Public pages do not describe materials-only normalization (`COMPETITOR_MATRIX.md`).            | Show 10–15 representative mixed proposals to target users.       |
| Evidence spans with page/section/quote navigation build more trust than a score or a market label.                        | Competitors publish scores and labels; evidence navigation is `UNKNOWN`.                       | Compare trust ratings between evidence view and score-only view. |
| A responsibility matrix (supplies/pays/installs/coordinates/delivers/unloads/warrants) is a real unmet need.              | No public competitor page described such a matrix.                                             | Validate with owner-builders and renovating homeowners.          |
| Change-order deltas with unknown fees and schedule impact are a distinct wedge.                                           | Public competitor change-order depth is `UNKNOWN`; BuildScope master prompt treats it as core. | Test whether users pay for it before building the full module.   |
| "Unknown is never zero" with three-way financial presentation is a trust differentiator versus a single confident number. | All-in price claims are common in the market; BuildScope separates known/planning/unknown.     | Message testing on landing and sample report.                    |
| A no-contractor-lead-fee model is credible only if it is visible and true.                                                | Competitors make similar claims; one is explicitly contractor funded (`VERIFIED`).             | Publish the business model plainly and keep it accurate.         |

## Distribution hypotheses (REQ-610)

- Educational content for owner-builders, log/SIP buyers and bathroom renovators.
- Selective, disclosed placement on the owner's existing construction and content properties, with separation and permission where required.
- Direct demonstration of the synthetic sample report to relevant users before any paid feature exists.
- No spam, high-maintenance outreach or fabricated testimonials.

## Risks and unknowns

- **Competitors are established and cheaper or free** in some cases. BuildScope must not claim superiority without independent representative tests.
- **Willingness to pay is unproven.** The 5–10 paid/binding pilot indications required by REQ-011 remain unstarted.
- **Licensed cost data is blocked**, so the first product must deliver value from document analysis alone.
- **AI extraction cost and accuracy are unmeasured**; there is no production AI provider selected.
- **Legal review is incomplete.** Disclaimers are drafts, and terms/privacy/liability require counsel.
- **No real customer document may be processed** without explicit owner permission and handling instructions.

## What would falsify the thesis

- Users only want a market price judgment and do not value scope/responsibility detail.
- Evidence-linked output is not trusted more than a simple score.
- Extraction quality is too low to produce reliable comparisons without heavy manual correction.
- Paid conversion fails at or below the $49–$79 hypothesis even with strong sample-report engagement.

## Next validation step

Prepare a synthetic two-to-three proposal comparison walkthrough and use it to collect structured feedback on trust, usefulness, error tolerance and willingness to pay. Do not build P3 extraction until the P2 walkthrough is reviewed.

## Traceability

- REQ-010, REQ-011, REQ-012, REQ-013, REQ-610.
