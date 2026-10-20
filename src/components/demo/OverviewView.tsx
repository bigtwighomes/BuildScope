"use client";

import Link from "next/link";
import {
  formatUsd,
  getHeadlineFindings,
  getUnknownExposure,
  summarizeCosts,
} from "@/lib/demo/analysis";
import type { DemoProject } from "@/lib/demo/types";
import { Disclosure, DemoBadge, EvidenceList, SectionCard } from "./shared";

export function OverviewView({
  project,
  onOpenScope,
  onOpenFindings,
}: {
  readonly project: DemoProject;
  readonly onOpenScope: () => void;
  readonly onOpenFindings: () => void;
}) {
  const costs = summarizeCosts(project);
  const exposure = getUnknownExposure(project);
  const findings = getHeadlineFindings(project, 3);
  const notSpecifiedCount = project.scopeRows
    .flatMap((row) => Object.values(row.cells))
    .filter((cell) => cell.status === "NOT_SPECIFIED").length;

  return (
    <div className="view-stack">
      <SectionCard
        title="Why the headline totals cannot be compared directly"
        description="Three documents, three pricing bases. BuildScope normalizes scope before comparing."
        aside={<DemoBadge>Fabricated fixture</DemoBadge>}
      >
        <div className="proposal-grid">
          {project.documents.map((document) => {
            const summary = costs.find((entry) => entry.proposalId === document.id);
            return (
              <article className="proposal-card" key={document.id}>
                <p className="proposal-basis">{document.pricingBasis.replace("_", " ")}</p>
                <h3>{document.bidder}</h3>
                <p className="proposal-amount">
                  {formatUsd(document.headlineAmount)}
                  <span className="proposal-amount-label">{document.headlineLabel}</span>
                </p>
                <p className="proposal-note">{document.comparabilityNote}</p>
                <dl className="proposal-meta">
                  <div>
                    <dt>Document</dt>
                    <dd>
                      {document.documentDate} · {document.pageCount} pages
                    </dd>
                  </div>
                  <div>
                    <dt>Allowances inside total</dt>
                    <dd>{summary ? formatUsd(summary.allowancesTotal) : "—"}</dd>
                  </div>
                  <div>
                    <dt>Validity</dt>
                    <dd>{document.expiration}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </SectionCard>

      <div className="stat-grid">
        <article className="stat-card">
          <p className="stat-label">Scope areas compared</p>
          <p className="stat-value">{project.scopeRows.length}</p>
          <p className="stat-note">
            {notSpecifiedCount} cells are not specified in at least one document
          </p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Unknown conditions</p>
          <p className="stat-value">{exposure.unknownConditionCount}</p>
          <p className="stat-note">Shown as exposure, never as $0</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Unassigned responsibilities</p>
          <p className="stat-value">{exposure.unassignedResponsibilityCount}</p>
          <p className="stat-note">Roles no document assigns clearly</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Changes tracked</p>
          <p className="stat-value">{project.changes.length}</p>
          <p className="stat-note">Baseline preserved for each one</p>
        </article>
      </div>

      <SectionCard
        title="Top findings"
        description="Prioritized, evidence-linked and written as questions for bidders."
        aside={
          <button type="button" className="button button-secondary" onClick={onOpenFindings}>
            Open all questions
          </button>
        }
      >
        <ol className="finding-list">
          {findings.map((finding) => (
            <li key={finding.id} className="finding-item">
              <div className="finding-head">
                <span className="priority-pill">Priority {finding.priority}</span>
                <h3>{finding.title}</h3>
              </div>
              <p>{finding.detail}</p>
              <p className="finding-audience">
                <strong>Ask:</strong> {finding.audience}
              </p>
              <details>
                <summary>Show evidence</summary>
                <EvidenceList evidence={finding.evidence} documents={project.documents} />
              </details>
            </li>
          ))}
        </ol>
      </SectionCard>

      <SectionCard
        title="Analysis status"
        description="What this synthetic build did and did not do."
      >
        <ul className="status-list">
          <li>
            <strong>Documents read:</strong> 3 synthetic fixtures with hand-labeled evidence spans.
          </li>
          <li>
            <strong>Extraction:</strong> static fixture data in this P2 demo. The separate{" "}
            <Link href="/analyze">P3 document lab</Link> extracts synthetic text-based PDFs
            deterministically; no AI or OCR is used.
          </li>
          <li>
            <strong>Cost data:</strong> OFF. Planning ranges shown elsewhere are visible synthetic
            placeholders, not market estimates.
          </li>
          <li>
            <strong>Location screening:</strong> not run. Risk cards are labeled not evaluated.
          </li>
          <li>
            <strong>Payments and delivery:</strong> disabled. Nothing here is purchasable.
          </li>
        </ul>
        <div className="button-row">
          <button type="button" className="button button-primary" onClick={onOpenScope}>
            Inspect the scope comparison
          </button>
        </div>
        <Disclosure>
          Planning reference only. BuildScope does not provide engineering, legal, inspection or
          code-compliance services, and this demo does not analyze real documents.
        </Disclosure>
      </SectionCard>
    </div>
  );
}
