"use client";

import type { Analysis } from "@/lib/documents/types";
import {
  PRICING_BASIS_LABELS,
  PROJECT_TYPE_LABELS,
  RESPONSIBILITY_ROLE_LABELS,
  SCOPE_CATEGORY_LABELS,
} from "@/lib/documents/types";
import { formatMoneyCents, formatPercent } from "@/lib/documents/money";
import { PartyBadge, ScopeBadge, documentLabel } from "./shared";

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-US");
}

export function ReportPanel({
  analysis,
  projectName: suppliedProjectName,
}: {
  readonly analysis: Analysis;
  readonly projectName?: string;
}) {
  const projectName =
    suppliedProjectName?.trim() ||
    analysis.documents.find((document) => document.projectName.value)?.projectName.value ||
    "Untitled proposal comparison";

  return (
    <div className="view-stack">
      <div className="report-toolbar no-print">
        <button type="button" className="button button-primary" onClick={() => window.print()}>
          Print / save as PDF
        </button>
        <p className="print-hint">
          The printed report includes the source evidence shown below. Use the browser print dialog
          and choose “Save as PDF”.
        </p>
      </div>

      <article className="report" id="analysis-report">
        <header className="report-cover">
          <p className="report-kicker">BuildScope Check - evidence-linked comparison</p>
          <h1>{projectName}</h1>
          <p className="report-subtitle">
            {PROJECT_TYPE_LABELS[analysis.projectType]} - {analysis.analysisId}
          </p>
          {analysis.location.trim() ? (
            <p className="report-subtitle">Unverified project location: {analysis.location}</p>
          ) : null}
          <p className="report-subtitle">Generated {formatTimestamp(analysis.generatedAt)}</p>
          <p className="report-notice">
            <strong>
              {analysis.provenance.dataClassification === "bundled-synthetic-fixture"
                ? "Synthetic example report."
                : "User-supplied document report."}
            </strong>{" "}
            {analysis.provenance.dataClassification === "bundled-synthetic-fixture"
              ? "All documents, parties and amounts are fictional fixtures."
              : "The uploaded documents and extracted statements are unverified."}{" "}
            This is not a real quote, contract, legal opinion or professional cost estimate. No AI
            extraction, OCR, paid cost data or live payments were used.
          </p>
        </header>

        <section className="report-section">
          <h2>1. Documents and extraction</h2>
          {analysis.documents.length === 0 ? (
            <p>No documents passed validation.</p>
          ) : (
            <div
              className="table-wrap"
              tabIndex={0}
              role="region"
              aria-label="Report document register"
            >
              <table className="report-table">
                <thead>
                  <tr>
                    <th scope="col">Document</th>
                    <th scope="col">Pricing basis</th>
                    <th scope="col">Pages</th>
                    <th scope="col">Line items</th>
                    <th scope="col">Stated total</th>
                    <th scope="col">Extraction</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.documents.map((document) => (
                    <tr key={document.id}>
                      <th scope="row">
                        {documentLabel(document)}
                        <span className="th-sub">{document.fileName}</span>
                      </th>
                      <td>
                        {document.pricingBasis.value
                          ? PRICING_BASIS_LABELS[document.pricingBasis.value]
                          : "Unknown"}
                      </td>
                      <td>{document.pageCount}</td>
                      <td>{document.lineItems.length}</td>
                      <td>
                        {document.statedTotalCents.value === null
                          ? "Not stated"
                          : formatMoneyCents(document.statedTotalCents.value)}
                      </td>
                      <td>
                        {document.extractionStatus === "complete" ? "Complete" : "Partial"}
                        {document.unreadablePages.length > 0
                          ? ` (unreadable pages ${document.unreadablePages.join(", ")})`
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {analysis.rejections.length > 0 ? (
            <div className="report-rejections">
              <h3>Not analyzed</h3>
              <ul>
                {analysis.rejections.map((rejection, index) => (
                  <li key={`${rejection.fileName}-${index}`}>
                    <strong>{rejection.fileName}</strong> — {rejection.code.replaceAll("_", " ")}:{" "}
                    {rejection.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="report-section">
          <h2>2. Findings and questions</h2>
          {analysis.findings.length === 0 ? (
            <p>No findings were produced.</p>
          ) : (
            <ol className="finding-list report-findings">
              {analysis.findings.map((finding) => (
                <li className="finding-item" key={finding.id}>
                  <div className="finding-head">
                    <span className="priority-pill">Priority {finding.priority}</span>
                    <h3>{finding.title}</h3>
                    <span
                      className={`tag ${
                        finding.status === "extracted"
                          ? "tag-evidence"
                          : finding.status === "security"
                            ? "tag-warning"
                            : "tag-question"
                      }`}
                    >
                      {finding.status === "security"
                        ? "Security"
                        : finding.status === "extracted"
                          ? "Evidence-linked"
                          : "Checklist question"}
                    </span>
                  </div>
                  <p>{finding.detail}</p>
                  <p>
                    <strong>Ask {finding.audience}:</strong> {finding.question}
                  </p>
                  {finding.evidence.length === 0 ? (
                    <p className="evidence-empty">No source evidence — checklist question only.</p>
                  ) : (
                    <ul className="report-evidence">
                      {finding.evidence.map((evidence, index) => {
                        const document = analysis.documents.find(
                          (candidate) => candidate.id === evidence.documentId,
                        );
                        return (
                          <li key={`${finding.id}-${index}`}>
                            <span>
                              {document ? documentLabel(document) : evidence.documentId}, page{" "}
                              {evidence.page}, {evidence.section}
                            </span>
                            <blockquote>{evidence.span}</blockquote>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="report-section">
          <h2>3. Scope comparison</h2>
          {analysis.documents.length === 0 ? (
            <p>No scope comparison is available.</p>
          ) : (
            <div
              className="table-wrap"
              tabIndex={0}
              role="region"
              aria-label="Report scope comparison table"
            >
              <table className="report-table">
                <thead>
                  <tr>
                    <th scope="col">Scope area</th>
                    {analysis.documents.map((document) => (
                      <th scope="col" key={document.id}>
                        {documentLabel(document)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysis.comparisonRows.map((row) => (
                    <tr key={row.category}>
                      <th scope="row">{row.label}</th>
                      {analysis.documents.map((document) => {
                        const cell = row.cells[document.id];
                        return (
                          <td key={document.id}>
                            {cell ? <ScopeBadge status={cell.status} /> : null}
                            <p className="cell-note">{cell?.note}</p>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="report-section">
          <h2>4. Responsibilities</h2>
          {analysis.documents.length === 0 ? (
            <p>No responsibilities are available.</p>
          ) : (
            <div
              className="table-wrap"
              tabIndex={0}
              role="region"
              aria-label="Report responsibility table"
            >
              <table className="report-table">
                <thead>
                  <tr>
                    <th scope="col">Responsibility</th>
                    {analysis.documents.map((document) => (
                      <th scope="col" key={document.id}>
                        {documentLabel(document)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysis.responsibilities.map((row) => (
                    <tr key={row.role}>
                      <th scope="row">{RESPONSIBILITY_ROLE_LABELS[row.role]}</th>
                      {analysis.documents.map((document) => (
                        <td key={document.id}>
                          <PartyBadge party={row.cells[document.id]?.party ?? "unknown"} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="report-section">
          <h2>5. Costs and arithmetic</h2>
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Report cost and arithmetic table"
          >
            <table className="report-table">
              <thead>
                <tr>
                  <th scope="col">Document</th>
                  <th scope="col">Stated total</th>
                  <th scope="col">Subtotal</th>
                  <th scope="col">Tax</th>
                  <th scope="col">Arithmetic</th>
                  <th scope="col">Allowances</th>
                  <th scope="col">Excluded scope</th>
                </tr>
              </thead>
              <tbody>
                {analysis.documents.map((document) => {
                  const check = analysis.arithmetic.find(
                    (candidate) => candidate.documentId === document.id,
                  );
                  const allowances = document.allowances.reduce(
                    (sum, allowance) => sum + allowance.amountCents,
                    0,
                  );
                  const excluded = analysis.comparisonRows.filter((row) => {
                    const status = row.cells[document.id]?.status;
                    return status === "EXCLUDED" || status === "SEPARATELY_CONTRACTED";
                  });
                  return (
                    <tr key={document.id}>
                      <th scope="row">{documentLabel(document)}</th>
                      <td>
                        {document.statedTotalCents.value === null
                          ? "Not stated"
                          : formatMoneyCents(document.statedTotalCents.value)}
                      </td>
                      <td>
                        {check
                          ? check.lineItemCount === 0
                            ? "No line items"
                            : formatMoneyCents(check.lineItemSubtotalCents)
                          : "Not available"}
                      </td>
                      <td>
                        {document.tax.amountCents === null
                          ? "Not stated"
                          : formatMoneyCents(document.tax.amountCents)}
                        {document.tax.ratePercent !== null
                          ? ` (${formatPercent(Math.round(document.tax.ratePercent * 100))})`
                          : ""}
                      </td>
                      <td>
                        {check?.status === "matches"
                          ? "Reconciles"
                          : check?.status === "discrepancy"
                            ? `${formatMoneyCents(check.totalDeltaCents ?? 0)} difference`
                            : "Insufficient data"}
                      </td>
                      <td>{allowances === 0 ? "None" : formatMoneyCents(allowances)}</td>
                      <td>
                        {excluded.length === 0
                          ? "None"
                          : excluded.map((row) => SCOPE_CATEGORY_LABELS[row.category]).join("; ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="report-footnote">
            Unknown or unpriced scope is not added as zero. Excluded scope is listed but not valued.
          </p>
        </section>

        <section className="report-section">
          <h2>6. Change and revision register</h2>
          {analysis.changes.length === 0 ? (
            <p>No customer-reported change requests were recorded for this review.</p>
          ) : (
            <div
              className="table-wrap"
              tabIndex={0}
              role="region"
              aria-label="Report change register"
            >
              <table className="report-table">
                <thead>
                  <tr>
                    <th scope="col">Change</th>
                    <th scope="col">Status</th>
                    <th scope="col">Documented change</th>
                    <th scope="col">Schedule impact</th>
                    <th scope="col">Unknown exposure</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.changes.map((change) => (
                    <tr key={change.id}>
                      <th scope="row">
                        {change.title}
                        <span className="th-sub">{change.description}</span>
                      </th>
                      <td>{change.status}</td>
                      <td>
                        {change.documentedDeltaCents === null
                          ? "Not priced"
                          : formatMoneyCents(change.documentedDeltaCents)}
                      </td>
                      <td>{change.scheduleImpact || "Not stated"}</td>
                      <td>{change.unknownExposure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="report-footnote">
            Change entries are customer-reported working notes. They are not extracted contract
            terms, approved change orders or a legal determination.
          </p>
        </section>

        <section className="report-section">
          <h2>7. Site and project screening questions</h2>
          <p>
            No screening lookup was performed. These are open questions, not findings about the
            property or any contractor.
          </p>
          <ul>
            {analysis.risks.map((risk) => (
              <li key={risk.id}>
                <strong>{risk.topic}:</strong> {risk.observation} Status:{" "}
                {risk.status.replaceAll("_", " ")}.
                <br />
                Source:{" "}
                {risk.sourceUrl ? (
                  <a href={risk.sourceUrl} target="_blank" rel="noreferrer">
                    {risk.sourceName}
                  </a>
                ) : (
                  risk.sourceName
                )}
                . Version or date: {risk.versionOrDate}. Retrieved:{" "}
                {risk.retrievedAt ?? "Not retrieved"}.
                <br />
                Resolution: {risk.resolution}
                <br />
                Limitation: {risk.limitations}
                <br />
                Next step: {risk.customerAction}
              </li>
            ))}
          </ul>
        </section>

        <section className="report-section">
          <h2>8. Limitations</h2>
          <ul>
            {analysis.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </section>

        <footer className="report-footnote">
          <p>
            BuildScope Check report - {analysis.analysisId} - {analysis.metrics.evidenceReferences}{" "}
            evidence references - {analysis.metrics.findings} findings -{" "}
            {analysis.metrics.suspiciousSpans} ignored instruction-like spans.
          </p>
        </footer>
      </article>
    </div>
  );
}
