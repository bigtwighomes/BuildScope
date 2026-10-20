"use client";

import { useState } from "react";
import { RESPONSIBILITY_ROLE_LABELS, RESPONSIBLE_PARTY_LABELS } from "@/lib/demo/analysis";
import type { DemoProject } from "@/lib/demo/types";
import { DemoBadge, EvidenceList, SectionCard } from "./shared";

export function ResponsibilitiesView({ project }: { readonly project: DemoProject }) {
  const scopedIds = [...new Set(project.responsibilities.map((entry) => entry.scopeId))];
  const scopeOptions = project.scopeRows.filter((row) => scopedIds.includes(row.id));
  const [activeScopeId, setActiveScopeId] = useState(scopeOptions[0]?.id ?? "");

  const activeScope = scopeOptions.find((row) => row.id === activeScopeId) ?? scopeOptions[0];
  const entries = project.responsibilities.filter((entry) => entry.scopeId === activeScope?.id);

  return (
    <div className="view-stack">
      <SectionCard
        title="Responsibility matrix"
        description="Who supplies, pays, installs, coordinates, delivers, unloads and warrants each scope area. “Not stated” is a finding, not a default."
        aside={<DemoBadge>Fixture</DemoBadge>}
      >
        <div className="filter-bar">
          <label className="select-field">
            <span>Scope area</span>
            <select
              value={activeScopeId}
              onChange={(event) => setActiveScopeId(event.target.value)}
            >
              {scopeOptions.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.area}
                </option>
              ))}
            </select>
          </label>
        </div>

        {activeScope ? (
          <>
            <h3 className="subsection-title">{activeScope.area}</h3>
            <div
              className="table-wrap"
              role="region"
              aria-label={`Scrollable responsibility table for ${activeScope.area}`}
              tabIndex={0}
            >
              <table className="responsibility-table">
                <caption className="visually-hidden">
                  Responsibility assignments for {activeScope.area}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Role</th>
                    {project.documents.map((document) => (
                      <th scope="col" key={document.id}>
                        {document.bidder}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <th scope="row">{RESPONSIBILITY_ROLE_LABELS[entry.role]}</th>
                      {project.documents.map((document) => {
                        const party = entry.parties[document.id] ?? "unknown";
                        return (
                          <td key={document.id}>
                            <span className={`party party-${party}`}>
                              {RESPONSIBLE_PARTY_LABELS[party]}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="responsibility-notes">
              {entries.map((entry) => (
                <li key={`${entry.id}-note`}>
                  <p>
                    <strong>{RESPONSIBILITY_ROLE_LABELS[entry.role]}:</strong> {entry.note}
                  </p>
                  {entry.evidence ? (
                    <details>
                      <summary>Evidence</summary>
                      <EvidenceList evidence={[entry.evidence]} documents={project.documents} />
                    </details>
                  ) : (
                    <p className="evidence-empty">
                      No document assigns this role. Treat as an open question for the bidders.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="empty-state">No responsibility entries in this fixture.</p>
        )}
      </SectionCard>
    </div>
  );
}
