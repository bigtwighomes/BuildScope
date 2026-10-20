"use client";

import { formatUsd, summarizeCosts } from "@/lib/demo/analysis";
import type { DemoProject } from "@/lib/demo/types";
import { Disclosure, DemoBadge, SectionCard } from "./shared";

export function FinancialView({ project }: { readonly project: DemoProject }) {
  const summaries = summarizeCosts(project);

  return (
    <div className="view-stack">
      <div className="mode-banner" role="note">
        <strong>Cost-data mode: OFF.</strong> No Craftsman, RSMeans or other licensed cost data is
        active. The planning ranges below are <em>synthetic interface placeholders</em> and are not
        market estimates.
      </div>

      <SectionCard
        title="1 · Known costs"
        description="Amounts written in the supplied documents. Allowances stay visible inside the total instead of being added twice."
        aside={<DemoBadge>From fixture documents</DemoBadge>}
      >
        <div className="cost-grid">
          {project.documents.map((document) => {
            const summary = summaries.find((entry) => entry.proposalId === document.id);
            const rows = project.knownCosts.filter((cost) => cost.proposalId === document.id);
            return (
              <article className="cost-card" key={document.id}>
                <h3>{document.bidder}</h3>
                <p className="cost-total">
                  {formatUsd(document.headlineAmount)}
                  <span>{document.headlineLabel}</span>
                </p>
                <p className="cost-basis">{document.comparabilityNote}</p>
                <ul className="cost-lines">
                  {rows.map((cost) => (
                    <li key={cost.id}>
                      <span className={`cost-kind cost-kind-${cost.kind}`}>
                        {cost.kind === "quoted"
                          ? "Quoted"
                          : cost.kind === "allowance"
                            ? "Allowance"
                            : "Discrepancy"}
                      </span>
                      <span className="cost-line-label">{cost.label}</span>
                      <span className="cost-line-amount">{formatUsd(cost.amount)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="cost-totals">
                  <div>
                    <dt>Quoted sum</dt>
                    <dd>{summary ? formatUsd(summary.quotedTotal) : "—"}</dd>
                  </div>
                  <div>
                    <dt>Allowances inside total</dt>
                    <dd>{summary ? formatUsd(summary.allowancesTotal) : "—"}</dd>
                  </div>
                  <div>
                    <dt>Documented discrepancy</dt>
                    <dd>{summary ? formatUsd(summary.discrepanciesTotal) : "—"}</dd>
                  </div>
                </dl>
                <p className="cost-footnote">
                  Allowances are not additional. The discrepancy is flagged separately and is not
                  added to the known total.
                </p>
              </article>
            );
          })}
        </div>

        <div className="arithmetic-notes">
          <h3>Deterministic arithmetic notes</h3>
          <ul>
            {project.arithmeticNotes.map((note) => (
              <li key={note.id}>
                <strong>{note.label}:</strong> {note.detail}
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>

      <SectionCard
        title="2 · Planning estimates"
        description="Illustrative ranges only. With cost data OFF, the product states plainly that no defensible localized range is available for this project."
        aside={<DemoBadge>Placeholder data</DemoBadge>}
      >
        <div className="no-range-callout" role="note">
          <strong>No defensible localized dollar range available.</strong> A real report would show
          source-backed ranges only after a written data license exists. This section exists to
          prove the interface keeps ranges, assumptions and data vintage visible.
        </div>
        <ul className="planning-list">
          {project.planningEstimates.map((estimate) => (
            <li key={estimate.id}>
              <div className="planning-head">
                <h3>{estimate.label}</h3>
                <p className="planning-range">
                  {formatUsd(estimate.low)} – {formatUsd(estimate.high)}
                  <span className="planning-unit">{estimate.unit}</span>
                </p>
              </div>
              <p className="planning-source">
                <span className="tag tag-warning">{estimate.sourceLabel}</span>
                <span>Data vintage: {estimate.dataVintage}</span>
              </p>
              <p>{estimate.basis}</p>
              <details>
                <summary>Assumptions ({estimate.assumptions.length})</summary>
                <ul>
                  {estimate.assumptions.map((assumption) => (
                    <li key={assumption}>{assumption}</li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard
        title="3 · Unpriced and unknown conditions"
        description="Unknown is never zero. These items stay visible as exposure and become questions for the bidders."
        aside={<DemoBadge>Checklist</DemoBadge>}
      >
        <ul className="unknown-list">
          {project.unknownConditions.map((condition) => (
            <li key={condition.id}>
              <h3>{condition.label}</h3>
              <p>
                <strong>Why it is unknown:</strong> {condition.whyUnknown}
              </p>
              <p className="unknown-question">
                <strong>Question:</strong> {condition.question}
              </p>
            </li>
          ))}
        </ul>
        <Disclosure>
          Changes to plans, quantities, materials or selections can alter original pricing and may
          add labor, delays, delivery, rework, markup and change-order fees. A proposed change and
          an approved change order are not the same.
        </Disclosure>
      </SectionCard>
    </div>
  );
}
