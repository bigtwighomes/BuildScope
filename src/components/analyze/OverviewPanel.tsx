import type { Analysis } from "@/lib/documents/types";
import { formatMoneyCents } from "@/lib/documents/money";
import { PRICING_BASIS_LABELS, SCOPE_STATUSES } from "@/lib/documents/types";
import {
  EvidenceInline,
  PricingBasisBadge,
  RejectionList,
  ScopeBadge,
  SectionCard,
  documentLabel,
} from "./shared";

interface OverviewPanelProps {
  readonly analysis: Analysis;
  readonly onOpenDocuments: () => void;
  readonly onOpenComparison: () => void;
  readonly onOpenFindings: () => void;
}

export function OverviewPanel({
  analysis,
  onOpenDocuments,
  onOpenComparison,
  onOpenFindings,
}: OverviewPanelProps) {
  const cells = analysis.comparisonRows.flatMap((row) => Object.values(row.cells));
  const statusCounts = new Map(SCOPE_STATUSES.map((status) => [status, 0]));
  for (const cell of cells) {
    statusCounts.set(cell.status, (statusCounts.get(cell.status) ?? 0) + 1);
  }

  return (
    <div className="view-stack">
      <SectionCard
        title="Analysis summary"
        description="Text extraction, arithmetic and comparisons are deterministic. Every extracted claim can be traced back to a page and line."
        aside={<span className="tag tag-warning">Synthetic test only</span>}
      >
        <div className="stat-grid">
          <article className="stat-card">
            <p className="stat-label">Documents accepted</p>
            <p className="stat-value">{analysis.metrics.documentsAccepted}</p>
            <p className="stat-note">
              {analysis.metrics.documentsRejected} rejected ·{" "}
              {analysis.documents.reduce((sum, document) => sum + document.pageCount, 0)} pages
            </p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Line items extracted</p>
            <p className="stat-value">{analysis.metrics.lineItemsExtracted}</p>
            <p className="stat-note">
              {analysis.metrics.arithmeticMatches}/{analysis.metrics.arithmeticChecks} totals
              reconcile
            </p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Findings</p>
            <p className="stat-value">{analysis.metrics.findings}</p>
            <p className="stat-note">
              {analysis.metrics.findingsWithEvidence} carry source evidence
            </p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Evidence references</p>
            <p className="stat-value">{analysis.metrics.evidenceReferences}</p>
            <p className="stat-note">
              {analysis.metrics.warnings} warnings · {analysis.metrics.unreadablePages} unreadable
              pages
            </p>
          </article>
        </div>

        {analysis.metrics.suspiciousSpans > 0 ? (
          <p className="notice notice-warning" role="note">
            {analysis.metrics.suspiciousSpans} instruction-like span(s) were detected and ignored as
            untrusted document content. They did not alter the analysis.
          </p>
        ) : null}

        <div className="analysis-links">
          <button
            type="button"
            className="button button-secondary button-small"
            onClick={onOpenDocuments}
          >
            Review extracted fields
          </button>
          <button
            type="button"
            className="button button-secondary button-small"
            onClick={onOpenComparison}
          >
            Open scope comparison
          </button>
          <button
            type="button"
            className="button button-secondary button-small"
            onClick={onOpenFindings}
          >
            Review findings and questions
          </button>
        </div>
      </SectionCard>

      <SectionCard
        title="Documents in this comparison"
        description="A materials package, an installed fixed price and a cost-plus estimate are not directly comparable. Review the basis before comparing totals."
        aside={<span className="tag tag-muted">{analysis.analysisId}</span>}
      >
        {analysis.documents.length === 0 ? (
          <p className="empty-state">
            No document passed validation. The rejection reasons are listed below.
          </p>
        ) : (
          <div className="proposal-grid">
            {analysis.documents.map((document) => {
              const arithmetic = analysis.arithmetic.find(
                (check) => check.documentId === document.id,
              );
              return (
                <article className="proposal-card" key={document.id}>
                  <p className="proposal-basis">
                    {document.pricingBasis.value
                      ? PRICING_BASIS_LABELS[document.pricingBasis.value]
                      : "Pricing basis unknown"}
                  </p>
                  <h3>{documentLabel(document)}</h3>
                  <p className="proposal-amount">
                    {document.statedTotalCents.value === null
                      ? "Total not stated"
                      : formatMoneyCents(document.statedTotalCents.value)}
                    <span className="proposal-amount-label">
                      {document.statedTotalCents.value === null
                        ? "review required"
                        : "stated total"}
                    </span>
                  </p>
                  <p className="proposal-note">
                    {document.fileName} · {document.pageCount} page
                    {document.pageCount === 1 ? "" : "s"} · {document.lineItems.length} line items
                  </p>
                  <dl className="proposal-meta">
                    <div>
                      <dt>Extraction</dt>
                      <dd>
                        {document.extractionStatus === "complete" ? "Complete" : "Partial"}
                        {document.unreadablePages.length > 0
                          ? ` · pages ${document.unreadablePages.join(", ")} unreadable`
                          : ""}
                      </dd>
                    </div>
                    <div>
                      <dt>Arithmetic</dt>
                      <dd>
                        {arithmetic?.status === "matches"
                          ? "Reconciled"
                          : arithmetic?.status === "discrepancy"
                            ? `${formatMoneyCents(arithmetic.totalDeltaCents ?? 0)} difference`
                            : "Not enough data"}
                      </dd>
                    </div>
                    <div>
                      <dt>Corrections</dt>
                      <dd>
                        {document.corrections.length === 0
                          ? "None"
                          : `${document.corrections.length} reviewer correction(s)`}
                      </dd>
                    </div>
                  </dl>
                  <p className="proposal-meta-line">
                    <PricingBasisBadge basis={document.pricingBasis.value} />
                    <EvidenceInline
                      evidence={document.pricingBasis.evidence}
                      documents={analysis.documents}
                    />
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>

      {analysis.rejections.length > 0 ? (
        <SectionCard
          title="Validation results"
          description="Rejected files are not silently dropped. Each one is named with a reason."
        >
          <RejectionList rejections={analysis.rejections} />
        </SectionCard>
      ) : null}

      <SectionCard
        title="Scope status at a glance"
        description="Counts cover every scope row and every document. A missing statement is not treated as zero."
        aside={<span className="tag tag-muted">{cells.length} cells</span>}
      >
        <div className="status-counts">
          {SCOPE_STATUSES.map((status) => (
            <div className="status-count" key={status}>
              <ScopeBadge status={status} />
              <strong>{statusCounts.get(status) ?? 0}</strong>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Highest-priority findings"
        description="The report preserves extracted evidence and separates it from questions that still need a bidder answer."
        aside={<span className="tag tag-muted">{analysis.findings.length} total</span>}
      >
        {analysis.findings.length === 0 ? (
          <p className="empty-state">No findings were produced from the extracted documents.</p>
        ) : (
          <ol className="finding-list">
            {analysis.findings.slice(0, 5).map((finding) => (
              <li className="finding-item" key={finding.id}>
                <div className="finding-head">
                  <span className="priority-pill">Priority {finding.priority}</span>
                  <h3>{finding.title}</h3>
                  <span
                    className={`tag ${
                      finding.status === "security"
                        ? "tag-warning"
                        : finding.status === "extracted"
                          ? "tag-evidence"
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
              </li>
            ))}
          </ol>
        )}
        <div className="analysis-links">
          <button
            type="button"
            className="button button-secondary button-small"
            onClick={onOpenFindings}
          >
            Open all findings and questions
          </button>
        </div>
      </SectionCard>

      <SectionCard title="What this analysis does not do">
        <ul className="status-list">
          {analysis.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
