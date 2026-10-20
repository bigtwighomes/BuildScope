import type { Analysis } from "@/lib/documents/types";
import { RESPONSIBILITY_ROLE_LABELS, RESPONSIBLE_PARTY_LABELS } from "@/lib/documents/types";
import { EvidenceInline, PartyBadge, SectionCard, documentLabel } from "./shared";

export function ResponsibilitiesPanel({ analysis }: { readonly analysis: Analysis }) {
  if (analysis.documents.length === 0) {
    return (
      <SectionCard title="Responsibility matrix">
        <p className="empty-state">
          No documents were accepted, so responsibilities cannot be compared.
        </p>
      </SectionCard>
    );
  }

  const materials = analysis.documents.filter(
    (document) => document.pricingBasis.value === "materials_package",
  );

  return (
    <div className="view-stack">
      <SectionCard
        title="Responsibility matrix"
        description="Party labels are normalized from extracted statements. A missing assignment stays unknown; the analysis does not invent a responsible party."
        aside={<span className="tag tag-muted">Extracted + inferred labels</span>}
      >
        {materials.length > 0 ? (
          <p className="notice notice-warning">
            {materials.map((document) => documentLabel(document)).join(", ")} is a materials
            package. Supply responsibility does not imply installation, unloading or warranty
            responsibility.
          </p>
        ) : null}
        <div
          className="table-wrap"
          role="region"
          aria-label="Scrollable responsibility comparison table"
          tabIndex={0}
        >
          <table className="responsibility-table">
            <thead>
              <tr>
                <th scope="col">Responsibility</th>
                {analysis.documents.map((document) => (
                  <th scope="col" key={document.id}>
                    {documentLabel(document)}
                    <span className="th-sub">{document.fileName}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysis.responsibilities.map((row) => (
                <tr key={row.role}>
                  <th scope="row">{RESPONSIBILITY_ROLE_LABELS[row.role]}</th>
                  {analysis.documents.map((document) => {
                    const cell = row.cells[document.id];
                    const party = cell?.party ?? "unknown";
                    return (
                      <td key={document.id}>
                        <PartyBadge party={party} />
                        <span className="visually-hidden">
                          {RESPONSIBLE_PARTY_LABELS[party]} for{" "}
                          {RESPONSIBILITY_ROLE_LABELS[row.role]}
                        </span>
                        {cell?.evidence ? (
                          <details className="cell-details">
                            <summary>Source</summary>
                            <p className="cell-note">{cell.evidence.span}</p>
                            <EvidenceInline
                              evidence={cell.evidence}
                              documents={analysis.documents}
                            />
                          </details>
                        ) : (
                          <p className="cell-note">No assignment extracted.</p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Unloading and installation are separate risks">
        <p>
          A delivered materials package can leave crane, unloading, installation, supervision and
          warranty with the homeowner or another contractor. These responsibilities are not inferred
          from the supplier&apos;s delivery obligation.
        </p>
        <p className="disclosure">
          Check the bidder-specific statements in the table above. A party label is a normalized
          summary of the extracted sentence, not a legal determination.
        </p>
      </SectionCard>
    </div>
  );
}
