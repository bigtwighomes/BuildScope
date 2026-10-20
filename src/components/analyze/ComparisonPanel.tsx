"use client";

import { useMemo, useState } from "react";
import type { Analysis, ComparisonRow, ScopeStatus } from "@/lib/documents/types";
import { EvidenceList, ScopeBadge, SectionCard, documentLabel } from "./shared";

type Filter = "all" | "issues" | "questions";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All scope areas" },
  { id: "issues", label: "Needs review" },
  { id: "questions", label: "Questions" },
];

function rowStatuses(row: ComparisonRow): ScopeStatus[] {
  return Object.values(row.cells).map((cell) => cell.status);
}

function matchesFilter(row: ComparisonRow, filter: Filter): boolean {
  const statuses = rowStatuses(row);
  if (filter === "all") return true;
  if (filter === "questions") {
    return statuses.some((status) => status === "NOT_SPECIFIED" || status === "CONFLICTING");
  }
  return statuses.some((status) => status !== "INCLUDED" && status !== "NOT_APPLICABLE");
}

function rowEvidence(row: ComparisonRow) {
  return Object.values(row.cells).flatMap((cell) => [...cell.evidence]);
}

export function ComparisonPanel({ analysis }: { readonly analysis: Analysis }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const rows = useMemo(
    () => analysis.comparisonRows.filter((row) => matchesFilter(row, filter)),
    [analysis.comparisonRows, filter],
  );

  if (analysis.documents.length === 0) {
    return (
      <SectionCard title="Scope comparison">
        <p className="empty-state">No documents were accepted, so there is no scope comparison.</p>
      </SectionCard>
    );
  }

  return (
    <div className="view-stack">
      <SectionCard
        title="Scope comparison"
        description="Each cell is based on extracted line items, exclusions and material specifications. A missing statement is shown as not specified, never as zero."
        aside={<span className="tag tag-muted">{analysis.comparisonRows.length} areas</span>}
      >
        <div className="filter-bar">
          <div className="chip-group" role="group" aria-label="Filter scope comparisons">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={filter === option.id ? "chip chip-active" : "chip"}
                aria-pressed={filter === option.id}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="result-count" aria-live="polite">
            Showing {rows.length} of {analysis.comparisonRows.length} scope areas
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="empty-state">No scope areas match this filter.</p>
        ) : (
          <>
            <div
              className="table-wrap scope-table-wrap"
              role="region"
              aria-label="Scrollable scope comparison table"
              tabIndex={0}
            >
              <table className="scope-table">
                <thead>
                  <tr>
                    <th scope="col">Scope area</th>
                    {analysis.documents.map((document) => (
                      <th scope="col" key={document.id}>
                        {documentLabel(document)}
                        <span className="th-sub">{document.fileName}</span>
                      </th>
                    ))}
                    <th scope="col">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <ScopeTableRows
                      key={row.category}
                      row={row}
                      analysis={analysis}
                      expanded={expanded === row.category}
                      onToggle={() =>
                        setExpanded((current) => (current === row.category ? null : row.category))
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="scope-cards">
              {rows.map((row) => (
                <article className="scope-card" key={row.category}>
                  <div className="scope-card-head">
                    <div>
                      <span className="scope-category">Scope area</span>
                      <h3>{row.label}</h3>
                    </div>
                  </div>
                  <ul className="scope-card-list">
                    {analysis.documents.map((document) => {
                      const cell = row.cells[document.id];
                      return (
                        <li key={document.id}>
                          <span className="scope-card-bidder">{documentLabel(document)}</span>
                          <p>{cell ? <ScopeBadge status={cell.status} /> : null}</p>
                          <p>{cell?.note}</p>
                        </li>
                      );
                    })}
                  </ul>
                  {row.question ? <p className="scope-question">{row.question}</p> : null}
                  <details>
                    <summary>Source evidence ({rowEvidence(row).length})</summary>
                    <EvidenceList evidence={rowEvidence(row)} documents={analysis.documents} />
                  </details>
                </article>
              ))}
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title="How to read the statuses">
        <ul className="status-list">
          <li>
            <strong>Included</strong> — the extracted text prices the scope.
          </li>
          <li>
            <strong>Excluded</strong> — the document explicitly excludes the scope.
          </li>
          <li>
            <strong>Separately contracted</strong> — another contract or party is named.
          </li>
          <li>
            <strong>Not specified</strong> — no supporting text was found. This is not proof that
            the work is absent or free.
          </li>
          <li>
            <strong>Conflicting</strong> — the scope is priced and excluded, or specifications
            differ across documents.
          </li>
          <li>
            <strong>Unreadable</strong> — image-only or unreadable pages prevent a determination.
          </li>
          <li>
            <strong>Not applicable</strong> — the document type or pricing basis makes the scope
            irrelevant.
          </li>
        </ul>
      </SectionCard>
    </div>
  );
}

function ScopeTableRows({
  row,
  analysis,
  expanded,
  onToggle,
}: {
  readonly row: ComparisonRow;
  readonly analysis: Analysis;
  readonly expanded: boolean;
  readonly onToggle: () => void;
}) {
  const evidence = rowEvidence(row);
  return (
    <>
      <tr className={expanded ? "scope-row-expanded" : undefined}>
        <th scope="row">
          <span className="scope-area">{row.label}</span>
        </th>
        {analysis.documents.map((document) => {
          const cell = row.cells[document.id];
          return (
            <td key={document.id}>
              {cell ? <ScopeBadge status={cell.status} /> : null}
              <p className="cell-note">{cell?.note}</p>
            </td>
          );
        })}
        <td>
          <button type="button" className="inline-link" aria-expanded={expanded} onClick={onToggle}>
            {expanded ? "Hide evidence" : "Evidence & question"}
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr className="scope-detail-row">
          <td colSpan={analysis.documents.length + 2}>
            {row.question ? <p className="scope-question">{row.question}</p> : null}
            <EvidenceList evidence={evidence} documents={analysis.documents} />
          </td>
        </tr>
      ) : null}
    </>
  );
}
