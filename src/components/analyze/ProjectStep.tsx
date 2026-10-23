"use client";

import { useId } from "react";
import { PROJECT_TYPES, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/documents/types";
import { PROJECT_SCOPE_NOTES } from "@/lib/documents/scope";

export interface ProjectSetup {
  readonly name: string;
  readonly location: string;
  readonly projectType: ProjectType;
}

interface ProjectStepProps {
  readonly value: ProjectSetup;
  readonly onChange: (next: ProjectSetup) => void;
  readonly onContinue: () => void;
  readonly hasAnalysis: boolean;
}

export function ProjectStep({ value, onChange, onContinue, hasAnalysis }: ProjectStepProps) {
  const nameId = useId();
  const locationId = useId();

  return (
    <div className="view-stack flow-step">
      <section className="hero-panel flow-intro">
        <p className="eyebrow">Step 1 of 5</p>
        <h1>Compare proposals without guessing what is missing.</h1>
        <p>
          Start with the project basics. BuildScope will extract the documents, reconcile the stated
          arithmetic and show what each proposal includes, excludes and leaves unknown.
        </p>
        <ul className="hero-points">
          <li>Deterministic PDF extraction. No AI, OCR or paid cost data.</li>
          <li>Unknown or unpriced scope is never treated as zero.</li>
          <li>Every extracted claim keeps its document, page and source line.</li>
        </ul>
      </section>

      <section className="card" aria-labelledby="project-setup-title">
        <div className="card-head">
          <div>
            <p className="eyebrow">Project</p>
            <h2 id="project-setup-title">What are you comparing?</h2>
            <p className="card-sub">
              These details organize the review. The proposal text remains the source of truth.
            </p>
          </div>
          <span className="tag tag-muted">No account required</span>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <label className="field" htmlFor={nameId}>
              <span className="field-label">Project name</span>
              <input
                id={nameId}
                type="text"
                maxLength={120}
                placeholder="e.g. Cedar Ridge home"
                value={value.name}
                onChange={(event) => onChange({ ...value, name: event.target.value })}
              />
              <span className="field-note">Optional. Shown in your report.</span>
            </label>
            <label className="field" htmlFor={locationId}>
              <span className="field-label">City, state or postal code</span>
              <input
                id={locationId}
                type="text"
                maxLength={120}
                placeholder="Optional"
                value={value.location}
                onChange={(event) => onChange({ ...value, location: event.target.value })}
              />
              <span className="field-note">
                Used only for a screening checklist. BuildScope does not geocode or verify it.
              </span>
            </label>
          </div>

          <fieldset className="choice-fieldset">
            <legend className="field-label">Project type</legend>
            <div className="choice-grid">
              {PROJECT_TYPES.map((projectType) => (
                <label
                  className={
                    value.projectType === projectType
                      ? "choice-card choice-card-active"
                      : "choice-card"
                  }
                  key={projectType}
                >
                  <input
                    className="visually-hidden"
                    type="radio"
                    name="projectType"
                    value={projectType}
                    checked={value.projectType === projectType}
                    onChange={() => onChange({ ...value, projectType })}
                  />
                  <strong>{PROJECT_TYPE_LABELS[projectType]}</strong>
                  <span>{PROJECT_SCOPE_NOTES[projectType][0] ?? ""}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="button-row">
            <button type="button" className="button button-primary" onClick={onContinue}>
              {hasAnalysis ? "Review current documents" : "Continue to documents"}
            </button>
            <p className="field-note">
              You can return here at any time. Nothing is uploaded until you choose files.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
