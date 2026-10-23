import type {
  Analysis,
  DocumentCorrection,
  Exclusion,
  ExtractedDocument,
  ScopeCategory,
} from "@/lib/documents/types";
import {
  PRICING_BASES,
  PRICING_BASIS_LABELS,
  RESPONSIBILITY_ROLE_LABELS,
  SCOPE_CATEGORIES,
  SCOPE_CATEGORY_LABELS,
} from "@/lib/documents/types";
import { formatIsoDate, formatMoneyCents, formatPercent } from "@/lib/documents/money";
import {
  EvidenceInline,
  EvidenceList,
  PartyBadge,
  PricingBasisBadge,
  RejectionList,
  SectionCard,
  documentLabel,
} from "./shared";

interface DocumentsPanelProps {
  readonly analysis: Analysis;
  readonly onCorrect: (documentId: string, correction: DocumentCorrection) => void;
  readonly onResetDocument: (documentId: string) => void;
}

function fieldValue(value: string | number | null, formatter?: (input: string) => string): string {
  if (value === null || value === "") return "Not extracted";
  return formatter ? formatter(String(value)) : String(value);
}

const EXCLUSION_ASSIGNMENT_LABELS: Record<Exclusion["assignedTo"], string> = {
  homeowner: "Homeowner",
  other_contract: "Other contract",
  not_included: "Not included",
  unknown: "Not stated",
};

function ExtractedFieldRow({
  label,
  value,
  evidence,
  documents,
}: {
  readonly label: string;
  readonly value: string;
  readonly evidence?: ExtractedDocument["contractor"]["evidence"];
  readonly documents: readonly ExtractedDocument[];
}) {
  return (
    <div className="extracted-field">
      <dt>{label}</dt>
      <dd>
        <span className={value === "Not extracted" ? "field-missing" : undefined}>{value}</span>
        <EvidenceInline evidence={evidence} documents={documents} />
      </dd>
    </div>
  );
}

function DocumentCard({
  document,
  analysis,
  onCorrect,
  onResetDocument,
}: {
  readonly document: ExtractedDocument;
  readonly analysis: Analysis;
  readonly onCorrect: DocumentsPanelProps["onCorrect"];
  readonly onResetDocument: DocumentsPanelProps["onResetDocument"];
}) {
  const arithmetic = analysis.arithmetic.find((check) => check.documentId === document.id);
  const totalAllowances = document.allowances.reduce(
    (sum, allowance) => sum + allowance.amountCents,
    0,
  );

  return (
    <SectionCard
      title={documentLabel(document)}
      description={`${document.fileName} · ${document.pageCount} page${
        document.pageCount === 1 ? "" : "s"
      } · ${document.extractionStatus === "complete" ? "complete extraction" : "partial extraction"}`}
      aside={<PricingBasisBadge basis={document.pricingBasis.value} />}
    >
      <div className="document-overview">
        <dl className="proposal-meta document-meta">
          <ExtractedFieldRow
            label="Proposal number"
            value={fieldValue(document.proposalNumber.value)}
            evidence={document.proposalNumber.evidence}
            documents={analysis.documents}
          />
          <ExtractedFieldRow
            label="Proposal date"
            value={fieldValue(document.proposalDate.value, formatIsoDate)}
            evidence={document.proposalDate.evidence}
            documents={analysis.documents}
          />
          <ExtractedFieldRow
            label="Project"
            value={fieldValue(document.projectName.value)}
            evidence={document.projectName.evidence}
            documents={analysis.documents}
          />
          <ExtractedFieldRow
            label="Stated total"
            value={
              document.statedTotalCents.value === null
                ? "Not extracted"
                : formatMoneyCents(document.statedTotalCents.value)
            }
            evidence={document.statedTotalCents.evidence}
            documents={analysis.documents}
          />
          <ExtractedFieldRow
            label="Line-item subtotal"
            value={
              document.lineItems.length === 0
                ? "No line items"
                : formatMoneyCents(
                    document.lineItems.reduce((sum, item) => sum + item.extendedCents, 0),
                  )
            }
            documents={analysis.documents}
          />
          <ExtractedFieldRow
            label="Arithmetic check"
            value={
              arithmetic?.status === "matches"
                ? "Reconciles"
                : arithmetic?.status === "discrepancy"
                  ? `Does not reconcile (${formatMoneyCents(arithmetic.totalDeltaCents ?? 0)})`
                  : "Not enough data"
            }
            documents={analysis.documents}
          />
          <ExtractedFieldRow
            label="Allowances"
            value={
              document.allowances.length === 0
                ? "None extracted"
                : `${formatMoneyCents(totalAllowances)} across ${document.allowances.length} allowance(s)`
            }
            documents={analysis.documents}
          />
          <ExtractedFieldRow
            label="Corrections"
            value={
              document.corrections.length === 0
                ? "None"
                : document.corrections.map((entry) => entry.field).join(", ")
            }
            documents={analysis.documents}
          />
        </dl>

        <div className="document-flags">
          {document.unreadablePages.length > 0 ? (
            <p className="notice notice-warning">
              Pages without extractable text: {document.unreadablePages.join(", ")}. Missing scope
              is not treated as zero.
            </p>
          ) : null}
          {document.suspicionCount > 0 ? (
            <p className="notice notice-warning">
              {document.suspicionCount} instruction-like span(s) were ignored. They are listed in
              the warnings below and did not influence the analysis.
            </p>
          ) : null}
        </div>
      </div>

      <details className="correction-details" open={document.corrections.length > 0}>
        <summary>Correct extracted fields and line categories</summary>
        <p className="field-note">
          Corrections recalculate the comparison immediately. Original extracted evidence is kept;
          corrections are labeled as reviewer changes.
        </p>
        <div className="correction-grid">
          <label className="field">
            <span className="field-label">Contractor</span>
            <input
              type="text"
              value={document.contractor.value ?? ""}
              onChange={(event) => onCorrect(document.id, { contractor: event.target.value })}
            />
          </label>
          <label className="field">
            <span className="field-label">Proposal date</span>
            <input
              type="date"
              value={document.proposalDate.value ?? ""}
              onChange={(event) => onCorrect(document.id, { proposalDate: event.target.value })}
            />
          </label>
          <label className="field">
            <span className="field-label">Pricing basis</span>
            <select
              value={document.pricingBasis.value ?? "unknown"}
              onChange={(event) =>
                onCorrect(document.id, {
                  pricingBasis: event.target.value as DocumentCorrection["pricingBasis"],
                })
              }
            >
              {PRICING_BASES.map((basis) => (
                <option key={basis} value={basis}>
                  {PRICING_BASIS_LABELS[basis]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Stated total (USD)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={
                document.statedTotalCents.value === null
                  ? ""
                  : (document.statedTotalCents.value / 100).toFixed(2)
              }
              onChange={(event) => {
                if (event.target.value === "") return;
                const value = Number(event.target.value);
                if (Number.isFinite(value) && value >= 0) {
                  onCorrect(document.id, { statedTotalCents: Math.round(value * 100) });
                }
              }}
            />
          </label>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="button button-secondary button-small"
            disabled={document.corrections.length === 0}
            onClick={() => onResetDocument(document.id)}
          >
            Reset corrections for this document
          </button>
        </div>
        {document.corrections.length > 0 ? (
          <ul className="correction-log">
            {document.corrections.map((correction) => (
              <li key={`${correction.field}-${correction.correctedValue}`}>
                <strong>{correction.field}:</strong> {correction.originalValue || "not extracted"} →{" "}
                {correction.correctedValue}
              </li>
            ))}
          </ul>
        ) : null}
      </details>

      <div className="doc-section">
        <h3 className="subsection-title">Line items</h3>
        {document.lineItems.length === 0 ? (
          <p className="empty-state">No line items were parsed from this document.</p>
        ) : (
          <div
            className="table-wrap"
            role="region"
            aria-label={`Scrollable line items for ${documentLabel(document)}`}
            tabIndex={0}
          >
            <table className="scope-table line-item-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Description</th>
                  <th scope="col">Qty</th>
                  <th scope="col">Unit</th>
                  <th scope="col">Unit price</th>
                  <th scope="col">Extended</th>
                  <th scope="col">Category</th>
                  <th scope="col">Source</th>
                </tr>
              </thead>
              <tbody>
                {document.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>{formatMoneyCents(item.unitPriceCents)}</td>
                    <td>{formatMoneyCents(item.extendedCents)}</td>
                    <td>
                      <label className="inline-field">
                        <span className="visually-hidden">
                          Category for {item.id} in {documentLabel(document)}
                        </span>
                        <select
                          value={item.category}
                          onChange={(event) =>
                            onCorrect(document.id, {
                              lineCategories: {
                                [item.id]: event.target.value as ScopeCategory,
                              },
                            })
                          }
                        >
                          {SCOPE_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {SCOPE_CATEGORY_LABELS[category]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <span className="tag tag-muted">
                        {item.categoryProvenance === "reviewer" ? "Reviewer" : "Inferred"}
                      </span>
                    </td>
                    <td>
                      page {item.evidence.page}
                      <br />
                      line {item.evidence.lineNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="document-columns">
        <div className="doc-section">
          <h3 className="subsection-title">Allowances</h3>
          {document.allowances.length === 0 ? (
            <p className="empty-state">No allowances extracted.</p>
          ) : (
            <ul className="plain-list">
              {document.allowances.map((allowance) => (
                <li key={allowance.id}>
                  <strong>
                    {allowance.id} · {allowance.label}
                  </strong>
                  <span>{formatMoneyCents(allowance.amountCents)}</span>
                  <small>{allowance.note}</small>
                  <span className="list-evidence">
                    <EvidenceInline evidence={allowance.evidence} documents={analysis.documents} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="doc-section">
          <h3 className="subsection-title">Exclusions</h3>
          {document.exclusions.length === 0 ? (
            <p className="empty-state">No exclusions extracted.</p>
          ) : (
            <ul className="plain-list">
              {document.exclusions.map((exclusion) => (
                <li key={`${exclusion.id}-${exclusion.category}`}>
                  <strong>
                    {exclusion.id} · {exclusion.subject}
                  </strong>
                  <span>{EXCLUSION_ASSIGNMENT_LABELS[exclusion.assignedTo]}</span>
                  <small>
                    Category:{" "}
                    {exclusion.category === "tax"
                      ? "Tax"
                      : SCOPE_CATEGORY_LABELS[exclusion.category]}
                  </small>
                  <small>{exclusion.note}</small>
                  <span className="list-evidence">
                    <EvidenceInline evidence={exclusion.evidence} documents={analysis.documents} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="document-columns">
        <div className="doc-section">
          <h3 className="subsection-title">Responsibility matrix</h3>
          {document.responsibilities.length === 0 ? (
            <p className="empty-state">No responsibility assignments extracted.</p>
          ) : (
            <ul className="plain-list">
              {document.responsibilities.map((entry) => (
                <li key={entry.role}>
                  <strong>{RESPONSIBILITY_ROLE_LABELS[entry.role]}</strong>
                  <PartyBadge party={entry.party} />
                  <small>{entry.statement}</small>
                  <span className="list-evidence">
                    <EvidenceInline evidence={entry.evidence} documents={analysis.documents} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="doc-section">
          <h3 className="subsection-title">Material specifications</h3>
          {document.specifications.length === 0 ? (
            <p className="empty-state">No material specifications extracted.</p>
          ) : (
            <ul className="plain-list">
              {document.specifications.map((specification) => (
                <li key={specification.key}>
                  <strong>{specification.key.replaceAll("_", " ")}</strong>
                  <small>{specification.value}</small>
                  <span className="list-evidence">
                    <EvidenceInline
                      evidence={specification.evidence}
                      documents={analysis.documents}
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="doc-section">
        <h3 className="subsection-title">Commercial terms</h3>
        <dl className="proposal-meta document-meta">
          <ExtractedFieldRow
            label="Sales tax"
            value={
              document.tax.statement
                ? `${document.tax.statement}${
                    document.tax.ratePercent !== null
                      ? ` (${formatPercent(Math.round(document.tax.ratePercent * 100))})`
                      : ""
                  }`
                : "Not extracted"
            }
            evidence={document.tax.evidence}
            documents={analysis.documents}
          />
          <ExtractedFieldRow
            label="Delivery and freight"
            value={document.freight.statement || "Not extracted"}
            evidence={document.freight.evidence}
            documents={analysis.documents}
          />
          <ExtractedFieldRow
            label="Deposit"
            value={document.payment.depositStatement || "Not extracted"}
            evidence={document.payment.depositEvidence}
            documents={analysis.documents}
          />
          <ExtractedFieldRow
            label="Payment schedule"
            value={
              document.payment.scheduleStatement
                ? `${document.payment.scheduleStatement}${
                    document.payment.scheduleTotalCents === null
                      ? ""
                      : ` · total ${formatMoneyCents(document.payment.scheduleTotalCents)}`
                  }`
                : "Not extracted"
            }
            evidence={document.payment.scheduleEvidence}
            documents={analysis.documents}
          />
          <ExtractedFieldRow
            label="Change orders"
            value={document.changeOrder.statement || "Not extracted"}
            evidence={document.changeOrder.evidence}
            documents={analysis.documents}
          />
        </dl>
      </div>

      {document.warnings.length > 0 ? (
        <div className="doc-section">
          <h3 className="subsection-title">Extraction warnings</h3>
          <ul className="warning-list">
            {document.warnings.map((warning, index) => (
              <li key={`${warning.code}-${index}`}>
                <div>
                  <span className="tag tag-warning">{warning.code.replaceAll("_", " ")}</span>
                  <p>{warning.message}</p>
                </div>
                {warning.evidence ? (
                  <EvidenceList evidence={[warning.evidence]} documents={analysis.documents} />
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SectionCard>
  );
}

export function DocumentsPanel({ analysis, onCorrect, onResetDocument }: DocumentsPanelProps) {
  if (analysis.documents.length === 0) {
    return (
      <div className="view-stack">
        <RejectionList rejections={analysis.rejections} />
        <SectionCard title="Extracted documents">
          <p className="empty-state">No documents were accepted for extraction.</p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="view-stack">
      <RejectionList rejections={analysis.rejections} />
      <SectionCard
        title="Extracted fields and document register"
        description="Every field carries a page and line reference. Correct a field only when the extraction is wrong; the correction is logged separately from the source evidence."
        aside={<span className="tag tag-muted">No AI extraction</span>}
      >
        <p className="disclosure">
          Structured fields are parsed from deterministic text patterns. Line-item categories are
          inferred from descriptions and can be corrected below. A missing field is not filled with
          a guess.
        </p>
      </SectionCard>

      {analysis.documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          analysis={analysis}
          onCorrect={onCorrect}
          onResetDocument={onResetDocument}
        />
      ))}
    </div>
  );
}
