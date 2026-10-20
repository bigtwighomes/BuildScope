import type { ReactNode } from "react";
import {
  CHANGE_STATUS_LABELS,
  RISK_STATUS_LABELS,
  SCOPE_STATUS_DESCRIPTIONS,
  SCOPE_STATUS_LABELS,
} from "@/lib/demo/analysis";
import type {
  ChangeStatus,
  EvidenceRef,
  Proposal,
  RiskStatus,
  ScopeStatus,
} from "@/lib/demo/types";

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

export function ChangeBadge({ status }: { readonly status: ChangeStatus }) {
  return (
    <span className={`badge badge-change-${status.toLowerCase()}`}>
      {CHANGE_STATUS_LABELS[status]}
    </span>
  );
}

export function RiskBadge({ status }: { readonly status: RiskStatus }) {
  return <span className={`badge badge-risk-${status}`}>{RISK_STATUS_LABELS[status]}</span>;
}

export function DemoBadge({ children = "Synthetic demo" }: { readonly children?: ReactNode }) {
  return <span className="badge badge-demo">{children}</span>;
}

export function SectionCard({
  title,
  description,
  children,
  id,
  aside,
}: {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly id?: string;
  readonly aside?: ReactNode;
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
  readonly evidence: readonly EvidenceRef[];
  readonly documents: readonly Proposal[];
}) {
  if (evidence.length === 0) {
    return (
      <p className="evidence-empty">
        No usable source evidence. This is shown as a checklist question, not a confirmed quote
        term.
      </p>
    );
  }

  return (
    <ul className="evidence-list">
      {evidence.map((item, index) => {
        const document = documents.find((candidate) => candidate.id === item.documentId);
        return (
          <li key={`${item.documentId}-${item.page}-${index}`}>
            <p className="evidence-meta">
              <span>{document?.documentTitle ?? item.documentId}</span>
              <span aria-hidden="true"> · </span>
              <span>
                {item.section}, page {item.page}
              </span>
              <span aria-hidden="true"> · </span>
              <span className={`evidence-quality evidence-quality-${item.quality}`}>
                {item.quality} confidence
              </span>
            </p>
            <blockquote>{item.span}</blockquote>
          </li>
        );
      })}
    </ul>
  );
}

export function Disclosure({ children }: { readonly children: ReactNode }) {
  return (
    <p className="disclosure" role="note">
      {children}
    </p>
  );
}
