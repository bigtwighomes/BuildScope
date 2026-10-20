import type { ReactNode } from "react";
import {
  type DocumentRejection,
  type ExtractedDocument,
  type ResponsibleParty,
  type ScopeStatus,
  type SourceEvidence,
  RESPONSIBLE_PARTY_LABELS,
  PRICING_BASIS_LABELS,
  type PricingBasis,
} from "@/lib/documents/types";

const SCOPE_STATUS_LABELS: Record<ScopeStatus, string> = {
  INCLUDED: "Included",
  EXCLUDED: "Excluded",
  NOT_SPECIFIED: "Not specified",
  SEPARATELY_CONTRACTED: "Separately contracted",
  CONFLICTING: "Conflicting",
  UNREADABLE: "Unreadable",
  NOT_APPLICABLE: "Not applicable",
};

const SCOPE_STATUS_DESCRIPTIONS: Record<ScopeStatus, string> = {
  INCLUDED: "The extracted text prices this scope in the document.",
  EXCLUDED: "The extracted text explicitly excludes this scope.",
  NOT_SPECIFIED: "No supporting text was extracted. This is not proof of exclusion or zero cost.",
  SEPARATELY_CONTRACTED: "The extracted text assigns this scope to another contract or party.",
  CONFLICTING:
    "The document prices and excludes the scope, or the specification differs across documents.",
  UNREADABLE: "Unreadable or image-only pages prevent a determination.",
  NOT_APPLICABLE: "The document type or pricing basis makes this scope not applicable.",
};

export function documentLabel(document: ExtractedDocument): string {
  return document.contractor.value ?? document.fileName;
}

export function ScopeBadge({ status }: { readonly status: ScopeStatus }) {
  return (
    <span
      className={`badge badge-scope-${status.toLowerCase()}`}
      title={SCOPE_STATUS_DESCRIPTIONS[status]}
    >
      {SCOPE_STATUS_LABELS[status]}
    </span>
  );
}

export function PricingBasisBadge({ basis }: { readonly basis: PricingBasis | null }) {
  return (
    <span className="tag tag-muted">
      {basis ? PRICING_BASIS_LABELS[basis] : "Pricing basis unknown"}
    </span>
  );
}

export function PartyBadge({ party }: { readonly party: ResponsibleParty }) {
  return <span className={`party party-${party}`}>{RESPONSIBLE_PARTY_LABELS[party]}</span>;
}

export function SectionCard({
  title,
  description,
  children,
  aside,
  id,
}: {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly aside?: ReactNode;
  readonly id?: string;
}) {
  return (
    <section className="card" id={id}>
      <div className="card-head">
        <div>
          <h2>{title}</h2>
          {description ? <p className="card-sub">{description}</p> : null}
        </div>
        {aside ? <div className="card-aside">{aside}</div> : null}
      </div>
      <div className="card-body">{children}</div>
    </section>
  );
}

export function EvidenceList({
  evidence,
  documents,
}: {
  readonly evidence: readonly SourceEvidence[];
  readonly documents: readonly ExtractedDocument[];
}) {
  if (evidence.length === 0) {
    return (
      <p className="evidence-empty">
        No usable source evidence. This remains a checklist question, not a confirmed document term.
      </p>
    );
  }

  return (
    <ul className="evidence-list">
      {evidence.map((item, index) => {
        const document = documents.find((candidate) => candidate.id === item.documentId);
        return (
          <li key={`${item.documentId}-${item.page}-${item.lineNumber}-${index}`}>
            <p className="evidence-meta">
              <span>{document ? documentLabel(document) : item.documentId}</span>
              <span aria-hidden="true"> · </span>
              <span>
                {item.section}, page {item.page}, line {item.lineNumber}
              </span>
              <span aria-hidden="true"> · </span>
              <span className={`evidence-quality evidence-quality-${item.quality}`}>
                {item.quality} confidence
              </span>
              {item.classification === "inferred" ? (
                <>
                  <span aria-hidden="true"> · </span>
                  <span>inference</span>
                </>
              ) : null}
            </p>
            <blockquote>{item.span}</blockquote>
          </li>
        );
      })}
    </ul>
  );
}

export function EvidenceInline({
  evidence,
  documents,
}: {
  readonly evidence?: SourceEvidence;
  readonly documents: readonly ExtractedDocument[];
}) {
  if (!evidence) return null;
  const document = documents.find((candidate) => candidate.id === evidence.documentId);
  return (
    <span className="field-evidence">
      {document ? documentLabel(document) : evidence.documentId} · page {evidence.page} ·{" "}
      {evidence.section}
      {evidence.classification === "inferred" ? " · inferred" : ""}
    </span>
  );
}

export function EmptyState({ children }: { readonly children: ReactNode }) {
  return <p className="empty-state">{children}</p>;
}

export function RejectionList({
  rejections,
}: {
  readonly rejections: readonly DocumentRejection[];
}) {
  if (rejections.length === 0) return null;
  return (
    <div className="rejection-list">
      <h3>Documents not analyzed</h3>
      <ul>
        {rejections.map((rejection, index) => (
          <li key={`${rejection.fileName}-${rejection.code}-${index}`}>
            <div>
              <strong>{rejection.fileName}</strong>
              <span className="tag tag-warning">{rejection.code.replaceAll("_", " ")}</span>
            </div>
            <p>{rejection.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
