import Link from "next/link";
import { formatUsd, summarizeCosts } from "@/lib/demo/analysis";
import { demoProject } from "@/lib/demo/project";

const previewRows = demoProject.scopeRows.filter((row) =>
  ["log-package", "freight-unloading", "hvac"].includes(row.id),
);

export default function HomePage() {
  const costs = summarizeCosts(demoProject);

  return (
    <main className="landing">
      <header className="landing-nav">
        <span className="app-brand app-brand-static">
          <span className="brand-mark" aria-hidden="true">
            BS
          </span>
          <span>
            <strong>BuildScope Check</strong>
            <small>Quote intelligence</small>
          </span>
        </span>
        <nav aria-label="Primary">
          <Link className="button button-secondary button-small" href="/demo">
            Open the P2 demo
          </Link>
          <Link className="button button-primary button-small" href="/analyze">
            Try the P3 document lab
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <p className="eyebrow">Evidence-linked proposal comparison</p>
        <h1>Compare construction proposals by scope, not headline price.</h1>
        <p className="lede">
          A materials-only kit, an installed fixed-price bid and a cost-plus estimate cannot be
          compared by their totals. BuildScope turns supplied proposals into scope status,
          responsibility assignments, evidence spans, change-order exposure and prioritized
          questions.
        </p>
        <p className="lede">
          The P3 lab now validates and extracts text-based PDFs deterministically, then links each
          finding to the document, page, section and quoted span. Corrections stay visible, and
          unknown scope is never treated as zero.
        </p>
        <div className="button-row">
          <Link className="button button-primary" href="/analyze">
            Analyze synthetic PDFs
          </Link>
          <Link className="button button-secondary" href="/demo">
            Explore the P2 demo
          </Link>
        </div>
        <p className="hero-note" role="note">
          <strong>This is a synthetic P2/P3 lab.</strong> Upload text-based PDFs for local testing
          only. There is no OCR, AI extraction, file persistence, live payment or licensed cost
          data. Do not upload confidential documents, and treat nothing here as a real quote.
        </p>
      </section>

      <section className="landing-preview" aria-labelledby="preview-title">
        <div className="landing-preview-head">
          <div>
            <p className="eyebrow">P2 demo fixture preview</p>
            <h2 id="preview-title">{demoProject.name}</h2>
          </div>
          <span className="tag tag-warning">All data synthetic</span>
        </div>

        <div className="preview-grid">
          {demoProject.documents.map((document) => {
            const summary = costs.find((entry) => entry.proposalId === document.id);
            return (
              <article className="preview-card" key={document.id}>
                <p className="proposal-basis">{document.pricingBasis.replace("_", " ")}</p>
                <h3>{document.bidder}</h3>
                <p className="preview-amount">{formatUsd(document.headlineAmount)}</p>
                <p className="preview-note">{document.comparabilityNote}</p>
                <p className="preview-meta">
                  {summary
                    ? `${formatUsd(summary.allowancesTotal)} allowances inside total`
                    : "No cost rows"}
                </p>
              </article>
            );
          })}
        </div>

        <div
          className="table-wrap"
          role="region"
          aria-label="Scrollable demo scope preview table"
          tabIndex={0}
        >
          <table className="scope-table preview-table">
            <caption className="visually-hidden">
              Preview of three scope classifications from the synthetic fixture
            </caption>
            <thead>
              <tr>
                <th scope="col">Scope area</th>
                {demoProject.documents.map((document) => (
                  <th scope="col" key={document.id}>
                    {document.bidder}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{row.area}</th>
                  {demoProject.documents.map((document) => {
                    const cell = row.cells[document.id];
                    return (
                      <td key={document.id}>
                        <span
                          className={`badge badge-scope-${cell?.status.toLowerCase() ?? "not_specified"}`}
                        >
                          {cell?.status.replaceAll("_", " ").toLowerCase() ?? "not applicable"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
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
            Known costs, planning ranges and unpriced conditions are shown in separate sections.
            Missing scope is exposure, not a silent omission.
          </p>
        </article>
        <article>
          <h3>Changes stay honest</h3>
          <p>
            Requested, quoted, approved and rejected changes are distinguished. Baselines are
            preserved, and unknown change-order fees are labeled as unknown.
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
          <li>No live Census, FEMA, USGS, USITC or BLS integration.</li>
          <li>No Craftsman, RSMeans or other licensed cost data.</li>
          <li>No legal, engineering, inspection or code-compliance advice.</li>
        </ul>
        <p className="pricing-hypothesis">
          <strong>Pilot pricing hypothesis (not active):</strong> a one-time core report in the
          $49–$79 range, with any licensed-cost-data report tested later. No payment can be made in
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
