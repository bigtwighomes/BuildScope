import Link from "next/link";

const STEPS = [
  {
    title: "Set up the project",
    body: "Choose a whole-home, materials-package or bathroom review and add an optional location for the screening checklist.",
  },
  {
    title: "Add the proposals",
    body: "Upload up to three text-based PDFs. BuildScope validates every file and names anything it rejects.",
  },
  {
    title: "Review the extraction",
    body: "Check fields, line items, totals and scope categories. Corrections stay marked and keep their source evidence.",
  },
  {
    title: "Compare and question",
    body: "See scope, responsibility, costs, change exposure and open questions side by side without treating missing scope as zero.",
  },
  {
    title: "Print or save the report",
    body: "Take a clear evidence-linked report and a prioritized question list to your contractor conversation.",
  },
];

export default function HomePage() {
  return (
    <main className="landing">
      <header className="landing-nav">
        <span className="app-brand app-brand-static">
          <span className="brand-mark" aria-hidden="true">
            BS
          </span>
          <span>
            <strong>BuildScope Check</strong>
            <small>Proposal review</small>
          </span>
        </span>
        <nav aria-label="Primary">
          <Link className="button button-secondary button-small" href="/analyze?sample=1">
            See a synthetic example
          </Link>
          <Link className="button button-primary button-small" href="/analyze">
            Start a review
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <p className="eyebrow">Evidence-linked proposal comparison</p>
        <h1>Compare construction proposals by scope, not headline price.</h1>
        <p className="lede">
          A materials-only kit, an installed fixed-price bid and a cost-plus estimate cannot be
          compared by their totals. BuildScope turns supplied proposals into scope status,
          responsibility assignments, evidence spans, change exposure and prioritized questions.
        </p>
        <p className="lede">
          The review is deterministic and five steps long. Every extracted claim links to the
          document, page, section and quoted span. Corrections stay visible, and unknown or unpriced
          scope is never treated as zero.
        </p>
        <div className="button-row">
          <Link className="button button-primary" href="/analyze">
            Start a proposal review
          </Link>
          <Link className="button button-secondary" href="/analyze?sample=1">
            Explore the synthetic example
          </Link>
        </div>
        <p className="hero-note" role="note">
          <strong>Local review tool.</strong> Upload text-based PDFs for review only. There is no
          OCR, AI extraction, file persistence, live payment or licensed cost data. Do not upload
          confidential documents, and treat nothing here as a real quote or professional advice.
        </p>
      </section>

      <section className="landing-preview" aria-labelledby="steps-title">
        <div className="landing-preview-head">
          <div>
            <p className="eyebrow">Five steps</p>
            <h2 id="steps-title">From PDFs to a clearer conversation</h2>
          </div>
          <span className="tag tag-warning">Synthetic example available</span>
        </div>
        <div className="landing-pillars landing-steps">
          {STEPS.map((step, index) => (
            <article key={step.title}>
              <p className="step-number">Step {index + 1}</p>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-pillars" aria-label="Product principles">
        <article>
          <h3>Evidence first</h3>
          <p>
            Material findings trace to a document, page, section and quoted span. Statements without
            usable evidence stay visible as checklist questions.
          </p>
        </article>
        <article>
          <h3>Unknown is never zero</h3>
          <p>
            Stated costs, excluded scope and unpriced conditions stay separate. Missing scope is
            exposure, not a silent omission.
          </p>
        </article>
        <article>
          <h3>Changes stay honest</h3>
          <p>
            Requested, quoted, approved and rejected changes are distinguished. Baselines are kept,
            and unknown fee or schedule exposure is labeled as unknown.
          </p>
        </article>
        <article>
          <h3>Licensed data or none</h3>
          <p>
            Cost-data mode defaults to OFF. Localized dollar ranges only appear when defensible,
            written data rights exist.
          </p>
        </article>
      </section>

      <section className="landing-status" id="what-is-not-active" aria-labelledby="status-title">
        <h2 id="status-title">What is not active in this build</h2>
        <ul>
          <li>No OCR or AI extraction; scanned and image-only PDFs are rejected.</li>
          <li>No document storage, accounts, checkout or paid report delivery.</li>
          <li>No live Census, FEMA, USGS, USITC or BLS integration or screening lookup.</li>
          <li>No Craftsman, RSMeans or other licensed cost data.</li>
          <li>No legal, engineering, inspection or code-compliance advice.</li>
        </ul>
        <p className="pricing-hypothesis">
          <strong>Pilot pricing hypothesis (not active):</strong> a one-time core report in the
          $49-$79 range, with any licensed-cost-data report tested later. No payment can be made in
          this build.
        </p>
      </section>

      <footer className="landing-footer">
        <p>
          BuildScope Check. Planning reference only. It compares the provided documents and does not
          establish final project cost, certify design or code compliance, inspect the property or
          determine legal rights.
        </p>
      </footer>
    </main>
  );
}
