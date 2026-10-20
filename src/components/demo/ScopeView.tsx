"use client";

import { useMemo, useState } from "react";
import {
  SCOPE_STATUS_DESCRIPTIONS,
  SCOPE_STATUS_LABELS,
  countScopeStatuses,
  filterScopeRows,
} from "@/lib/demo/analysis";
import type { DemoProject, ScopeStatus } from "@/lib/demo/types";
import { DemoBadge, EvidenceList, ScopeBadge, SectionCard } from "./shared";

type StatusFilter = ScopeStatus | "ALL";

export function ScopeView({ project }: { readonly project: DemoProject }) {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const statusCounts = useMemo(() => countScopeStatuses(project.scopeRows), [project.scopeRows]);
  const visibleRows = useMemo(
    () => filterScopeRows(project.scopeRows, { status, query }),
    [project.scopeRows, status, query],
  );

  function toggleRow(rowId: string) {
    setExpandedRowId((current) => (current === rowId ? null : rowId));
  }

  return (
    <div className="view-stack">
      <SectionCard
        title="Side-by-side scope comparison"
        description="Every material status carries a document, page and quoted span. Silence is shown as not specified, never as included."
        aside={<DemoBadge>Hand-labeled fixture</DemoBadge>}
      >
        <div className="legend-grid" aria-label="Scope status meanings">
          {(Object.keys(SCOPE_STATUS_LABELS) as ScopeStatus[]).map((key) => (
            <div className="legend-item" key={key}>
              <ScopeBadge status={key} />
              <p>{SCOPE_STATUS_DESCRIPTIONS[key]}</p>
            </div>
          ))}
        </div>

        <div className="filter-bar">
          <div className="chip-group" role="group" aria-label="Filter by scope status">
            <button
              type="button"
              className={`chip ${status === "ALL" ? "chip-active" : ""}`}
              aria-pressed={status === "ALL"}
              onClick={() => setStatus("ALL")}
            >
              All ({project.scopeRows.length})
            </button>
            {statusCounts.map((entry) => (
              <button
                key={entry.status}
                type="button"
                className={`chip ${status === entry.status ? "chip-active" : ""}`}
                aria-pressed={status === entry.status}
                onClick={() => setStatus(entry.status)}
              >
                {SCOPE_STATUS_LABELS[entry.status]} ({entry.count})
              </button>
            ))}
          </div>
          <label className="search-field">
            <span className="visually-hidden">Search scope areas</span>
            <input
              type="search"
              value={query}
              placeholder="Search scope, notes or category"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <p className="result-count" aria-live="polite">
          Showing {visibleRows.length} of {project.scopeRows.length} scope areas
        </p>

        <div
          className="table-wrap scope-table-wrap"
          role="region"
          aria-label="Scrollable scope comparison table"
          tabIndex={0}
        >
          <table className="scope-table">
            <caption className="visually-hidden">
              Scope comparison for Northline Builders, Cascade Timber Works and Sagebrush
              Construction
            </caption>
            <thead>
              <tr>
                <th scope="col">Scope area</th>
                {project.documents.map((document) => (
                  <th scope="col" key={document.id}>
                    {document.bidder}
                    <span className="th-sub">{document.pricingBasis.replace("_", " ")}</span>
                  </th>
                ))}
                <th scope="col">
                  <span className="visually-hidden">Evidence</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const expanded = expandedRowId === row.id;
                return (
                  <FragmentRow
                    key={row.id}
                    rowId={row.id}
                    area={row.area}
                    category={row.category}
                    documents={project.documents}
                    cells={row.cells}
                    expanded={expanded}
                    onToggle={() => toggleRow(row.id)}
                    question={row.question}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        {visibleRows.length === 0 ? (
          <p className="empty-state">
            No scope areas match this filter. Clear the filter to review all classifications.
          </p>
        ) : null}

        <div className="scope-cards" aria-hidden={visibleRows.length === 0}>
          {visibleRows.map((row) => (
            <article className="scope-card" key={row.id}>
              <div className="scope-card-head">
                <div>
                  <p className="scope-category">{row.category}</p>
                  <h3>{row.area}</h3>
                </div>
                <button
                  type="button"
                  className="button button-secondary button-small"
                  aria-expanded={expandedRowId === row.id}
                  onClick={() => toggleRow(row.id)}
                >
                  {expandedRowId === row.id ? "Hide evidence" : "Show evidence"}
                </button>
              </div>
              <ul className="scope-card-list">
                {project.documents.map((document) => {
                  const cell = row.cells[document.id];
                  if (!cell) return null;
                  return (
                    <li key={document.id}>
                      <p className="scope-card-bidder">{document.bidder}</p>
                      <ScopeBadge status={cell.status} />
                      <p>{cell.note}</p>
                    </li>
                  );
                })}
              </ul>
              {row.cells[project.documents[0]?.id ?? ""] && expandedRowId === row.id ? (
                <EvidenceList
                  evidence={project.documents.flatMap((document) => {
                    const cell = row.cells[document.id];
                    return cell?.evidence ? [cell.evidence] : [];
                  })}
                  documents={project.documents}
                />
              ) : null}
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function FragmentRow({
  rowId,
  area,
  category,
  documents,
  cells,
  expanded,
  onToggle,
  question,
}: {
  readonly rowId: string;
  readonly area: string;
  readonly category: string;
  readonly documents: DemoProject["documents"];
  readonly cells: DemoProject["scopeRows"][number]["cells"];
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly question?: string;
}) {
  return (
    <>
      <tr className={expanded ? "scope-row-expanded" : undefined}>
        <th scope="row">
          <span className="scope-category">{category}</span>
          <span className="scope-area">{area}</span>
          <button
            type="button"
            className="inline-link"
            aria-expanded={expanded}
            aria-controls={`scope-detail-${rowId}`}
            onClick={onToggle}
          >
            {expanded ? "Hide details" : "Details"}
          </button>
        </th>
        {documents.map((document) => {
          const cell = cells[document.id];
          return (
            <td key={document.id}>
              {cell ? (
                <>
                  <ScopeBadge status={cell.status} />
                  <p className="cell-note">{cell.note}</p>
                </>
              ) : (
                <span className="cell-note">Not in this document</span>
              )}
            </td>
          );
        })}
        <td>
          <span className="visually-hidden">Toggle evidence</span>
          <button
            type="button"
            className="button button-ghost button-small"
            aria-expanded={expanded}
            onClick={onToggle}
          >
            {expanded ? "−" : "+"}
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr id={`scope-detail-${rowId}`} className="scope-detail-row">
          <td colSpan={documents.length + 2}>
            {question ? (
              <p className="scope-question">
                <strong>Question to ask:</strong> {question}
              </p>
            ) : null}
            <EvidenceList
              evidence={documents.flatMap((document) => {
                const cell = cells[document.id];
                return cell?.evidence ? [cell.evidence] : [];
              })}
              documents={documents}
            />
          </td>
        </tr>
      ) : null}
    </>
  );
}
