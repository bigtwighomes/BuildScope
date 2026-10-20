import type { Analysis, ArithmeticCheck, ExtractedDocument } from "@/lib/documents/types";
import { PRICING_BASIS_LABELS } from "@/lib/documents/types";
import { formatMoneyCents, formatPercent } from "@/lib/documents/money";
import { EvidenceInline, PricingBasisBadge, SectionCard, documentLabel } from "./shared";

function taxLabel(document: ExtractedDocument): string {
  if (document.tax.includedInTotal === true) return "Included in stated total";
  if (document.tax.includedInTotal === false) return "Not included in stated total";
  return "Inclusion unclear";
}

function arithmeticLabel(check: ArithmeticCheck | undefined): string {
  if (!check) return "Not checked";
  if (check.status === "matches") return "Reconciles";
  if (check.status === "discrepancy") return "Does not reconcile";
  return "Insufficient data";
}

function excludedScope(analysis: Analysis, documentId: string): string[] {
  return analysis.comparisonRows
    .filter((row) => {
      const status = row.cells[documentId]?.status;
      return status === "EXCLUDED" || status === "SEPARATELY_CONTRACTED";
    })
    .map((row) => row.label);
}

export function FinancialPanel({ analysis }: { readonly analysis: Analysis }) {
  if (analysis.documents.length === 0) {
    return (
      <SectionCard title="Costs and unknowns">
        <p className="empty-state">No documents were accepted, so no costs can be compared.</p>
      </SectionCard>
    );
  }

  return (
    <div className="view-stack">
      <SectionCard
        title="Costs and unknowns"
        description="Known totals, stated arithmetic and excluded scope stay separate. Unknown or unpriced scope is never added as zero."
        aside={<span className="tag tag-muted">Cost data OFF</span>}
      >
        <div className="cost-grid">
          {analysis.documents.map((document) => {
            const check = analysis.arithmetic.find((item) => item.documentId === document.id);
            const allowances = document.allowances.reduce(
              (sum, allowance) => sum + allowance.amountCents,
              0,
            );
            const excluded = excludedScope(analysis, document.id);
            return (
              <article className="cost-card" key={document.id}>
                <p className="proposal-basis">
                  {document.pricingBasis.value
                    ? PRICING_BASIS_LABELS[document.pricingBasis.value]
                    : "Unknown basis"}
                </p>
                <h3>{documentLabel(document)}</h3>
                <p className="cost-total">
                  {document.statedTotalCents.value === null
                    ? "Not stated"
                    : formatMoneyCents(document.statedTotalCents.value)}
                  <span>stated total</span>
                </p>
                <p className="cost-basis">{taxLabel(document)}</p>
                <dl className="cost-totals">
                  <div>
                    <dt>Line-item subtotal</dt>
                    <dd>
                      {document.lineItems.length === 0
                        ? "No line items"
                        : formatMoneyCents(check?.lineItemSubtotalCents ?? 0)}
                    </dd>
                  </div>
                  <div>
                    <dt>Tax</dt>
                    <dd>
                      {document.tax.amountCents === null
                        ? document.tax.statement || "Not extracted"
                        : formatMoneyCents(document.tax.amountCents)}
                      {document.tax.ratePercent !== null
                        ? ` · ${formatPercent(Math.round(document.tax.ratePercent * 100))}`
                        : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>Expected total</dt>
                    <dd>
                      {check?.expectedTotalCents === null || check?.expectedTotalCents === undefined
                        ? "Not enough data"
                        : formatMoneyCents(check.expectedTotalCents)}
                    </dd>
                  </div>
                  <div>
                    <dt>Arithmetic</dt>
                    <dd>
                      <span
                        className={`tag ${
                          check?.status === "matches" ? "tag-evidence" : "tag-warning"
                        }`}
                      >
                        {arithmeticLabel(check)}
                      </span>
                      {check?.totalDeltaCents ? (
                        <span className="cost-delta">
                          {" "}
                          {formatMoneyCents(check.totalDeltaCents)} difference
                        </span>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt>Allowances</dt>
                    <dd>
                      {allowances === 0 ? "None" : formatMoneyCents(allowances)}
                      {allowances > 0
                        ? document.allowances.every(
                            (allowance) => allowance.includedInLineItems === true,
                          )
                          ? " · inside line items"
                          : " · treatment unclear"
                        : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>Deposit</dt>
                    <dd>{document.payment.depositStatement || "Not extracted"}</dd>
                  </div>
                  <div>
                    <dt>Payment total</dt>
                    <dd>
                      {document.payment.scheduleTotalCents === null
                        ? "Not extracted"
                        : formatMoneyCents(document.payment.scheduleTotalCents)}
                    </dd>
                  </div>
                  <div>
                    <dt>Change orders</dt>
                    <dd>
                      {document.changeOrder.feePercent !== null
                        ? formatPercent(Math.round(document.changeOrder.feePercent * 100))
                        : "Not stated"}
                      {document.changeOrder.fixedFeeCents !== null
                        ? ` + ${formatMoneyCents(document.changeOrder.fixedFeeCents)}`
                        : ""}
                    </dd>
                  </div>
                </dl>
                <p className="cost-basis">
                  <PricingBasisBadge basis={document.pricingBasis.value} />
                </p>
                {excluded.length > 0 ? (
                  <details>
                    <summary>Scope outside this total ({excluded.length})</summary>
                    <ul className="status-list">
                      {excluded.map((label) => (
                        <li key={label}>{label}</li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <p className="cost-basis">No extracted exclusions.</p>
                )}
                <p className="cost-basis">
                  <EvidenceInline
                    evidence={document.statedTotalCents.evidence}
                    documents={analysis.documents}
                  />
                </p>
              </article>
            );
          })}
        </div>

        <p className="notice notice-warning" role="note">
          These are the amounts stated in synthetic documents. BuildScope does not add unknown
          conditions, allowances or excluded scope into a total, and it does not estimate market
          pricing.
        </p>
      </SectionCard>

      <SectionCard
        title="Arithmetic detail"
        description="Quantity × unit price is recalculated in integer cents. Stated totals and payment schedules are checked against the extracted line items and tax statement."
      >
        <div
          className="table-wrap"
          role="region"
          aria-label="Scrollable arithmetic checks table"
          tabIndex={0}
        >
          <table className="scope-table">
            <thead>
              <tr>
                <th scope="col">Document</th>
                <th scope="col">Line items</th>
                <th scope="col">Subtotal</th>
                <th scope="col">Tax expected</th>
                <th scope="col">Expected total</th>
                <th scope="col">Stated total</th>
                <th scope="col">Difference</th>
                <th scope="col">Payment difference</th>
              </tr>
            </thead>
            <tbody>
              {analysis.arithmetic.map((check) => {
                const document = analysis.documents.find((item) => item.id === check.documentId);
                return (
                  <tr key={check.documentId}>
                    <th scope="row">{document ? documentLabel(document) : check.documentId}</th>
                    <td>{check.lineItemCount}</td>
                    <td>{formatMoneyCents(check.lineItemSubtotalCents)}</td>
                    <td>
                      {check.taxExpectedCents === null
                        ? "Not calculated"
                        : formatMoneyCents(check.taxExpectedCents)}
                    </td>
                    <td>
                      {check.expectedTotalCents === null
                        ? "Not available"
                        : formatMoneyCents(check.expectedTotalCents)}
                    </td>
                    <td>
                      {check.statedTotalCents === null
                        ? "Not stated"
                        : formatMoneyCents(check.statedTotalCents)}
                    </td>
                    <td>
                      {check.totalDeltaCents === null
                        ? "—"
                        : formatMoneyCents(check.totalDeltaCents)}
                    </td>
                    <td>
                      {check.paymentScheduleDeltaCents === null
                        ? "—"
                        : formatMoneyCents(check.paymentScheduleDeltaCents)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {analysis.arithmetic.some((check) => check.lineExtensionIssues.length > 0) ? (
          <div className="doc-section">
            <h3 className="subsection-title">Line extension issues</h3>
            <ul className="warning-list">
              {analysis.arithmetic.flatMap((check) => {
                const document = analysis.documents.find((item) => item.id === check.documentId);
                return check.lineExtensionIssues.map((issue) => (
                  <li key={`${check.documentId}-${issue.lineId}`}>
                    <span className="tag tag-warning">Line extension</span>
                    <p>
                      {document ? documentLabel(document) : check.documentId} · {issue.lineId}:
                      stated {formatMoneyCents(issue.actualCents)}, expected{" "}
                      {formatMoneyCents(issue.expectedCents)}.
                    </p>
                  </li>
                ));
              })}
            </ul>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
