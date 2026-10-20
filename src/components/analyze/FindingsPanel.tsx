"use client";

import { useState } from "react";
import type { Analysis, AnalysisFinding } from "@/lib/documents/types";
import { EvidenceList, SectionCard } from "./shared";

function findingTag(finding: AnalysisFinding): { className: string; label: string } {
  if (finding.status === "security") return { className: "tag tag-warning", label: "Security" };
  if (finding.status === "extracted") {
    return { className: "tag tag-evidence", label: "Evidence-linked" };
  }
  return { className: "tag tag-question", label: "Checklist question" };
}

export function FindingsPanel({ analysis }: { readonly analysis: Analysis }) {
  const [feedback, setFeedback] = useState<{ id: string; message: string } | null>(null);

  async function copyQuestion(finding: AnalysisFinding) {
    try {
      await navigator.clipboard.writeText(finding.question);
      setFeedback({ id: finding.id, message: "Question copied" });
    } catch {
      setFeedback({
        id: finding.id,
        message: "Clipboard unavailable — select and copy the question manually.",
      });
    }
  }

  if (analysis.documents.length === 0) {
    return (
      <SectionCard title="Findings and questions">
        <p className="empty-state">No documents were accepted, so no findings were produced.</p>
      </SectionCard>
    );
  }

  return (
    <div className="view-stack">
      <SectionCard
        title="Findings and prioritized questions"
        description="Evidence-linked findings are separated from questions that still need a bidder answer. A question is never presented as a confirmed quote term."
        aside={
          <span className="tag tag-muted">
            {analysis.metrics.findingsWithEvidence}/{analysis.metrics.findings} with evidence
          </span>
        }
      >
        <ol className="finding-list">
          {analysis.findings.map((finding) => {
            const tag = findingTag(finding);
            return (
              <li key={finding.id} className="finding-item">
                <div className="finding-head">
                  <span className="priority-pill">Priority {finding.priority}</span>
                  <h3>{finding.title}</h3>
                  <span className={tag.className}>{tag.label}</span>
                  <span className={`badge finding-severity finding-severity-${finding.severity}`}>
                    {finding.severity}
                  </span>
                </div>
                <p>{finding.detail}</p>
                <p className="finding-audience">
                  <strong>Audience:</strong> {finding.audience}
                </p>
                <div className="question-box">
                  <p>
                    <strong>Ask:</strong> {finding.question}
                  </p>
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() => copyQuestion(finding)}
                  >
                    Copy question
                  </button>
                  {feedback?.id === finding.id ? (
                    <p role="status" className="copy-feedback">
                      {feedback.message}
                    </p>
                  ) : null}
                </div>
                <details>
                  <summary>
                    Source evidence (
                    {finding.evidence.length === 0
                      ? "none — checklist only"
                      : finding.evidence.length}
                    )
                  </summary>
                  <EvidenceList evidence={finding.evidence} documents={analysis.documents} />
                </details>
              </li>
            );
          })}
        </ol>
      </SectionCard>
    </div>
  );
}
