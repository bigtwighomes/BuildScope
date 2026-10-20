"use client";

import { useMemo, useState } from "react";
import { CHANGE_STATUS_LABELS, formatDelta } from "@/lib/demo/analysis";
import { CHANGE_STATUSES, type ChangeStatus, type DemoProject } from "@/lib/demo/types";
import { ChangeBadge, DemoBadge, Disclosure, EvidenceList, SectionCard } from "./shared";

type ChangeFilter = ChangeStatus | "ALL";

export function ChangesView({ project }: { readonly project: DemoProject }) {
  const [status, setStatus] = useState<ChangeFilter>("ALL");

  const counts = useMemo(() => {
    const map = new Map<ChangeStatus, number>();
    for (const change of project.changes) {
      map.set(change.status, (map.get(change.status) ?? 0) + 1);
    }
    return map;
  }, [project.changes]);

  const visibleChanges = project.changes.filter(
    (change) => status === "ALL" || change.status === status,
  );

  return (
    <div className="view-stack">
      <SectionCard
        title="Change and change-order impact"
        description="Baselines are preserved. Requested, quoted, approved and rejected changes are never treated as the same commitment."
        aside={<DemoBadge>Fixture</DemoBadge>}
      >
        <div className="chip-group" role="group" aria-label="Filter changes by status">
          <button
            type="button"
            className={`chip ${status === "ALL" ? "chip-active" : ""}`}
            aria-pressed={status === "ALL"}
            onClick={() => setStatus("ALL")}
          >
            All ({project.changes.length})
          </button>
          {CHANGE_STATUSES.filter((candidate) => counts.has(candidate)).map((candidate) => (
            <button
              key={candidate}
              type="button"
              className={`chip ${status === candidate ? "chip-active" : ""}`}
              aria-pressed={status === candidate}
              onClick={() => setStatus(candidate)}
            >
              {CHANGE_STATUS_LABELS[candidate]} ({counts.get(candidate)})
            </button>
          ))}
        </div>

        {visibleChanges.length === 0 ? (
          <p className="empty-state">No changes match this status filter.</p>
        ) : (
          <ol className="change-list">
            {visibleChanges.map((change) => (
              <li key={change.id} className="change-card">
                <div className="change-head">
                  <ChangeBadge status={change.status} />
                  <h3>{change.title}</h3>
                </div>
                <p>{change.description}</p>
                <dl className="change-meta">
                  <div>
                    <dt>Baseline</dt>
                    <dd>{change.baseline}</dd>
                  </div>
                  <div>
                    <dt>Proposed revision</dt>
                    <dd>{change.revision}</dd>
                  </div>
                  <div>
                    <dt>Documented delta</dt>
                    <dd>
                      {change.documentedDelta !== undefined
                        ? formatDelta(change.documentedDelta)
                        : change.deltaLow !== undefined && change.deltaHigh !== undefined
                          ? `${formatDelta(change.deltaLow)} to ${formatDelta(change.deltaHigh)}`
                          : "Not documented"}
                    </dd>
                  </div>
                  <div>
                    <dt>Unknown exposure</dt>
                    <dd>{change.unknownExposure}</dd>
                  </div>
                  <div>
                    <dt>Fee basis</dt>
                    <dd>{change.feeBasis}</dd>
                  </div>
                  <div>
                    <dt>Schedule impact</dt>
                    <dd>{change.scheduleImpact}</dd>
                  </div>
                </dl>
                <details>
                  <summary>Source evidence ({change.evidence.length})</summary>
                  <EvidenceList evidence={change.evidence} documents={project.documents} />
                </details>
              </li>
            ))}
          </ol>
        )}

        <Disclosure>
          Changes to plans, quantities, materials or selections can alter original item pricing and
          may create added labor, delays, delivery costs, rework, contractor markup and change-order
          fees. Confirm final price, scope, schedule and written authorization with the contractor.
        </Disclosure>
      </SectionCard>
    </div>
  );
}
