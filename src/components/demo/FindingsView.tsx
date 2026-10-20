"use client";

import { useState } from "react";
import type { DemoProject } from "@/lib/demo/types";
import { DemoBadge, EvidenceList, SectionCard } from "./shared";

export function FindingsView({ project }: { readonly project: DemoProject }) {
  const [feedback, setFeedback] = useState<{
    readonly id: string;
    readonly message: string;
  } | null>(null);

  async function copyQuestion(id: string, question: string) {
    try {
      await navigator.clipboard.writeText(question);
      setFeedback({ id, message: "Question copied" });
    } catch {
      setFeedback({
        id,
        message: "Clipboard unavailable — select and copy the question text manually.",
      });
    }
  }

  const ordered = [...project.findings].sort((a, b) => a.priority - b.priority);

  return (
    <div className="view-stack">
      <SectionCard
        title="Findings and prioritized questions"
        description="Each finding is classified as extracted evidence or a checklist question. Nothing without a source is presented as a confirmed quote term."
        aside={<DemoBadge>Fixture</DemoBadge>}
      >
        <ol className="finding-list">
          {ordered.map((finding) => (
            <li key={finding.id} className="finding-item">
              <div className="finding-head">
                <span className="priority-pill">Priority {finding.priority}</span>
                <h3>{finding.title}</h3>
                <span
                  className={`tag ${finding.status === "extracted" ? "tag-evidence" : "tag-question"}`}
                >
                  {finding.status === "extracted" ? "Evidence-linked" : "Checklist question"}
                </span>
              </div>
              <p>{finding.detail}</p>
              <div className="question-box">
                <p>
                  <strong>Ask {finding.audience}:</strong> {finding.question}
                </p>
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={() => copyQuestion(finding.id, finding.question)}
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
                <EvidenceList evidence={finding.evidence} documents={project.documents} />
              </details>
            </li>
          ))}
        </ol>
      </SectionCard>
    </div>
  );
}
