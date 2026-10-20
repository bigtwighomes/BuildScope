"use client";

import { formatDelta, formatUsd, summarizeCosts } from "@/lib/demo/analysis";
import type { DemoProject } from "@/lib/demo/types";
import { DemoBadge, ScopeBadge, SectionCard } from "./shared";

export function ReportView({ project }: { readonly project: DemoProject }) {
  const summaries = summarizeCosts(project);

  return (
    <div className="view-stack">
      <SectionCard
        title="Report preview"
        description="The on-screen preview mirrors the printable report. Print or save as PDF using your browser's print dialog."
        aside={<DemoBadge>Preview</DemoBadge>}
      >
        <div className="button-row no-print">
          <button type="button" className="button button-primary" onClick={() => window.print()}>
            Print or save as PDF
          </button>
          <p className="print-hint">
            Browser printing works today. A server-generated entitled PDF is a later, gated
            milestone.
          </p>
        </div>
      </SectionCard>

      <article className="report">
        <header className="report-cover">
          <p className="report-kicker">BuildScope Check · Synthetic analysis report</p>
          <h1>{project.name}</h1>
          <p className="report-subtitle">{project.projectType}</p>
          <dl className="report-cover-meta">
            <div>
              <dt>Report ID</dt>
              <dd>DEMO-0001</dd>
            </div>
            <div>
              <dt>Report date</dt>
              <dd>2026-10-20</dd>
            </div>
            <div>
              <dt>Analysis status</dt>
              <dd>Demo fixture — not a real analysis</dd>
            </div>
            <div>
              <dt>Cost-data mode</dt>
              <dd>OFF — no licensed cost data</dd>
            </div>
          </dl>
          <p className="report-notice">{project.syntheticNotice}</p>
        </header>

        <section className="report-section">
          <h2>1 · Executive summary</h2>
          <p>
            The three supplied proposals use different pricing bases and cannot be compared by
            headline total. Northline Builders prices an installed fixed-price package, Cascade
            Timber Works prices materials only, and Sagebrush Construction prices a cost-plus
            estimate whose payment schedule exceeds its own line items by $11,500.
          </p>
          <p>
            Unpriced items stay visible. No defensible localized dollar range is available because
            no licensed cost data is active.
          </p>
        </section>

        <section className="report-section">
          <h2>2 · Document inventory</h2>
          <ul>
            {project.documents.map((document) => (
              <li key={document.id}>
                <strong>{document.documentTitle}</strong> — {document.documentDate},{" "}
                {document.pageCount} pages, {document.pricingBasis.replace("_", " ")}, headline{" "}
                {formatUsd(document.headlineAmount)}.
              </li>
            ))}
          </ul>
        </section>

        <section className="report-section">
          <h2>3 · Known document-based totals</h2>
          <div
            className="table-wrap"
            role="region"
            aria-label="Scrollable known totals table"
            tabIndex={0}
          >
            <table className="report-table">
              <thead>
                <tr>
                  <th scope="col">Proposal</th>
                  <th scope="col">Quoted sum</th>
                  <th scope="col">Allowances inside total</th>
                  <th scope="col">Documented discrepancy</th>
                </tr>
              </thead>
              <tbody>
                {project.documents.map((document) => {
                  const summary = summaries.find((entry) => entry.proposalId === document.id);
                  return (
                    <tr key={document.id}>
                      <th scope="row">{document.bidder}</th>
                      <td>{summary ? formatUsd(summary.quotedTotal) : "—"}</td>
                      <td>{summary ? formatUsd(summary.allowancesTotal) : "—"}</td>
                      <td>{summary ? formatUsd(summary.discrepanciesTotal) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="report-footnote">
            Allowances are shown inside the headline total and are not added again. The Sagebrush
            discrepancy is flagged, not summed into a project cost.
          </p>
        </section>

        <section className="report-section">
          <h2>4 · Scope classifications</h2>
          <div
            className="table-wrap"
            role="region"
            aria-label="Scrollable report scope table"
            tabIndex={0}
          >
            <table className="report-table">
              <thead>
                <tr>
                  <th scope="col">Scope area</th>
                  {project.documents.map((document) => (
                    <th scope="col" key={document.id}>
                      {document.bidder}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {project.scopeRows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">{row.area}</th>
                    {project.documents.map((document) => {
                      const cell = row.cells[document.id];
                      return (
                        <td key={document.id}>
                          {cell ? <ScopeBadge status={cell.status} /> : <span>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-section">
          <h2>5 · Change-order consequences</h2>
          <ul>
            {project.changes.map((change) => (
              <li key={change.id}>
                <strong>{change.title}</strong> — status {change.status.toLowerCase()}
                {change.documentedDelta !== undefined
                  ? `, documented delta ${formatDelta(change.documentedDelta)}`
                  : ""}
                . Unknown exposure: {change.unknownExposure}
              </li>
            ))}
          </ul>
        </section>

        <section className="report-section">
          <h2>6 · Unpriced and unknown conditions</h2>
          <ul>
            {project.unknownConditions.map((condition) => (
              <li key={condition.id}>
                <strong>{condition.label}</strong> — {condition.whyUnknown}
              </li>
            ))}
          </ul>
        </section>

        <section className="report-section">
          <h2>7 · Location and hazard screening</h2>
          <p>
            No live screening was performed. FEMA, USGS, Census and jurisdiction checks are all
            marked not evaluated in the demo. A real report would show source, resolution, retrieval
            date and limitations for each observation.
          </p>
        </section>

        <section className="report-section">
          <h2>8 · Methodology and limitations</h2>
          <p>
            This is a synthetic fixture created to test interface behavior. It contains no real
            bids, customers or market prices. BuildScope Check compares supplied documents and shows
            evidence spans; it does not establish final project cost, certify design or code
            compliance, inspect the property, determine legal rights or replace a contractor,
            engineer, surveyor, geotechnical professional or attorney.
          </p>
          <p>
            Unknown and unpriced scope is never assumed to cost zero. Confirm scope, pricing,
            responsibilities and any changes in writing with qualified parties before committing
            funds.
          </p>
        </section>
      </article>
    </div>
  );
}
