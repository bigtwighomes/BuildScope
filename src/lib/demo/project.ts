import type { DemoProject, EvidenceRef, EvidenceQuality, ScopeCell, ScopeStatus } from "./types";

export const DEMO_DOCUMENT_IDS = {
  northline: "doc-northline",
  cascade: "doc-cascade",
  sagebrush: "doc-sagebrush",
} as const;

function evidence(
  documentId: string,
  page: number,
  section: string,
  span: string,
  quality: EvidenceQuality = "high",
): EvidenceRef {
  return {
    documentId,
    page,
    section,
    span,
    quality,
    classification: "extracted",
  };
}

function cell(status: ScopeStatus, note: string, ref?: EvidenceRef): ScopeCell {
  return ref ? { status, note, evidence: ref } : { status, note };
}

const northline = DEMO_DOCUMENT_IDS.northline;
const cascade = DEMO_DOCUMENT_IDS.cascade;
const sagebrush = DEMO_DOCUMENT_IDS.sagebrush;

export const demoProject: DemoProject = {
  id: "demo-cedar-ridge",
  name: "Cedar Ridge Retreat",
  projectType: "New log home · synthetic quote comparison",
  syntheticNotice:
    "Synthetic demo. Every document, price, quote span and observation below is fabricated for interface testing. Nothing here is a real bid, a market price or professional advice.",
  location: {
    label: "Leavenworth area, Washington",
    zip: "98826",
    county: "Chelan County (demo placeholder)",
    state: "WA",
    resolution: "ZIP-level demo placeholder — no live geocoding or parcel lookup was performed.",
    status: "demo_placeholder",
  },
  specs: [
    { label: "Conditioned living area", value: "1,860 sq ft (demo)" },
    { label: "Structure", value: "8-inch milled log wall system (demo)" },
    { label: "Foundation", value: "Comparison includes basement and crawlspace variants (demo)" },
    { label: "Finish level", value: "Midrange with two premium selections (demo)" },
    { label: "Site context", value: "Steep rural access, seasonal snow (demo, user-reported)" },
  ],
  documents: [
    {
      id: northline,
      bidder: "Northline Builders",
      documentTitle: "Northline Builders — Fixed-price proposal (synthetic)",
      documentDate: "2026-09-28",
      pageCount: 14,
      pricingBasis: "fixed_price",
      headlineAmount: 486000,
      headlineLabel: "$486,000 contract sum",
      comparabilityNote:
        "Fixed-price GC proposal with stated allowances. Assumes owner supplies engineered plans and permits.",
      expiration: "Pricing valid 30 days (expires 2026-10-28) — synthetic",
    },
    {
      id: cascade,
      bidder: "Cascade Timber Works",
      documentTitle: "Cascade Timber Works — Materials package (synthetic)",
      documentDate: "2026-10-02",
      pageCount: 9,
      pricingBasis: "materials_package",
      headlineAmount: 231500,
      headlineLabel: "$231,500 materials package",
      comparabilityNote:
        "Materials-only log package. Erection, foundation, sitework, trades and permits are excluded or not specified.",
      expiration: "Quote valid 45 days (expires 2026-11-16) — synthetic",
    },
    {
      id: sagebrush,
      bidder: "Sagebrush Construction",
      documentTitle: "Sagebrush Construction — Cost-plus proposal (synthetic)",
      documentDate: "2026-10-08",
      pageCount: 11,
      pricingBasis: "cost_plus",
      headlineAmount: 418900,
      headlineLabel: "$418,900 line-item estimate",
      comparabilityNote:
        "Cost-plus estimate with allowances. The payment schedule totals more than the line items, so the headline amount is not a fixed contract sum.",
      expiration: "Estimate valid 90 days (expires 2027-01-06) — synthetic",
    },
  ],
  scopeRows: [
    {
      id: "survey-engineering",
      area: "Survey, staking and engineered plans",
      category: "Pre-construction",
      cells: {
        [northline]: cell(
          "SEPARATELY_CONTRACTED",
          "Owner-arranged survey and sealed plans; Northline performs field layout only.",
          evidence(
            northline,
            4,
            "Scope clarifications",
            "“Layout by Northline; survey and engineered plans by owner.”",
          ),
        ),
        [cascade]: cell(
          "NOT_APPLICABLE",
          "Materials package does not include survey or engineering.",
        ),
        [sagebrush]: cell(
          "NOT_SPECIFIED",
          "No survey, staking or engineering line item found in the estimate.",
        ),
      },
      question:
        "Who will provide the stamped log-system engineering and site survey before mobilization?",
    },
    {
      id: "permits",
      area: "Permits, inspections and jurisdictional approvals",
      category: "Pre-construction",
      cells: {
        [northline]: cell(
          "SEPARATELY_CONTRACTED",
          "Permit fees and inspections listed as owner responsibility.",
          evidence(
            northline,
            4,
            "Owner responsibilities",
            "“Permit fees, inspections and utility account setup are owner responsibilities.”",
          ),
        ),
        [cascade]: cell(
          "EXCLUDED",
          "Package excludes permits and inspections.",
          evidence(
            cascade,
            2,
            "Exclusions",
            "“Not included: permits, engineering, foundation, erection or trade installation.”",
          ),
        ),
        [sagebrush]: cell(
          "INCLUDED",
          "Permit coordination and fees included in labor and general conditions.",
          evidence(
            sagebrush,
            5,
            "General conditions",
            "“Permit coordination and municipal fees included.”",
          ),
        ),
      },
    },
    {
      id: "excavation-sitework",
      area: "Excavation, drainage and driveway base",
      category: "Sitework",
      cells: {
        [northline]: cell(
          "INCLUDED",
          "Excavation, backfill, footing drains and gravel driveway base included.",
          evidence(
            northline,
            5,
            "Sitework",
            "“Excavation, backfill, footing drain and 6-inch gravel drive base included.”",
          ),
        ),
        [cascade]: cell("NOT_APPLICABLE", "Materials package does not include sitework."),
        [sagebrush]: cell(
          "NOT_SPECIFIED",
          "No excavation or drainage line item found; assumes owner-prepared pad.",
        ),
      },
      question:
        "Is rock excavation or blasting excluded, and who pays if unsuitable material is found?",
    },
    {
      id: "foundation",
      area: "Foundation system",
      category: "Structure",
      cells: {
        [northline]: cell(
          "INCLUDED",
          "Full poured basement with 8-inch walls and damp-proofing.",
          evidence(
            northline,
            6,
            "Foundation",
            "“Full basement, 8-inch walls, damp-proofing and gravel backfill.”",
            "medium",
          ),
        ),
        [cascade]: cell(
          "EXCLUDED",
          "Foundation not included in the package.",
          evidence(
            cascade,
            3,
            "Exclusions",
            "“Foundation, slab and anchor hardware installed by others.”",
          ),
        ),
        [sagebrush]: cell(
          "INCLUDED",
          "Ventilated crawlspace foundation with treated stem walls.",
          evidence(
            sagebrush,
            6,
            "Foundation",
            "“Conditioned crawlspace with treated stem walls.”",
            "medium",
          ),
        ),
      },
      question:
        "The proposals describe two different foundation systems. Which one is priced in the contract you sign?",
    },
    {
      id: "log-package",
      area: "Log wall package and erection",
      category: "Structure",
      cells: {
        [northline]: cell(
          "INCLUDED",
          "8-inch milled pine log system, delivered and erected.",
          evidence(
            northline,
            7,
            "Log system",
            "“8-inch milled pine log wall system, delivered and erected.”",
          ),
        ),
        [cascade]: cell(
          "INCLUDED",
          "8-inch milled pine package, delivered; erection by others.",
          evidence(
            cascade,
            1,
            "Base package",
            "“8-inch milled pine package delivered to site; erection not included.”",
          ),
        ),
        [sagebrush]: cell(
          "CONFLICTING",
          "Proposal specifies cedar log wall system; the other two specify pine.",
          evidence(sagebrush, 7, "Log system", "“8-inch cedar log wall system installed.”"),
        ),
      },
      question:
        "Is the quoted log species cedar or pine, and how does the signed specification resolve the difference?",
    },
    {
      id: "roofing",
      area: "Roofing",
      category: "Exterior",
      cells: {
        [northline]: cell(
          "INCLUDED",
          "30-year architectural shingle system with underlayment and flashing.",
          evidence(
            northline,
            8,
            "Roofing",
            "“30-year architectural shingles, synthetic underlayment, full flashing.”",
          ),
        ),
        [cascade]: cell(
          "EXCLUDED",
          "Roofing not included in package base; optional quote offered separately.",
          evidence(
            cascade,
            4,
            "Exclusions",
            "“Roofing materials and installation excluded; optional quote on request.”",
          ),
        ),
        [sagebrush]: cell(
          "CONFLICTING",
          "Standing-seam metal roof priced; Northline proposal uses architectural shingles.",
          evidence(
            sagebrush,
            8,
            "Roofing",
            "“Standing-seam metal roof with ice-and-water shield.”",
          ),
        ),
      },
      question:
        "Which roofing material is actually included, and what is the documented credit or upgrade if the choice changes?",
    },
    {
      id: "windows-doors",
      area: "Windows and exterior doors",
      category: "Envelope",
      cells: {
        [northline]: cell(
          "INCLUDED",
          "Allowance of $32,000 for windows and exterior doors; final selection may change the contract sum.",
          evidence(
            northline,
            9,
            "Allowances",
            "“$32,000 allowance for windows and exterior doors; selections by owner.”",
            "medium",
          ),
        ),
        [cascade]: cell(
          "INCLUDED",
          "Double-pane wood-clad windows and exterior doors included in package.",
          evidence(
            cascade,
            5,
            "Envelope package",
            "“Double-pane wood-clad windows and exterior door units included.”",
          ),
        ),
        [sagebrush]: cell(
          "NOT_SPECIFIED",
          "No window or exterior door specification or allowance found.",
        ),
      },
      question:
        "What window performance and frame specification is included, and what happens when the allowance is exceeded?",
    },
    {
      id: "plumbing",
      area: "Plumbing rough-in and fixtures",
      category: "Trades",
      cells: {
        [northline]: cell(
          "INCLUDED",
          "Rough-in and fixtures for two full bathrooms and kitchen.",
          evidence(
            northline,
            10,
            "Plumbing",
            "“Plumbing rough-in and fixtures for two full baths and kitchen.”",
          ),
        ),
        [cascade]: cell("NOT_APPLICABLE", "Materials package does not include plumbing."),
        [sagebrush]: cell(
          "INCLUDED",
          "Rough-in only; plumbing fixtures supplied by owner.",
          evidence(
            sagebrush,
            9,
            "Plumbing",
            "“Plumbing rough-in included; fixtures by owner.”",
            "medium",
          ),
        ),
      },
      question:
        "Who supplies the plumbing fixtures, and is fixture installation included in each contract?",
    },
    {
      id: "electrical",
      area: "Electrical rough-in and fixtures",
      category: "Trades",
      cells: {
        [northline]: cell(
          "INCLUDED",
          "Rough-in, panel and light fixtures included.",
          evidence(
            northline,
            10,
            "Electrical",
            "“Electrical rough-in, service panel and standard light fixtures included.”",
          ),
        ),
        [cascade]: cell("NOT_APPLICABLE", "Materials package does not include electrical work."),
        [sagebrush]: cell(
          "INCLUDED",
          "Rough-in and panel included; light fixtures by owner.",
          evidence(
            sagebrush,
            9,
            "Electrical",
            "“Electrical rough-in and panel included; light fixtures by owner.”",
            "medium",
          ),
        ),
      },
    },
    {
      id: "hvac",
      area: "Heating and ventilation",
      category: "Trades",
      cells: {
        [northline]: cell(
          "INCLUDED",
          "3-ton heat pump with electric backup and HRV.",
          evidence(
            northline,
            12,
            "HVAC",
            "“3-ton heat pump, 10 kW backup heat and HRV ventilation.”",
          ),
        ),
        [cascade]: cell("NOT_APPLICABLE", "Materials package does not include HVAC."),
        [sagebrush]: cell(
          "CONFLICTING",
          "4-ton heat pump priced; Northline proposal specifies 3 tons. Manual J load calculation not supplied in either document.",
          evidence(sagebrush, 8, "HVAC", "“4-ton heat pump with electric backup.”", "medium"),
        ),
      },
      question:
        "Which contractor performed a Manual J load calculation, and what size does it support?",
    },
    {
      id: "insulation-drywall",
      area: "Insulation and drywall",
      category: "Interior",
      cells: {
        [northline]: cell(
          "INCLUDED",
          "R-21 wall insulation, R-49 ceiling, drywall and finish.",
          evidence(
            northline,
            11,
            "Insulation",
            "“R-21 wall insulation, R-49 ceiling, drywall and level-4 finish.”",
          ),
        ),
        [cascade]: cell(
          "EXCLUDED",
          "Insulation and drywall excluded from package.",
          evidence(
            cascade,
            4,
            "Exclusions",
            "“Insulation, drywall and interior finishes excluded.”",
          ),
        ),
        [sagebrush]: cell("NOT_SPECIFIED", "No insulation or drywall line item found."),
      },
    },
    {
      id: "freight-unloading",
      area: "Freight, crane and unloading",
      category: "Logistics",
      cells: {
        [northline]: cell("NOT_SPECIFIED", "No freight, crane or unloading line item found."),
        [cascade]: cell(
          "NOT_SPECIFIED",
          "Delivery is referenced but no freight amount, crane or unloading responsibility is stated.",
        ),
        [sagebrush]: cell("NOT_SPECIFIED", "No freight or crane line item found."),
      },
      question: "Who pays for freight, a crane or boom truck, and unloading at a steep rural lot?",
    },
    {
      id: "deck-railings",
      area: "Deck and railings",
      category: "Exterior",
      cells: {
        [northline]: cell(
          "INCLUDED",
          "Cedar deck and code-compliant guard rails included.",
          evidence(
            northline,
            12,
            "Deck",
            "“Cedar deck and guard rails at rear elevation included.”",
          ),
        ),
        [cascade]: cell(
          "EXCLUDED",
          "Deck materials offered as an option, not included in the base package.",
          evidence(cascade, 5, "Options", "“Deck package optional; not included in base price.”"),
        ),
        [sagebrush]: cell(
          "CONFLICTING",
          "Composite deck priced; Northline proposal specifies cedar.",
          evidence(sagebrush, 9, "Deck", "“Composite deck and aluminum railings included.”"),
        ),
      },
    },
    {
      id: "waste-cleanup",
      area: "Waste removal and final clean",
      category: "Closeout",
      cells: {
        [northline]: cell(
          "INCLUDED",
          "Dumpster, jobsite cleanup and final clean included.",
          evidence(
            northline,
            13,
            "Closeout",
            "“Dumpster service, progress cleanup and final clean included.”",
          ),
        ),
        [cascade]: cell("NOT_APPLICABLE", "Materials package does not include waste removal."),
        [sagebrush]: cell("NOT_SPECIFIED", "No dumpster or final clean line item found."),
      },
    },
  ],
  responsibilities: [
    {
      id: "resp-log-supplies",
      scopeId: "log-package",
      role: "supplies",
      parties: {
        [northline]: "gc_builder",
        [cascade]: "materials_supplier",
        [sagebrush]: "gc_builder",
      },
      note: "Northline and Sagebrush supply installed log systems. Cascade supplies the package only.",
      evidence: evidence(
        cascade,
        1,
        "Base package",
        "“Cascade Timber Works supplies the milled log package.”",
      ),
    },
    {
      id: "resp-log-installs",
      scopeId: "log-package",
      role: "installs",
      parties: {
        [northline]: "gc_builder",
        [cascade]: "unknown",
        [sagebrush]: "gc_builder",
      },
      note: "Cascade's document does not state who erects the package.",
      evidence: evidence(cascade, 1, "Exclusions", "“Erection not included.”"),
    },
    {
      id: "resp-log-unloads",
      scopeId: "log-package",
      role: "unloads",
      parties: {
        [northline]: "unknown",
        [cascade]: "unknown",
        [sagebrush]: "unknown",
      },
      note: "No document assigns unloading responsibility.",
    },
    {
      id: "resp-permits-pays",
      scopeId: "permits",
      role: "pays",
      parties: {
        [northline]: "homeowner",
        [cascade]: "unknown",
        [sagebrush]: "gc_builder",
      },
      note: "Permit payment responsibility differs between documents.",
      evidence: evidence(
        northline,
        4,
        "Owner responsibilities",
        "“Permit fees ... are owner responsibilities.”",
      ),
    },
    {
      id: "resp-engineering-coordinates",
      scopeId: "survey-engineering",
      role: "coordinates",
      parties: {
        [northline]: "homeowner",
        [cascade]: "unknown",
        [sagebrush]: "unknown",
      },
      note: "Only Northline states who coordinates survey and engineered plans.",
      evidence: evidence(
        northline,
        4,
        "Scope clarifications",
        "“Survey and engineered plans by owner.”",
        "medium",
      ),
    },
    {
      id: "resp-windows-delivers",
      scopeId: "windows-doors",
      role: "delivers",
      parties: {
        [northline]: "trade_contractor",
        [cascade]: "materials_supplier",
        [sagebrush]: "unknown",
      },
      note: "Sagebrush does not specify window delivery responsibility.",
    },
    {
      id: "resp-windows-warrants",
      scopeId: "windows-doors",
      role: "warrants",
      parties: {
        [northline]: "gc_builder",
        [cascade]: "materials_supplier",
        [sagebrush]: "unknown",
      },
      note: "Warranty terms differ and are not equivalent.",
      evidence: evidence(
        cascade,
        8,
        "Warranty",
        "“Manufacturer warranty only; installation labor not warranted.”",
        "medium",
      ),
    },
    {
      id: "resp-hvac-installs",
      scopeId: "hvac",
      role: "installs",
      parties: {
        [northline]: "trade_contractor",
        [cascade]: "unknown",
        [sagebrush]: "trade_contractor",
      },
      note: "Both installed proposals use a trade contractor, but the equipment sizes conflict.",
    },
  ],
  knownCosts: [
    {
      id: "cost-northline-base",
      proposalId: northline,
      label: "Contract sum as written",
      amount: 486000,
      kind: "quoted",
      includedInHeadline: true,
      evidence: evidence(northline, 2, "Contract sum", "“Total contract sum: $486,000.”"),
    },
    {
      id: "cost-northline-cabinets",
      proposalId: northline,
      label: "Cabinetry allowance (inside contract sum, not additional)",
      amount: 18000,
      kind: "allowance",
      includedInHeadline: true,
      evidence: evidence(
        northline,
        9,
        "Allowances",
        "“$18,000 cabinetry allowance; final selection may increase price.”",
      ),
    },
    {
      id: "cost-northline-tile",
      proposalId: northline,
      label: "Tile allowance (inside contract sum, not additional)",
      amount: 6400,
      kind: "allowance",
      includedInHeadline: true,
      evidence: evidence(northline, 11, "Allowances", "“$6,400 tile allowance.”", "medium"),
    },
    {
      id: "cost-cascade-package",
      proposalId: cascade,
      label: "Materials package as written",
      amount: 231500,
      kind: "quoted",
      includedInHeadline: true,
      evidence: evidence(cascade, 1, "Base package", "“Package total: $231,500 delivered.”"),
    },
    {
      id: "cost-cascade-window-option",
      proposalId: cascade,
      label: "Optional triple-pane upgrade (priced option, not in package total)",
      amount: 12400,
      kind: "quoted",
      includedInHeadline: false,
      evidence: evidence(
        cascade,
        6,
        "Options",
        "“Optional triple-pane window upgrade: $12,400.”",
        "medium",
      ),
    },
    {
      id: "cost-sagebrush-lines",
      proposalId: sagebrush,
      label: "Line-item estimate as written",
      amount: 418900,
      kind: "quoted",
      includedInHeadline: true,
      evidence: evidence(sagebrush, 4, "Estimate summary", "“Estimated cost: $418,900.”"),
    },
    {
      id: "cost-sagebrush-lighting",
      proposalId: sagebrush,
      label: "Lighting allowance (inside estimate, not additional)",
      amount: 12500,
      kind: "allowance",
      includedInHeadline: true,
      evidence: evidence(
        sagebrush,
        7,
        "Allowances",
        "“$12,500 lighting allowance by owner selection.”",
        "medium",
      ),
    },
    {
      id: "cost-sagebrush-schedule-gap",
      proposalId: sagebrush,
      label: "Payment schedule exceeds line items by $11,500",
      amount: 11500,
      kind: "arithmetic_discrepancy",
      includedInHeadline: false,
      evidence: evidence(
        sagebrush,
        10,
        "Payment schedule",
        "“Payments total $430,400 across five milestones.”",
      ),
    },
  ],
  planningEstimates: [
    {
      id: "plan-sitework",
      label: "Sitework and excavation",
      low: 28000,
      high: 52000,
      unit: "project range",
      basis:
        "Synthetic placeholder range created only to test the interface. No market, vendor or government cost data was used.",
      dataVintage: "Not applicable — synthetic",
      sourceLabel: "DEMO PLACEHOLDER — NOT A MARKET ESTIMATE",
      synthetic: true,
      assumptions: [
        "Assumes no rock blasting or off-site spoil removal.",
        "Assumes a usable existing access road.",
      ],
    },
    {
      id: "plan-freight",
      label: "Freight, crane and unloading",
      low: 6000,
      high: 18000,
      unit: "project range",
      basis:
        "Synthetic placeholder range for interface testing only. Not derived from any cost database.",
      dataVintage: "Not applicable — synthetic",
      sourceLabel: "DEMO PLACEHOLDER — NOT A MARKET ESTIMATE",
      synthetic: true,
      assumptions: [
        "Assumes one crane mobilization.",
        "Assumes standard-width rural access without pilot car.",
      ],
    },
    {
      id: "plan-well-septic",
      label: "Well and septic connection",
      low: 18000,
      high: 45000,
      unit: "project range",
      basis:
        "Synthetic placeholder range for interface testing only. No site evaluation was provided.",
      dataVintage: "Not applicable — synthetic",
      sourceLabel: "DEMO PLACEHOLDER — NOT A MARKET ESTIMATE",
      synthetic: true,
      assumptions: [
        "Assumes a standard gravity septic design is permitted.",
        "Assumes well depth within regional norms; not verified.",
      ],
    },
  ],
  unknownConditions: [
    {
      id: "unknown-rock",
      label: "Rock excavation and blasting",
      whyUnknown: "No geotechnical report or site investigation was supplied.",
      question:
        "Has any contractor assessed rock depth or blasting, and how would unsuitable material change their price?",
      relatedScopeId: "excavation-sitework",
    },
    {
      id: "unknown-well-septic",
      label: "Well and septic design, permits and inspection",
      whyUnknown: "No site evaluation, health-department approval or design was supplied.",
      question:
        "Who is responsible for well and septic design and permits, and are any fees included in these proposals?",
      relatedScopeId: "excavation-sitework",
    },
    {
      id: "unknown-engineering",
      label: "Stamped log-system engineering",
      whyUnknown: "No sealed engineering package was supplied with any proposal.",
      question:
        "Will the log manufacturer provide stamped engineering, and who pays for state-specific review or revisions?",
      relatedScopeId: "survey-engineering",
    },
    {
      id: "unknown-tax",
      label: "Sales tax and material tax treatment",
      whyUnknown: "No proposal states whether sales tax is included or how it is applied.",
      question:
        "Are sales taxes included in these totals, and which items are taxed versus exempt?",
    },
    {
      id: "unknown-crane",
      label: "Crane or boom truck for log erection",
      whyUnknown: "No document assigns crane responsibility or pricing.",
      question:
        "Who provides and pays for the crane or boom truck, and what happens if the lot cannot accommodate it?",
      relatedScopeId: "freight-unloading",
    },
    {
      id: "unknown-seasonal",
      label: "Seasonal access and snow removal",
      whyUnknown: "No construction schedule or winter access plan was supplied.",
      question:
        "How would winter access, snow removal or a seasonal shutdown affect schedule and cost?",
    },
    {
      id: "unknown-change-fee",
      label: "Change-order administration fee",
      whyUnknown:
        "Northline's proposal states the fee is determined later; only Sagebrush documents a 10% change value.",
      question:
        "What is the written change-order fee basis in each contract, and are field changes billed differently?",
    },
    {
      id: "unknown-landscaping",
      label: "Final grading, landscaping and restoration",
      whyUnknown: "No landscaping or site-restoration scope appears in any proposal.",
      question: "Who restores disturbed ground and provides final grading after construction?",
    },
    {
      id: "unknown-utility-distance",
      label: "Utility trenching distance and connection fees",
      whyUnknown: "Distance from the road and utility connection points was not supplied.",
      question: "What per-foot trenching and utility connection charges exist for this lot?",
    },
  ],
  changes: [
    {
      id: "change-log-species",
      title: "Upgrade from milled pine to cedar log package",
      description:
        "Owner requested a cedar log package. The supplier documented a material uplift, but labor, crane time and finish rework were not re-quoted.",
      status: "APPROVED",
      baseline: "8-inch milled pine log package (Cascade package baseline)",
      revision: "8-inch cedar log package, same nominal profile",
      documentedDelta: 14800,
      unknownExposure:
        "Installation labor, crane time and sealing labor for the substitute species are not re-priced.",
      scheduleImpact: "Supplier states 3-week lead-time extension; not confirmed by the builder.",
      feeBasis:
        "Cascade states no administration fee; the GC contract's change-order fee is not established.",
      evidence: [
        evidence(
          cascade,
          6,
          "Change options",
          "“Cedar upgrade: add $14,800, subject to lead-time review.”",
        ),
        evidence(
          northline,
          13,
          "Change orders",
          "“Change-order fee to be determined at time of change.”",
          "medium",
        ),
      ],
    },
    {
      id: "change-bath-rough-in",
      title: "Add basement bathroom rough-in",
      description:
        "Owner requested a future basement bathroom. Only a rough-in price was requested; fixtures and finishes are not quoted.",
      status: "REQUESTED",
      baseline: "No basement bathroom rough-in",
      revision: "Basement bathroom rough-in with drain and vent",
      documentedDelta: 6200,
      unknownExposure:
        "Fixtures, wall finishes, door, ventilation and final connection are unpriced.",
      scheduleImpact: "No schedule statement from the builder.",
      feeBasis: "No signed change order; the request is not a committed price.",
      evidence: [
        evidence(
          northline,
          13,
          "Change requests",
          "“Requested rough-in: $6,200, not yet contracted.”",
          "medium",
        ),
      ],
    },
    {
      id: "change-windows",
      title: "Substitute triple-pane windows for double-pane",
      description:
        "A window substitution reduces heating demand but changes the window package and may require HVAC review and rough-opening checks.",
      status: "QUOTED",
      baseline: "Double-pane wood-clad windows (Cascade package)",
      revision: "Triple-pane wood-clad windows",
      documentedDelta: 9400,
      unknownExposure:
        "HVAC sizing review, rough-opening adjustments and finish repair after installation are not priced.",
      scheduleImpact: "Quoted as add 2 weeks for delivery.",
      feeBasis: "Written fee basis for the substitution is not stated.",
      evidence: [
        evidence(cascade, 6, "Change options", "“Triple-pane upgrade: add $9,400.”", "medium"),
        evidence(northline, 12, "HVAC", "“3-ton heat pump” sized before window change."),
      ],
    },
    {
      id: "change-pergola-credit",
      title: "Remove deck pergola",
      description:
        "Owner requested a credit for removing the pergola. The material credit does not account for redesign, restocking or previously released fabrication.",
      status: "DRAFT",
      baseline: "Cedar pergola included in deck scope",
      revision: "Pergola removed; deck framing unchanged",
      documentedDelta: -4100,
      unknownExposure:
        "Possible restocking charge, redesign hours and reduced outdoor shade affecting later owner requests.",
      scheduleImpact: "No schedule change documented.",
      feeBasis: "Credit is described as provisional; no signed change order exists.",
      evidence: [
        evidence(northline, 12, "Deck", "“Pergola option priced separately.”", "low"),
        evidence(sagebrush, 9, "Deck", "“Composite deck and aluminum railings included.”", "low"),
      ],
    },
    {
      id: "change-range-move",
      title: "Move kitchen range to island",
      description:
        "Electrical and gas relocation was quoted and then rejected by the owner. The baseline proposal remains unchanged.",
      status: "REJECTED",
      baseline: "Range at exterior wall with downdraft",
      revision: "Range relocated to island with new venting",
      documentedDelta: 3800,
      unknownExposure:
        "No exposure because the change was rejected; confirm the rejection in writing.",
      scheduleImpact: "None reported.",
      feeBasis: "Rejected change orders should not appear as committed costs.",
      evidence: [
        evidence(
          sagebrush,
          10,
          "Change log",
          "“Range relocation quote $3,800 — rejected by owner.”",
          "medium",
        ),
      ],
    },
  ],
  risks: [
    {
      id: "risk-flood",
      topic: "Flood hazard screening",
      observation:
        "Not evaluated. No live flood-map lookup was performed for this synthetic project.",
      status: "not_evaluated",
      sourceName: "FEMA National Flood Hazard Layer (reference link)",
      sourceUrl: "https://www.fema.gov/national-flood-hazard-layer-nfhl",
      resolution: "ZIP-level demo placeholder only; effective flood-map data was not queried.",
      retrievedAt: "2026-10-20",
      limitations:
        "Coverage varies. A missing map match is not proof of no flood risk, and this is not a parcel determination or insurance substitute.",
      customerAction: "Request a flood determination and insurance quote for the specific parcel.",
      demoPlaceholder: true,
    },
    {
      id: "risk-seismic",
      topic: "Seismic context",
      observation:
        "Regional seismic-hazard context is not assessed in this demo. No live USGS query was performed.",
      status: "not_evaluated",
      sourceName: "USGS National Seismic Hazard Model (reference link)",
      sourceUrl:
        "https://www.usgs.gov/programs/earthquake-hazards/science/national-seismic-hazard-maps",
      resolution: "Regional reference only; not a code seismic design category.",
      retrievedAt: "2026-10-20",
      limitations:
        "Seismic design maps do not replace the adopted code, geotechnical review or structural engineering.",
      customerAction:
        "Confirm the adopted code seismic requirements with the building department and designer.",
      demoPlaceholder: true,
    },
    {
      id: "risk-landslide",
      topic: "Landslide susceptibility",
      observation: "Not evaluated. Slope and soil conditions were not screened.",
      status: "not_evaluated",
      sourceName: "USGS Landslide Inventory and Susceptibility (reference link)",
      sourceUrl: "https://www.usgs.gov/tools/us-landslide-inventory-and-susceptibility-map",
      resolution: "Nationwide modeled data only; not a site geotechnical evaluation.",
      retrievedAt: "2026-10-20",
      limitations:
        "Modeled susceptibility cannot confirm or rule out a site-specific landslide hazard.",
      customerAction:
        "Commission a geotechnical review for the building pad, access road and drainage.",
      demoPlaceholder: true,
    },
    {
      id: "risk-wildfire",
      topic: "Wildfire and wildland-urban interface",
      observation:
        "Not evaluated. No wildfire exposure screening or local WUI designation was checked.",
      status: "not_evaluated",
      sourceName: "Local fire authority and state wildfire agency (jurisdiction-specific)",
      sourceUrl: "https://www.nfpa.org/",
      resolution: "No geographic screening performed.",
      retrievedAt: "2026-10-20",
      limitations:
        "Local requirements, defensible space and access standards must be confirmed with the authority having jurisdiction.",
      customerAction:
        "Ask the building department and fire authority about WUI requirements and access standards.",
      demoPlaceholder: true,
    },
    {
      id: "risk-access",
      topic: "Site access and seasonal conditions",
      observation:
        "Owner reports a steep gravel driveway and seasonal snow. No professional assessment was supplied.",
      status: "customer_report",
      sourceName: "Synthetic intake form (customer-reported)",
      sourceUrl: "#synthetic-intake",
      resolution: "Customer-reported only; not verified or measured.",
      retrievedAt: "2026-10-20",
      limitations:
        "Access, turning radius, grade and bridge capacity have not been evaluated for delivery vehicles.",
      customerAction:
        "Ask suppliers to confirm truck, crane and delivery access before quoting freight.",
      demoPlaceholder: true,
    },
    {
      id: "risk-elevation",
      topic: "Elevation reference",
      observation: "Not evaluated. No elevation point was queried in this demo.",
      status: "not_evaluated",
      sourceName: "USGS 3DEP / EPQS (reference link)",
      sourceUrl: "https://epqs.nationalmap.gov/v1/docs",
      resolution: "Single-point elevation would not describe parcel slope or excavation volumes.",
      retrievedAt: "2026-10-20",
      limitations: "A point elevation is not a topographic survey or an excavation estimate.",
      customerAction:
        "Request a site survey if grading or foundation elevations affect the contract.",
      demoPlaceholder: true,
    },
  ],
  findings: [
    {
      id: "finding-comparability",
      priority: 1,
      title: "The three headline totals are not comparable",
      detail:
        "Cascade's $231,500 is a materials-only package. Northline's $486,000 is a fixed-price installed proposal. Sagebrush's $418,900 is a cost-plus line-item estimate with a higher payment schedule. Comparing the headline numbers directly would be misleading.",
      audience: "All three bidders",
      question:
        "Please confirm in writing exactly which scope, installation, freight and permit responsibilities are included at your quoted price.",
      status: "extracted",
      evidence: [
        evidence(northline, 2, "Contract sum", "“Total contract sum: $486,000.”"),
        evidence(cascade, 1, "Base package", "“Package total: $231,500 delivered.”"),
        evidence(sagebrush, 4, "Estimate summary", "“Estimated cost: $418,900.”"),
      ],
    },
    {
      id: "finding-schedule-gap",
      priority: 2,
      title: "Sagebrush payment schedule exceeds its own line-item total by $11,500",
      detail:
        "The estimate summary totals $418,900, while the payment milestones total $430,400. The difference must be explained in writing before signing.",
      audience: "Sagebrush Construction",
      question:
        "Your payment schedule totals $430,400 but the estimate line items total $418,900. What does the $11,500 difference cover?",
      status: "extracted",
      evidence: [
        evidence(sagebrush, 4, "Estimate summary", "“Estimated cost: $418,900.”"),
        evidence(
          sagebrush,
          10,
          "Payment schedule",
          "“Payments total $430,400 across five milestones.”",
        ),
      ],
    },
    {
      id: "finding-freight",
      priority: 3,
      title: "No proposal assigns freight, crane or unloading responsibility",
      detail:
        "Freight or unloading for a log package on a steep rural lot is unassigned across all three documents. This is a checklist question, not a confirmed quote term.",
      audience: "All three bidders",
      question:
        "Who pays for freight, crane or boom truck, and unloading at the site, and is that amount fixed in your quote?",
      status: "checklist_question",
      evidence: [],
    },
    {
      id: "finding-species",
      priority: 4,
      title: "Log species and roof material conflict between proposals",
      detail:
        "Northline and Cascade price milled pine with architectural shingles; Sagebrush prices cedar with a metal roof.",
      audience: "All three bidders",
      question:
        "Which log species and roofing material are included in your price, and what is the documented cost if the owner selects a different option?",
      status: "extracted",
      evidence: [
        evidence(sagebrush, 7, "Log system", "“8-inch cedar log wall system installed.”"),
        evidence(
          northline,
          7,
          "Log system",
          "“8-inch milled pine log wall system, delivered and erected.”",
        ),
        evidence(sagebrush, 8, "Roofing", "“Standing-seam metal roof with ice-and-water shield.”"),
      ],
    },
    {
      id: "finding-hvac",
      priority: 5,
      title: "HVAC equipment sizes conflict and no load calculation was supplied",
      detail:
        "Northline prices a 3-ton heat pump; Sagebrush prices 4 tons. The correct size cannot be determined from the documents.",
      audience: "Northline Builders and Sagebrush Construction",
      question:
        "Can you provide the Manual J load calculation that supports your proposed heat-pump size?",
      status: "extracted",
      evidence: [
        evidence(
          northline,
          12,
          "HVAC",
          "“3-ton heat pump, 10 kW backup heat and HRV ventilation.”",
        ),
        evidence(sagebrush, 8, "HVAC", "“4-ton heat pump with electric backup.”", "medium"),
      ],
    },
    {
      id: "finding-allowances",
      priority: 6,
      title: "Allowances are placeholders, not fixed prices",
      detail:
        "Northline includes cabinetry and tile allowances; Sagebrush includes a lighting allowance. Selections above the allowance may increase the price.",
      audience: "Northline Builders and Sagebrush Construction",
      question:
        "What happens if selections exceed the stated allowance, and how and when will the final amount be documented?",
      status: "extracted",
      evidence: [
        evidence(
          northline,
          9,
          "Allowances",
          "“$18,000 cabinetry allowance; final selection may increase price.”",
        ),
        evidence(
          sagebrush,
          7,
          "Allowances",
          "“$12,500 lighting allowance by owner selection.”",
          "medium",
        ),
      ],
    },
    {
      id: "finding-change-fee",
      priority: 7,
      title: "Change-order fees are not established in every contract",
      detail:
        "Northline states the fee will be determined at the time of change. Sagebrush documents 10% of change value. Cascade states no administration fee for its package option.",
      audience: "Northline Builders",
      question:
        "What is the written change-order fee basis in the contract, and does it apply to owner-requested and unforeseen-site changes differently?",
      status: "extracted",
      evidence: [
        evidence(
          northline,
          13,
          "Change orders",
          "“Change-order fee to be determined at time of change.”",
          "medium",
        ),
        evidence(
          sagebrush,
          11,
          "Change orders",
          "“Change-order administration fee: 10% of change value.”",
          "medium",
        ),
      ],
    },
    {
      id: "finding-expiration",
      priority: 8,
      title: "Quotes expire on different dates",
      detail:
        "Northline expires in 30 days, Cascade in 45 days and Sagebrush in 90 days. Material and labor pricing may change after expiration.",
      audience: "All three bidders",
      question:
        "Can you confirm pricing validity dates and what changes if we need to extend them?",
      status: "extracted",
      evidence: [
        evidence(northline, 14, "Validity", "“Pricing valid 30 days.”", "medium"),
        evidence(cascade, 9, "Validity", "“Quote valid 45 days.”", "medium"),
        evidence(sagebrush, 11, "Validity", "“Estimate valid 90 days.”", "medium"),
      ],
    },
  ],
  arithmeticNotes: [
    {
      id: "arithmetic-schedule",
      label: "Sagebrush payment schedule mismatch",
      detail:
        "Line items total $418,900; payment schedule totals $430,400. The $11,500 difference is flagged as a discrepancy, not added to the known cost.",
      evidence: [
        evidence(sagebrush, 4, "Estimate summary", "“Estimated cost: $418,900.”"),
        evidence(
          sagebrush,
          10,
          "Payment schedule",
          "“Payments total $430,400 across five milestones.”",
        ),
      ],
    },
    {
      id: "arithmetic-allowances",
      label: "Allowances are inside the headline totals",
      detail:
        "Stated allowances are shown separately but are not added again to the contract sum. Adding them would double count them.",
      evidence: [
        evidence(
          northline,
          9,
          "Allowances",
          "“$18,000 cabinetry allowance; final selection may increase price.”",
        ),
      ],
    },
    {
      id: "arithmetic-materials",
      label: "Materials-only total is not an installed total",
      detail:
        "The Cascade package does not include erection, foundation, trades or sitework. Its total is shown as a materials-only known cost, never compared as if it were a turnkey price.",
      evidence: [
        evidence(
          cascade,
          2,
          "Exclusions",
          "“Not included: permits, engineering, foundation, erection or trade installation.”",
        ),
      ],
    },
  ],
};
