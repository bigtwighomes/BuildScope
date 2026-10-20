# BUILDSCOPE CHECK — AUTHORITATIVE MASTER PRODUCT & ENGINEERING PROMPT

**Document:** `masterprompt.md`  
**Version:** 1.0  
**Research baseline:** October 20, 2026  
**Status:** Product requirements and execution directive; no claim that the software, integrations, contracts, or cost-data licensing are implemented.  
**Initial environment:** OpenCode on Windows; preferred local project `C:\BuildScopeCheck` unless the owner has chosen another existing location.  
**Product working name:** BuildScope Check (name, domain and trademark clearance not completed).  
**Owner's objective:** A focused, commercially viable, low-operating-cost, mostly self-service web application that compares construction proposals and provides transparent, optional regional construction-cost planning intelligence. Achieve paid pilot demand before expanding.

---

## 0. FIRST: HOW EVERY AGENT MUST USE THIS FILE (ANTI-DRIFT CONTRACT)

**This file is the authoritative product and engineering specification. Read it in full at the beginning of every new agent session and before architectural changes.** The objective is to avoid lost requirements, scope drift, unnecessary refactors, and duplicate implementations.

1. **If this file is provided outside the repository**, copy it unchanged to the root as `<project-root>/masterprompt.md` before commencing project implementation. If one already exists, compare files and reconcile with the owner's approval; never overwrite user work without permission.
2. Immediately create or update root `AGENTS.md` to say: `Before any task, read masterprompt.md in full. Treat it as the authoritative requirements, safety gates and acceptance contract. Check actual repository state before proposing changes. Changes to masterprompt.md require explicit owner approval.` Include discovered repository-native verification commands and project-specific conventions. This is a small entrypoint, not another long competing requirements document.
3. In each work session: (a) identify the active repo and Git status, (b) read `AGENTS.md`, `masterprompt.md` and existing relevant docs, (c) state the active phase and target acceptance criteria, (d) inspect first, (e) implement a bounded slice, (f) test the complete affected flow, (g) update an evidence-backed progress ledger.
4. Keep `docs/STATUS.md`, `docs/DECISIONS.md`, `docs/REQUIREMENTS_TRACEABILITY.md`, and `docs/NEXT_ACTIONS.md` as concise **derived records**, not sources that can silently override this master prompt. Use requirement IDs in tests, code reviews and status reports.
5. Never quietly weaken, omit, rename, or substitute a core requirement because the prompt, context window, framework or preferred model is inconvenient. Flag conflicts and get a decision. Product scope may evolve but **changing this document requires owner approval and a versioned change record**.
6. Distinguish `PLANNED`, `IMPLEMENTED`, `LOCALLY VERIFIED`, `INTEGRATION VERIFIED`, `PRODUCTION VERIFIED`, `BLOCKED`, and `UNVERIFIED`. No fictitious tests, customers, data rights, business numbers, credentials, integrations or source citations.
7. Record genuinely discovered gaps beyond the listed requirements. This prompt is a floor for correctness, not a restriction on professional judgment. Propose improvements, but avoid expanding the app into a full construction-management suite.
8. Preserve existing code and Git state. Never overwrite unrelated files, rewrite history, alter production, buy services, change billing, transmit customer data, push to a remote, or create paid subscriptions without appropriate explicit authorization.
9. If an external service is unavailable, fail locally and visibly with fallback or `not evaluated`. Never silently substitute made-up data.
10. Before claiming an issue solved, include commands run, expected/actual results, and what remains unverified.

### Non-negotiable intent (REQ-001)

**Build a small, premium, credible, self-service construction decision-support product, not another CRM, estimating enterprise, builder marketplace, project scheduler or AI agent swarm.** Its signature advantage is evidence-linked analysis of **what is included/excluded, who supplies, who buys, who installs, who coordinates, who pays, what remains unknown, and what material changes cost**. Optional regional reference pricing adds value **only if data is defensible and commercially licensed**.

---

## 1. CONTEXT, BUSINESS MODEL AND SUCCESS CRITERIA

### Product thesis (REQ-010)

Homeowners, owner-builders, DIY kit buyers, renovation clients and later select contractors often compare proposals with fundamentally different scopes. A materials-only kit, installation contract, sitework quote and finished-home proposal cannot be compared by headline price. BuildScope Check transforms user-supplied quotes into structured, evidence-linked scope comparisons, explicit responsibility assignments, change-order sensitivity, and printable questions for contractors.

### Commercial targets (REQ-011)

- Validate willingness to pay with 5–10 legitimate paid pilots before building an extensive optional feature roadmap.
- Test one-time pricing rather than requiring subscriptions for homeowners. **Working test hypotheses**: core report $49–$79; optional future licensed-cost-data report $99–$149. No promise these prices are viable. Do not turn on production pricing without approval.
- Work toward a sustainable business with low per-report AI, hosting, document storage, merchant, support, refund and marketing expenses. Track operating contribution, **not gross sales portrayed as profit**.
- Fully automate ordinary purchase, payment verification, report fulfillment and customer recovery; require owner attention primarily for exceptions.
- Do not assume any 90-day revenue target is guaranteed. Customer acquisition and genuine value validation govern investment.

### Initial buyers and scope (REQ-012)

Prioritize (1) homeowners comparing building proposals, (2) homeowners planning bathroom renovation, (3) owner-builders/materials-package customers, particularly log, SIP, conventional frame and hybrid builds. Future contractors/professionals only after consumer workflow succeeds.

### Explicit non-goals (REQ-013)

No full CRM, accounting, project schedule, permit approval, stamped structural design, legal contract certification, contractor matchmaking, live real-estate valuation, native mobile app, detailed production takeoff, continuous price surveillance, unlimited AI chat, autonomous legal conclusions, or unsupervised procurement. Do not build multi-agent orchestration solely because the developer uses an agent. Keep working MVP focused.

---

## 2. FIRST DEVELOPMENT ACTION: INSPECT AND ORGANIZE THE PROJECT (REQ-020)

Do this **before competitor research or feature work**. Inspect current working directory and Git status. If an existing project exists, inspect and preserve it; otherwise establish `C:\BuildScopeCheck` (Windows) or an explicitly owner-designated equivalent. Write the provided `masterprompt.md` at repository root, create minimal `AGENTS.md`, initialize Git locally if required (no remote pushes without permission), and add `.env.example` without secrets.

Logical reference layout; adapt to framework conventions and do not create empty/duplicated architecture solely to match the diagram:

```text
BuildScopeCheck/
  masterprompt.md               # one authoritative product specification
  AGENTS.md                     # session bootstrap: read masterprompt.md
  README.md
  .env.example
  .gitignore
  package.json
  docs/
    STATUS.md                   # proof-backed phase ledger
    NEXT_ACTIONS.md
    REQUIREMENTS_TRACEABILITY.md
    DECISIONS.md
    research/
      COMPETITOR_MATRIX.md
      REA_EVIDENCE.md
      CRAFTSMAN_LICENSE.md
      DATA_SOURCE_REGISTER.md
      PRICING_AND_UNIT_ECONOMICS.md
    product/
      USER_JOURNEYS.md
      UX_AND_REPORT_DESIGN.md
      SCOPE_AND_MVP.md
    architecture/
      DATA_MODEL.md
      DOCUMENT_PIPELINE.md
      SOURCE_PROVENANCE.md
      SECURITY_AND_PRIVACY.md
    legal/
      DISCLOSURE_REGISTER.md
      COUNSEL_REVIEW_CHECKLIST.md
    tests/
      TEST_PLAN.md
      TEST_RESULTS.md
      RELEASE_GATES.md
  src/
    app/                         # routes and UI
    components/                  # accessible layout and comparison views
    features/
      intake/
      document-extraction/
      normalization/
      scope-responsibility/
      financial-checks/
      change-orders/
      cost-reference/
      geodata/
      hazards/
      risk-disclosures/
      reports/
      checkout-fulfillment/
    server/
    lib/
    types/
    styles/
  tests/
    fixtures/synthetic/
    unit/
    integration/
    security/
    e2e/
  scripts/
  public/
  .github/workflows/
```

Consolidate or adapt directories when the real framework dictates. Establish project commands (lint/typecheck/tests/build), formatting, secure configuration, artifact retention rules, a clean CI proposal, and an architecture decision record before large changes.

Use a lean, familiar TypeScript full-stack framework, responsive accessible components, proven PDF libraries, Stripe test checkout and the owner's existing hosting services if they fit. **No stack choice is mandatory until existing environment has been inspected.** REA research outputs and any competitor artifacts remain outside production code.

---

## 3. RESEARCH COMPETITORS AND STUDY REA LAWFULLY (REQ-030)

### Competitors

- RemodelerIQ: https://remodeleriq.com/
- EstimateHawk: https://estimatehawk.com/
- BidCompare AI / GreatBuildz: https://bidcompareai.com/ (verify redirect/current operator)

Inspect publicly viewable demonstrations, claims, interface journeys, feature depth, file handling, report examples, accuracy disclosures, pricing, conversion patterns, user pain, and legitimate distribution strategy. Facts must cite source and observation date; mark competitor claims as claims rather than independently verified implementation. Compare source-backed capabilities and observable gaps, especially source traceability, materials-only packages, responsibilities, geographically qualified assumptions, and change orders. Do not proclaim superiority without independent representative tests.

### REA reference

Official repo: https://github.com/morluto/rea ; setup: https://rea.tools/ and official README. REA is a tool for examining authorized local artifacts and publicly observable application behavior; it **cannot prove or expose hidden private backend code**. It is not required as a production dependency.

Before setup, confirm provenance, Node requirements and local OpenCode configuration behavior; run a read-only dry run such as:

```powershell
npx rea-agents@latest setup --client opencode --dry-run
```

**Stop for approval before actual setup** since it modifies agent configuration. If approved, use documented `npx rea-agents@latest setup --client opencode`, inspect the actual changes, restart client and verify MCP operation. Do not install unnecessary native binary-analysis engines for a website study.

Authorized research: public HTML, scripts, demos, docs, public sample reports, standard browser observations, licensed/open-source materials, and permitted network behavior. **Prohibited**: defeating authentication or paywalls, taking private data, copying proprietary code/design assets, probing vulnerabilities without permission, intercepting others' sessions, automating prohibited scraping, or claiming inferred internals as fact. Obtain permission before creating competitor accounts, paying or uploading user material.

Deliver `COMPETITOR_MATRIX.md` and `REA_EVIDENCE.md` with `CONFIRMED | PUBLIC CLAIM | INFERENCE | UNKNOWN` labels. Research should inform an ORIGINAL product and restrained MVP.

---

## 4. CORE PRODUCT: EVIDENCE-LINKED DOCUMENT ANALYSIS (REQ-100)

### User journey (REQ-101)

1. Visit landing page; inspect realistic **synthetic** sample report and plain-English limitations.
2. Choose project type: new home, materials package / log / SIP / hybrid, or bathroom renovation.
3. Create temporary project/session, optionally give location, and upload initially up to 2–3 text-based PDF proposals (expand formats only if reliable).
4. Validate and extract documents securely.
5. Parse proposals into verified line items, sections, totals, allowances, exclusions, responsibilities and terms.
6. Let customer review/correct important extracted text without mutating immutable original evidence.
7. Generate side-by-side comparison, questions and clear preview.
8. Offer one-time Stripe payment for full PDF/export, with pricing/terms presented clearly.
9. Verify payment on server, generate entitled secure report and send/offer receipt and recovery method.
10. Delete source documents on stated retention schedule; handle support/errors without disclosing other projects.

### Core outputs (REQ-102)

- Proposal overview with company names and quoted totals, if evidenced.
- Normalized side-by-side scope: `INCLUDED`, `EXCLUDED`, `NOT SPECIFIED`, `SEPARATELY CONTRACTED`, `CONFLICTING`, `UNREADABLE`, `NOT APPLICABLE`—do not confuse these.
- **Responsibility matrix** for `SUPPLIES`, `PURCHASES`, `PAYS`, `INSTALLS`, `COORDINATES`, `DELIVERS`, `UNLOADS`, `WARRANTS`; roles include homeowner, materials supplier, GC/builder, trade contractor, engineer/designer, logistics partner, unknown.
- Common scope library spanning survey, engineering, permits, excavation, sitework, retaining/drainage, foundation, SIP/log/frame structure, roofing, exterior, doors/windows, utilities, plumbing, electrical, HVAC, insulation, drywall, finishes, waste, landscaping, freight/unloading, inspections and owner allowances. Project-specific relevance; no speculative defect labeling.
- Allowances, provisional quantities, exclusions, alternates, line-price inconsistencies, duplicate scope, different material grades, taxes, delivery and payment schedules.
- Deposits, payment milestones, escalation, expiration, schedule and change-order terms needing clarification. Do not issue legal judgments or claim terms are unenforceable.
- Prioritized questions addressed to the correct builder/supplier with document/page evidence.
- Exportable evidence-linked report with uncertainties and disclaimers preserved.

### Evidence contract (REQ-103)

Every material factual extraction must carry `{document_id, original_page_or_section, source_span, extraction_quality, classification, evidence_status}`. Provide navigation to the original PDF source when technically possible. If a material statement lacks usable source evidence, display it as a **possible checklist question**, not a confirmed quote term. Distinguish customer-reported facts, extracted facts, external screening, model inferences, verified professional documentation and unknowns. Never invent page numbers, prices, install requirements or quotes.

### AI pipeline (REQ-104)

Use a bounded, testable pipeline: secure file intake -> native text extraction -> optional OCR only when genuinely necessary and reliable -> sections -> schema-validated extraction -> deterministic numeric calculations -> scope/rule comparison -> evidence verification -> human corrections -> findings -> report. Use AI only for interpretation/normalization and question drafting where a simple rule cannot suffice. Treat uploaded text as untrusted instructions; prevent prompt injection and cross-customer leakage. Version extraction prompts, schemas and evaluation fixtures. Favor replaceable AI model adapter and strict max cost/timeout/concurrency.

### Arithmetic and comparison (REQ-105)

All arithmetic via deterministic decimal-safe calculations: quantities * verified unit prices, subtotals, tax (if defined), freight, discounts, deposits, markup, allowances. Never use the LLM to compute final monetary totals. Normalize **material-only versus installed** pricing, units, scope, specs, time period and included markups before comparison. Do not double-count GC overhead/profit or contingencies. Flag amounts as `quoted`, `confirmed additional`, `planning reference`, `potential unpriced`, `unknown`, never force everything into one exact cost. If crucial scope is missing, a project-wide numeric range can be labelled *partial* or withheld.

---

## 5. PROJECT ADDRESS, LOCATION AND SPECIFICATIONS (REQ-200)

Provide ZIP code with city/state/county confirmation and optional street address. Street-level analysis must be opt-in; minimize personal data. ZIP codes can span counties and are not parcel identifiers. The official **U.S. Census Geocoder requires a structured street address** for its address lookup (not ZIP-only); a ZIP-level mapping requires a separate suitable source, and user confirmation for ambiguity. A Census matched point is interpolated, not a surveyed building location. Show resolved geography, resolution, confidence and source date.

### Specification wizard

New home: distinguish conditioned living area from basement/garage/porch/outbuildings; stories; architectural complexity; foundation; structural method (conventional/log/SIP/hybrid); roof form/pitch; windows/doors; HVAC; utility connections; sitework and known slopes; finish categories; owner-supplied work; seasonal access and significant risk factors.

Bathroom: area; gut vs refresh; wet area; fixture replacement; layout and plumbing moves; electrical changes; shower/tub; tile area/quality; vanity; countertop; finishes; ventilation; permit expectations; occupied home; suspected concealed damage.

Allow per-trade finish selections (`economy`, `midrange`, `premium/custom`, `specified`) rather than applying one global multiplier. Request major specifications progressively; never make users complete 100 questions to get an initial explanation. Retain which choices were explicitly confirmed and which were assumptions.

---

## 6. THREE-WAY FINANCIAL PRESENTATION AND PLANNING RANGES (REQ-210)

**MANDATORY: Every result and exported report clearly separate:**

1. **KNOWN COSTS:** Amounts expressly quoted and supported by named current documents, properly scoped; may themselves be conditional, not binding.
2. **PLANNING ESTIMATES:** Source-backed **ranges** for understood scope and assumptions, including data vintage, units, geographic granularity, grade/specs and whether labor/material/equipment are included.
3. **UNPRICED / UNKNOWN CONDITIONS:** Missing quantities, unmatched scope, engineering, site work, access, unseen conditions, tariff and supply issues, change orders, contractor fees, permits and other variables without defensible values. **Unknown is never zero.**

Do not mix the three into a deceptively exact "your house costs $X" number. Where sufficient verified inputs exist, show defensible rounded LOW–HIGH range and the underlying method. If inputs or licensed data are insufficient, explicitly state **"No defensible localized dollar range available"** and provide scope-only planning findings. Never invent percentages or plausible sounding "cost book" numbers.

### Reference-cost math (REQ-211)

For each item, maintain quantity, unit, assembly, source ID, date, locale adjustment, material, labor, equipment, included allowances and markup logic. Determine whether the reference includes installation, equipment, waste, labor burden, overhead/profit and taxes; avoid double counting. **Location modifier != certified site-specific price**. Do not apply arbitrary slope/flood/wildfire/import percentage surcharges without a validated basis. Where meaningful, show sensitivity to selected finish and assumptions; preserve that uncertainty in PDF.

### Change orders and project changes (REQ-212 — CRITICAL)

Building projects change. **An owner-requested change can alter original line-item cost, labor, lead time, procurement, rework, schedule and contractor change-order fees.** Costs may change even if the new item seems cheaper or similar; substitutions can invalidate prior work or contracts.

Include an explicit **Change / Change Order Impact** module that is small enough for the MVP:

- Compare `BASELINE QUOTE` to `PROPOSED REVISION` and distinguish `DRAFT / REQUESTED / QUOTED / APPROVED / REJECTED / UNKNOWN`. Do not treat an unapproved request as a committed price.
- Identify substituted/upgraded/downgraded materials, quantity changes, design changes, electrical/plumbing moves, finishing work, additional coordination, warranty/code effects and schedule shifts.
- Where documented, itemize direct additions **minus** documented credits, plus labor, mobilization, disposal/rework, additional freight, taxes, applicable overhead/profit and contractor **change-order administration fees**. Require original contract terms to confirm fee basis and avoid duplicate markups.
- Show `original known amount`, `documented proposed delta or range`, `unknown fee/exposure`, `revised amount if and only if fully supported`; never silently replace the baseline.
- Mark lead-time and availability changes; distinguish owner-selected, unforeseen-site, code/authority, supplier and contractor-initiated change reasons.
- Flag that change-order procedures, signatures, payment triggers and pricing require written agreement under the actual contract; product does not issue binding legal interpretation.
- Explain how change timing affects expenses (late-stage redesign, material restocking, removal/reinstallation, reinspection, schedule delay and escalation).
- If no signed change-order terms are supplied, report "change-order fee not established" rather than invent a fee.
- Test both positive and negative monetary deltas and cases where a lower-cost product causes higher installation/rework charges.

Suggested concise customer disclosure: **"Changes to plans, quantities, materials or selections can alter original item pricing and may create added labor, delays, delivery costs, rework, contractor markup and change-order fees. A proposed change and an approved change order are not the same. Confirm final price, scope, schedule and written authorization with the contractor."**

---

## 7. COST DATA — CRAFTSMAN LICENSING IS A HARD GATE (REQ-300)

### VERIFIED PUBLIC RESEARCH AS OF OCTOBER 20, 2026

- Craftsman's **National Estimator Cloud contractor software** is publicly advertised for **$13.99/month** or **$167.88/year**, including access to its estimating tools and costbooks. **THIS IS NOT A LICENSE FOR BUILDSCOPE TO REDISTRIBUTE OR EMBED COST DATA.**
- Craftsman's **National Estimator Cloud (NEC) API** exists for third-party software, includes structured categories and material/labor/equipment records; published documentation confirms a **free demo-data sandbox** and **paid production data license**.
- Craftsman's public data-licensing and API documentation **does not publish a standard commercial production API price**. It directs developers to contact its licensing team. **Exact price unknown; vendor quote required.** No guessed monthly or per-lookup cost is acceptable.
- The public API reference exposes `/AreaMods` for ZIP-based factors and `/CostData/ByIds` with area modifiers, though licensed fields and actual coverage must be confirmed in sandbox/provider agreement.
- Listed API product data currently includes construction, renovation/insurance repair, plumbing/HVAC and electrical; confirm current API scope and costbook IDs. Broader stand-alone data libraries are not automatically included in an API license.
- Official resources: https://craftsman-book.com/data-licensing ; https://intercom.help/craftsman/en/articles/9791025-getting-started-national-estimator-cloud-nec-api ; https://nec-api-stage.craftsman-book.com/ ; https://craftsman-book.com/national-estimator-cloud

### Mandatory vendor inquiry (REQ-301)

Draft an inquiry for owner approval; **do not send or commit fees without approval**. Describe BuildScope: U.S. consumer-facing SaaS, one-time paid evidence-linked residential new-build/bath renovation report, localized trade-level **derived ranges** and cited data period, low early report volume scaling with actual demand. Ask for a **written quote** specifying:

1. Onboarding, minimum annual commitment, subscription/base/seat fee, renewal escalators.
2. Per-call, per-project, per-item, per-report and rate-limit charges; overage, caching, sandbox and production keys.
3. Exact costbook coverage, update cadence, ZIP/local factors, supported assembly rates, units and labor/material/equipment fields.
4. Permission to **calculate and display derived customer-facing ranges, line items, comparison tables and downloadable PDFs**; redistribution/report rights and branded attribution requirements.
5. Restrictions on storing, caching, retaining, training models on, exporting, sampling or redistributing raw/derived data, and post-termination obligations.
6. Coverage of residential new construction, bathroom remodeling, specialty systems such as log and SIP, and any excluded areas.
7. Use in free previews vs paid results, whether end consumers count as sublicensed users, contractor white-label use, and number of report recipients.
8. Price lock, termination, audit rights, liability, service levels, licensing territory and test-data terms.
9. Written worked sample and data-quality/area-adjustment methodology.
10. Direct contact for licensing/legal and API support.

Suggested contact: `support@costbook.com`, 1-800-829-8123, or the official licensing form. **Prepared inquiry is not authorization to send.** Record actual response verbatim and update `docs/research/CRAFTSMAN_LICENSE.md`.

### Integration rule (REQ-302)

Build a provider-independent interface, e.g. `CostReferenceProvider`, with modes:

- `OFF`: no monetary localized reference; quote analysis still fully works.
- `DEMO`: synthetic numbers or authenticated Craftsman **sandbox demo data**, **clearly visible only in internal test/development**, never mislabeled as production cost.
- `LICENSED`: real paid Craftsman production data, enabled only after owner approves cost/license, key handling and live use rights.

No scraping costbooks, copying book PDFs/spreadsheets into production, abusing trial plans, or using consumer software credentials as a de facto API. The quoted consumer software price does not convey commercial report rights. If quoted API license breaks gross margin or forbids report display, **ship MVP without localized numeric price ranges**; seek a different licensed provider later. Retain facts and requests, not copied proprietary raw data absent license.

### Other commercial datasets (REQ-303)

RSMeans/Gordian may have relevant local factors but is **not free for embedding**; require written commercial licensing and redistribution rights. No assumption that a paid web seat conveys third-party SaaS rights.

---

## 8. FREE/PUBLIC GEOGRAPHIC AND HAZARD DATA: INTEGRATE CAREFULLY (REQ-320)

The owner requests free integrations wherever lawful and technically sensible. Implement **modular read-only integrations using public official sources**, but **never claim these free feeds constitute localized installed-cost databases**. Before activating a provider: read current API/service docs; confirm accessibility, commercial use, rate limits, acceptable use, attribution, date/version, uptime and privacy; add timeouts, bounds, caching if allowed, retries only for transient errors, circuit breaker/fallback, version-aware parser, contract tests and clear `NOT EVALUATED` fallback. Public site access does not always grant unlimited automated redistribution.

### Provider register (source / intended use / restrictions)

| Provider | Verified public starting point | Intended BuildScope use | Important boundary |
| --- | --- | --- | --- |
| U.S. Census Geocoder | https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html | Optional street-address geocoding and county/geography lookup, not ZIP-only geocoding | Address lookup requires street number and street name; interpolated positions not survey-grade; geocode misses possible |
| FEMA Flood Map Service Center / NFHL | https://msc.fema.gov/ and https://www.fema.gov/national-flood-hazard-layer-nfhl | Link or query available **effective flood-map data** using documented public GIS service when authorized and operational | Coverage varies, flood maps can miss hazards; not certified parcel determination; do not equate no map match with zero flood risk |
| USGS Landslide Inventory & Susceptibility | https://www.usgs.gov/tools/us-landslide-inventory-and-susceptibility-map | Public data screening and county/region advisory as supported by download/service | Nationwide map at modeled resolution; not geotechnical evaluation; inventory confidence varies |
| USGS National Seismic Hazard Model | https://www.usgs.gov/programs/earthquake-hazards/science/national-seismic-hazard-maps | Regional seismic-hazard context and source link | Seismic map not a code-designed seismic category or engineer approval; some design-map services are provisional/beta |
| USGS 3DEP elevation / EPQS | https://epqs.nationalmap.gov/v1/docs | Basic elevation reference where supported | Single point elevation does not describe parcel slope, excavation volumes, truck approach or access |
| U.S. International Trade Commission HTS | https://hts.usitc.gov/ and https://www.usitc.gov/harmonized_tariff_information/hts/archive/list | Link to downloadable current HTS release (CSV/JSON), flag potential imported-material duty questions | Correct HTS classification, origin, effective dates, chapter 99/additional duties and exemptions require specialist verification; NOT an automatic binding duty calculator |
| U.S. Bureau of Labor Statistics | https://www.bls.gov/developers/api_faqs.htm | Published regional wage context only | Basic API is public/limited; registered API has rate limits; wages are **not** installed contractor labor prices |
| Relevant local building authority | Official municipal/county/state sources, determined by address | Link to jurisdiction/code/permit information | Local code edition/amendments must be verified; no instant compliance opinion |
| ICC model code text | https://codes.iccsafe.org/ | Links to official reference where relevant | Public viewing **does not grant license to mirror or redistribute copyrighted codebooks** |

### Integration priority and gated rollout (REQ-321)

**Now / first free-data pass:** address/county resolution (optional), authoritative source-link registry, USGS publicly accessible landslide/seismic/elevation screening in appropriately narrow scope, FEMA flood map lookup/link and relevant USITC reference linking, with auditable uncertainty labels. Start with only 1–2 reliable integrations if they meet time/cost and acceptance gates; do not block the core app for a fragile nationwide GIS suite.

**Later:** automated overlay/parcel joins, large raster downloads, specialized engineering maps, permit-code interpretation and live tariff calculations, after verified operational benefit and data terms. Large GIS integration is **not required for core MVP**.

### Risk data schema (REQ-322)

Each observation: `{source_name, source_url, version_or_date, retrieved_at, input_geometry_precision, geographic_resolution, coverage_status, license_or_use_note, observation, status: [verified_source_statement | customer_report | screening_indicator | possible_issue | not_evaluated | professionally_verified], cost_adjustment_justification?, limitations, customer_action}`. Only professionally established facts may be marked as such. `NOT FOUND`, `SERVICE UNAVAILABLE`, `OUTSIDE COVERAGE` and `NOT ASSESSED` are different from `NO RISK`.

### Licensed code materials and proprietary sources (REQ-323)

No bulk text embedding, quotation datasets, licensed map redistributions, or automated reproduction of ICC, RSMeans, Craftsman or paid local sources absent clear written permission. Link to official sources and seek appropriate approvals.

---

## 9. CONSTRUCTION RISK UNIVERSE — SITE, MARKET AND DESIGN (REQ-400)

This is illustrative, NOT exhaustive. Expand with evidence for project type/jurisdiction; never treat generic risks as site findings, or arbitrary risk flags as supported price add-ons.

**Geography/topography:** mountain and valley sites, steep grade, rock/blasting, retaining walls, fill, erosion, landslide and debris flow, altitude, seasonal construction, frost, snow, remote work, slope-adjacent drainage, survey/topography, grading access.

**Water and land:** lake/riverfront, shoreline/setbacks, floodplain/floodway, storm surge/coast where relevant, wetlands, watershed, high groundwater, spring/stream, stormwater retention, septic/well and utility connections, drainage, erosion controls.

**Weather/hazards:** local wind speed, topographic wind, hurricane, hail, freeze/thaw, snow load, seismic, wildfire/WUI, ash and ember exposure, corrosion, fire/access restrictions, code-triggered mitigation; local authority decides actual requirements.

**Ground/renovation unknowns:** rock/soils/expansive earth, buried lines, failed existing foundations, hidden rot/moisture, lead/asbestos, pests, mold, undocumented electrical/plumbing, renovation demolition surprises and safe remediation.

**Access/logistics:** steep/narrow/private roads, hairpin turns, weak bridges, heavy truck limits, clearance, staging space, crane/boom, unloading, hauling and remote labor travel, specialized delivery, storage, long lead times, road construction.

**Design/spec:** SIP/log/timber/hybrid vs conventional framing, engineered specifications, roof geometry, wall heights, glazing/wind ratings, code-required windows and insulation, fixture counts, elevator/ADA features where applicable, site grading, custom cabinetry, tile, finishes, premium products, acoustic/fire detailing.

**Economy/supply:** inflation, labor shortages, subcontractor availability, overtime, fuel/diesel, ocean/land freight, war/geopolitics, embargo, supplier interruption, customs delays, origin/HTS duty/tariff changes, FX, port congestion, storage/demurrage, substitutions, manufacturing delays, pricing expiry, capacity spikes after disasters.

**Permits/legal/contract:** local code edition and amendments, zoning, setbacks, height and site coverage, fees/inspections, HOA/restrictions, environmental permits, financing, bonds/insurance, milestone and contract payment, liens, warranties, change orders, escalation, weather/time extensions, owner responsibilities.

**Project delivery:** builder coordination, owner decisions and late selections, commissioning, inspection rework, schedule slippage, partial deliveries, subtrade conflicts, unpriced coordination work, waste and spoil disposal.

Provide a concise, tailored project-risk section with `known`, `indicated`, `user-reported`, `possible`, `unverified`, `not evaluated`; avoid alarm fatigue. Site-specific conditions and actual law must be confirmed by local qualified professionals.

---

## 10. LIABILITY, DISCLOSURE, AND ADVICE BOUNDARIES (REQ-410)

Disclaimers are necessary but **cannot automatically immunize misleading claims, poor practices or legal liability**. Build reliable behavior, source provenance and appropriate controls. Draft ToS, privacy, limitation of liability, refund terms, scope-of-service, third-party data caveats and professional-advice warnings **for attorney review** before paid launch. Consider professional E&O, cyber and general business insurance review. No claims of protected status or enforceability without counsel.

### Required disclosure system (REQ-411)

Central version-controlled disclosure register with trigger, full text, short clear text, source/legal-review status and page placements: landing/pricing, form entry, upload, reference range, hazard result, comparison, checkout, report preview, PDF, email/recovery, and legal pages. Use contextual notices, not repetitive obstructive popups; display material assumptions **adjacent to cost numbers**. Keep significant limitations in exported PDF. Affirmative checkbox at checkout where appropriate, unchecked by default, store policy version/date and minimum required evidence of acknowledgment; no misleading default-consent mechanisms.

### Standard plain-English warning (draft; counsel review required) (REQ-412)

> **Planning reference, not a construction quote.** BuildScope Check compares the documents and inputs provided and, when available, shows reference cost ranges based on dated third-party data and stated assumptions. It does not establish final project cost, certify design or code compliance, inspect the property, determine legal contract rights, guarantee safety, or replace a contractor, engineer, surveyor, geotechnical professional, customs specialist or attorney. Actual expenses may change because of scope, site, local regulations, labor, quality choices, access, freight, fuel, imports/tariffs, supplier availability, market conditions, delays, hidden conditions, owner changes and contractor change-order fees. **Unpriced and unknown items are not assumed to cost zero.** Confirm scope, pricing, responsibilities and any changes in writing with qualified parties before committing funds.

Use shorter contextual versions where useful but not in place of complete product limitations. Do not say 'certified', 'guaranteed savings', 'secure by default' or 'completely accurate' without proof. Do not represent input documents as professionally validated just because the app read them.

### Privacy (REQ-413)

Construction documents may include names, addresses, proprietary figures, signatures, phone numbers, supplier rates and payment terms. Clearly disclose external AI processing, encryption in transit/private storage, retention schedule, access controls, logging boundaries and deletion procedures. No training on sensitive user documents without explicit authorization and appropriate data rights. No claims such as 'never leaves our servers' if AI requests are sent to third parties.

### Change-order disclosure (REQ-414)

Every baseline-versus-revision section must explain that requested design/material/quantity changes may change quoted item costs, rework, schedule and contractual fees and that any formal change requires contractually appropriate written approval. Display known fee terms separately from unknown possible fees.

---

## 11. PREMIUM USER EXPERIENCE (REQ-500)

Use the prior **illustrated interface concept**: elegant premium SaaS dashboard (not literal screenshot available here) with deep navy sidebar, white/light-neutral work area, measured royal blue accents, dimensional cards, restrained shadows, modern typography, accessible contrast, clean tables, calm micro-interactions and polished PDF graphics. High quality without visual clutter, fake AI chat features or gratuitous animation.

### Main screens

- Landing and demo report, with transparent pricing and customer value.
- Project intake: basic project details + optional ZIP/county/address; prominent limitations.
- Uploads: clear accept/reject/status and safe recovery.
- Extracted proposals: clear correction and provenance controls.
- Comparison table: quote columns; status `included/excluded/not specified/separate/unknown`; filters for trade and responsibility, original source drilldown.
- Financial view: **Known Costs / Planning Estimates / Unpriced & Unknown**, trade breakdown, assumptions, range and data vintage.
- Changes view: baseline vs requested/approved change and delta/fees/schedule unknowns.
- Location & risks: contextual screening, source link, map extent/resolution limits, explicitly non-certified results.
- Findings & next questions: prioritized, actionable and evidence-linked.
- Report preview, test checkout, entitled download, support/recovery.

Make desktop comparison extremely readable; use card view/reflow on phone, accessible interactions, keyboard navigation, high contrast, mobile touch targets, meaningful errors/loading. Avoid showing working links/buttons unless they actually work; use clear disabled state when capability is deferred.

---

## 12. REPORT CONTENT AND OUTPUT QUALITY (REQ-510)

A professional PDF and accessible on-screen report should include:

1. Cover with project identity, date, report ID and analysis status.
2. Executive summary of meaningful quote differences and limitations.
3. Document inventory and snapshot of supplied files/dates.
4. Document-based known totals with explicit included/excluded scope.
5. Side-by-side trade/scope table with source references.
6. Responsibility matrix.
7. Allowances, alternates, unit differences and potential duplicate charges.
8. Deterministic math and financial discrepancies where proven.
9. **Known Costs / Planning Estimates / Unpriced & Unknown Conditions** in distinct sections with source dates and range assumptions.
10. Location and hazard screening results, with geographic resolution and limitations, only where actually performed.
11. **Change-order / design change cost-and-fee consequences**, if relevant, distinguishing draft vs approved changes.
12. Payment/schedule/warranty and construction contract questions (not legal conclusions).
13. Prioritized questions for each provider.
14. Evidence appendix: document/page/quote spans; no fake provenance.
15. Methodology, disclaimer, data freshness, what was not assessed, professional-verification guidance and appropriate third-party attribution.

PDF must not give an exact unsupported all-in project price or hide unknowns as zero. All paid outputs must pass authorization/fulfillment checks and generate a customer-usable download. Test reports for print margins, long table wrapping, pagination, links and mobile access.

---

## 13. PAYMENT, FULFILLMENT, SECURITY & LOW OPERATING COST (REQ-600)

Use Stripe Checkout in test mode until explicit approval for live charging. Validate success through signed server-side webhooks, not success-page parameters; idempotency against replay/duplicate delivery; handle pending/failed payments and refunds appropriately; entitlement per project, rate limiting, retry alerts and simple support process. Do not let unauthenticated users enumerate paid reports or access another customer's uploaded documents. No secrets in frontend/source or Git.

Uploads: validate actual content/magic bytes and limits, scan/contain harmful files with suitable controls, avoid processing user-supplied instructions as AI system commands, block SSRF/path traversal, separate tenants or projects, restrict public URLs, use short-lived signed links and deliberate retention/deletion. Report deletion and restoration behavior accurately. Apply bounded concurrency, request budgets, clear error state, audit logs without raw private content, and monitored provider spend. Use **synthetic data** in development unless explicit permissions and privacy are confirmed.

Keep architecture simple: no unnecessary microservices or background always-on agents. Free OpenCode development models are not a promise of free, safe production AI document processing. Decide provider after test accuracy, data rights, security and per-report cost analysis; do not assume confidential documents can be uploaded to a free endpoint.

---

## 14. UNIT ECONOMICS, PRICING AND SALES VALIDATION (REQ-610)

Track Stripe receipts, fees, AI calls, file processing, hosting, reference-data license, refunds, user support, advertising and owner's time separately. Estimate project marginal contribution including how pre-checkout AI analysis is funded; cap free analyses. Prices are tests not proof. Competing cheap/free products mean value differentiation needs demonstration.

Pilot plan: demonstrate synthetic two/three quote comparisons to relevant users, obtain 5–10 genuine paid or binding pilot indications, collect real feedback on trust, report usefulness, error rate, support and willingness to pay. Never fabricate testimonials or savings. Initial distribution: relevant homebuilding/owner-builder/renovation content, selective pages at BrainyPlanner and user's construction businesses only with appropriate separation/permission, and targeted search educational resources. Avoid high-maintenance services and spam.

---

## 15. REQUIREMENTS-DRIVEN TESTS & ACCEPTANCE (REQ-700)

Create **synthetic, hand-labeled ground-truth** fixtures and measure failure modes, not merely whether code builds. At minimum:

- Two aligned comparable proposals; missing and separately contracted scopes; materials-only kit vs complete build; labor-only quote; builder/owner trade overlap; conflicting specification and unit.
- Quotes with allowance changes, duplicated lines, arithmetic errors, omitted tax/freight, deposits exceeding subtotal and ambiguous warranty/expiration clauses.
- A mountain parcel, lakeshore, valley, mapped flood and landslide susceptibility context; ZIP crossing counties; a bad geocode; unknown site data; unavailable API; remote access; concealed water/lead/asbestos possibilities; high wind/wildfire/seismic source advisories.
- Economy framing with premium windows; builder-grade vs custom bath finishes; unknown material quantities; different sq-ft definitions and partial structures.
- Imported doors/windows with tariff-origin ambiguity, fuel/freight variation, supplier lead-time and exchange-rate uncertainties.
- **Change orders:** added and removed scope, material substitution, tile grade upgrade, plumbing relocation, design modification, rework, change-order fee spelled out vs unknown, signed approved vs only requested, schedule change, original baseline preserved, cost credits not double counted.
- Cost data modes: no source, demo only, licensed test data, stale data, forbidden redistribution/caching, missing or invalid area modifier, vendor outage; verify no invented localized dollar amounts.
- Malicious/oversized/scan-only/encrypted PDFs; prompt injection; concurrent uploads; duplicate webhook; unauthorized project reads; download expiration; deletion, cancellation, payment failure, failed processing, retry idempotency, sensitive log leakage.
- PDF pagination, evidence links, disclaimers, incorrect source page, responsive/mobile/accessibility checks.

Maintain metrics for extraction completeness, citation correctness, scope-classification precision, math correctness, false omission claims, ambiguity clarity, latency, cost per report, failures and support burden. Define acceptance thresholds empirically from a documented test set; do not assert reliability without results. Production gate requires real documented end-to-end checks, security/privacy/legal review, transparent unverified limitations, and owner approval for live payment or deployment.

---

## 16. CONTROLLED PHASES WITH EXIT GATES (REQ-800)

**P0 Foundation / repository**: inspect existing work, write this master prompt, create AGENTS entrypoint and project layout, select stack, baseline commands. Exit: structure verified and no user work overwritten.

**P1 Research & feasibility**: public competitor matrix, legitimate REA evaluation, licensing vendor inquiry draft, free-data register, differentiation and margin hypothesis. Exit: unknown licensing cost clearly blocked and MVP scope explicit.

**P2 Minimal original product UX**: branded responsive mock using **synthetic** quote fixtures, usable comparison/evidence/known-vs-unknown view, basic report format. Exit: user walkthrough and accessibility checks pass.

**P3 Core document intelligence**: secure text PDF ingestion, schema extraction, human correction, deterministic math, comparison/responsibilities, clear limits. Exit: documented ground-truth tests for positive/negative cases.

**P4 Change orders & risk/disclosures**: change baseline and cost/fee/schedule terms, location input, central warning engine, source/version tracking. Exit: robust handling of unsupported cost/risks.

**P5 Free public source integrations**: modular Census/FEMA/USGS/USITC/BLS where documented and useful; sensible cache, provenance, missing-data fallback, rate limiting. Exit: verified source results and no false parcel/compliance claims. **Do not delay a sellable core MVP for marginal GIS work.**

**P6 Reference cost adapter**: provider modes OFF/DEMO/LICENSED; Craftsman demo only in development with approved access; evaluate real supplier quote. Exit: production disabled until explicit licensing/data-rights approval.

**P7 Commercial workflow & reporting**: Stripe test payments, secure downloads, professional PDF, data retention, exception monitoring. Exit: fully tested test-mode transactions, no unearned entitlements.

**P8 Security, legal and paid pilot**: code tests, adversarial review, confidential data handling, counsel review of disclaimers/legal documents, unit economics and 5–10 legitimate pilot opportunities. Exit: owner approves next stage; no automatic live launch.

**P9 Later expansion**: only if paid demand and acceptable unit economics justify OCR/scanned PDFs, more trades, estimates, contractor tiers, richer location data or licensed production costbooks.

At each gate: evidence, code/files changed, test commands/results, source and data rights, cost exposure, known risks, explicit next action. Avoid generic progress narration.

---

## 17. FIRST WORK SESSION: EXACT REQUIRED ORDER (REQ-900)

1. Identify active working directory and existing repo/dirty state; check if `masterprompt.md` already exists.
2. Place the supplied file **unchanged** at the project root; create `AGENTS.md` pointing to it; verify both files.
3. Establish lean organized directories and docs, baseline Git/config/CI conventions, and record current truth. **Do not recreate the project if it already exists.**
4. Review scope and implementable MVP, mark licensing and legal approvals BLOCKED; prepare a no-cost research plan.
5. Begin lawful competitor review and REA setup **dry-run**. Stop for owner permission before setup modifies agent configuration.
6. Research Craftsman licensing; prepare contact message for approval and record that production pricing is **unknown**. Do **not** send it without permission.
7. Investigate free public data sources and propose only integrations with verified technical and use terms; build read-only adapters when reasonable and within the current owner-authorized implementation scope.
8. Implement a thin, fully working, synthetic-data project flow in controlled gates. Do not block early product validation on paid cost data.
9. At end, give concise status (`COMPLETE / PARTIAL / BLOCKED / UNVERIFIED`), evidence of changes/tests, important risks and next highest-value task. Never report production-ready without appropriate proof.

---

## 18. VERIFIABLE REFERENCE REGISTER (RESEARCH, NOT LICENSE GRANTS)

**Craftsman commercial licensing (no public API fee verified):**
- https://craftsman-book.com/data-licensing
- https://intercom.help/craftsman/en/articles/9791025-getting-started-national-estimator-cloud-nec-api
- https://nec-api-stage.craftsman-book.com/
- https://craftsman-book.com/national-estimator-cloud
- https://craftsman-book.com/national-construction-estimator

**Government/public data:**
- https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html
- https://msc.fema.gov/
- https://www.fema.gov/national-flood-hazard-layer-nfhl
- https://www.usgs.gov/tools/us-landslide-inventory-and-susceptibility-map
- https://www.usgs.gov/programs/earthquake-hazards/science/national-seismic-hazard-maps
- https://epqs.nationalmap.gov/v1/docs
- https://hts.usitc.gov/
- https://www.usitc.gov/harmonized_tariff_information/hts/archive/list
- https://www.bls.gov/developers/api_faqs.htm
- https://codes.iccsafe.org/
- https://www.iccsafe.org/about/terms-of-use/

**Competitive and research toolkit:**
- https://remodeleriq.com/
- https://estimatehawk.com/
- https://bidcompareai.com/
- https://github.com/morluto/rea

**Source-quality rule:** Verify current documents when executing; external pages, endpoint terms, APIs, license fees and rates can change. Keep citation/source URLs and exact retrieval dates in research docs. Public availability never by itself authorizes data redistribution or binding pricing claims.

---

## 19. FINAL PRODUCT STANDARD

A premium **quote intelligence and scope-responsibility** tool with **optional, honest localized planning references**, not a black-box 'instant guaranteed house price' generator. Every important finding traces to a document or source. Every assumption and unknown is visible. Material/spec changes and **contractor change-order fees** are explicit. Hazard data screens, it does not certify. Real costbooks require commercial rights. Public government datasets add value without fabricating dollar prices. The product handles sensitive documents, is inexpensive to operate, provides a genuinely polished comparison report and improves with measured buyer feedback. The master prompt remains authoritative until the owner explicitly revises it.

**END OF AUTHORITATIVE MASTER PROMPT — v1.0**
