"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buildAnalysis } from "@/lib/documents/analysis";
import { buildRiskObservations } from "@/lib/documents/risk";
import type {
  Analysis,
  ChangeReview,
  DocumentCorrection,
  DocumentCorrections,
} from "@/lib/documents/types";
import { PROJECT_TYPE_LABELS } from "@/lib/documents/types";
import { ChangesPanel } from "./ChangesPanel";
import { ComparisonPanel } from "./ComparisonPanel";
import { DocumentsPanel } from "./DocumentsPanel";
import { FinancialPanel } from "./FinancialPanel";
import { FindingsPanel } from "./FindingsPanel";
import { ProjectStep, type ProjectSetup } from "./ProjectStep";
import { ReportPanel } from "./ReportPanel";
import { ResponsibilitiesPanel } from "./ResponsibilitiesPanel";
import { RiskPanel } from "./RiskPanel";
import { UploadPanel } from "./UploadPanel";

const STEPS = [
  { id: "project", label: "Project", hint: "Basics" },
  { id: "documents", label: "Documents", hint: "Add PDFs" },
  { id: "review", label: "Review", hint: "Check extraction" },
  { id: "compare", label: "Compare", hint: "Scope and questions" },
  { id: "report", label: "Report", hint: "Print or save" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const COMPARE_VIEWS = [
  { id: "scope", label: "Scope" },
  { id: "responsibilities", label: "Responsibilities" },
  { id: "costs", label: "Costs & unknowns" },
  { id: "changes", label: "Changes" },
  { id: "risks", label: "Site questions" },
  { id: "findings", label: "Questions" },
] as const;

type CompareViewId = (typeof COMPARE_VIEWS)[number]["id"];

function initialProject(analysis: Analysis | null): ProjectSetup {
  const documentName =
    analysis?.documents.find((document) => document.projectName.value)?.projectName.value ?? "";
  return {
    name: documentName,
    location: analysis?.location ?? "",
    projectType: analysis?.projectType ?? "new_home",
  };
}

export function AnalyzeWorkspace({
  initialAnalysis,
}: {
  readonly initialAnalysis: Analysis | null;
}) {
  const [base, setBase] = useState<Analysis | null>(initialAnalysis);
  const [corrections, setCorrections] = useState<DocumentCorrections>({});
  const [changes, setChanges] = useState<readonly ChangeReview[]>(initialAnalysis?.changes ?? []);
  const [project, setProject] = useState<ProjectSetup>(() => initialProject(initialAnalysis));
  const [activeStep, setActiveStep] = useState<StepId>(initialAnalysis ? "review" : "project");
  const [compareView, setCompareView] = useState<CompareViewId>("scope");

  const analysis = useMemo(() => {
    if (!base) return null;
    return buildAnalysis(base.documents, {
      projectType: project.projectType,
      location: project.location,
      corrections,
      rejections: base.rejections,
      analysisId: base.analysisId,
      generatedAt: base.generatedAt,
      provenance: base.provenance,
      changes,
      risks: buildRiskObservations(project.projectType, project.location),
    });
  }, [base, corrections, changes, project.projectType, project.location]);

  function loadAnalysis(next: Analysis) {
    setBase(next);
    setCorrections({});
    setChanges(next.changes);
    setProject((current) => ({
      name: current.name.trim() || next.documents[0]?.projectName.value || "",
      location:
        next.provenance.origin === "sample"
          ? next.location
          : base?.provenance.origin === "sample" && current.location === base.location
            ? ""
            : current.location,
      projectType: next.projectType,
    }));
    setActiveStep("review");
    setCompareView("scope");
  }

  function correctDocument(documentId: string, correction: DocumentCorrection) {
    setCorrections((current) => {
      const previous = current[documentId] ?? {};
      return {
        ...current,
        [documentId]: {
          ...previous,
          ...correction,
          lineCategories: correction.lineCategories
            ? { ...previous.lineCategories, ...correction.lineCategories }
            : previous.lineCategories,
        },
      };
    });
  }

  function resetDocument(documentId: string) {
    setCorrections((current) => {
      const next = { ...current };
      delete next[documentId];
      return next;
    });
  }

  function startOver() {
    setBase(null);
    setCorrections({});
    setChanges([]);
    setProject({ name: "", location: "", projectType: "new_home" });
    setActiveStep("project");
    setCompareView("scope");
  }

  const projectName =
    project.name.trim() ||
    analysis?.documents.find((document) => document.projectName.value)?.projectName.value ||
    "Untitled comparison";
  const correctionCount = Object.keys(corrections).length;
  const canReview = base !== null;
  const stepIndex = STEPS.findIndex((step) => step.id === activeStep) + 1;
  const step = STEPS[stepIndex - 1];

  function canOpenStep(id: StepId): boolean {
    return id === "project" || id === "documents" || canReview;
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar no-print">
        <Link href="/" className="app-brand">
          <span className="brand-mark" aria-hidden="true">
            BS
          </span>
          <span>
            <strong>BuildScope Check</strong>
            <small>Proposal review</small>
          </span>
        </Link>

        <nav aria-label="Proposal review steps">
          <ol className="flow-nav">
            {STEPS.map((item, index) => {
              const enabled = canOpenStep(item.id);
              const active = activeStep === item.id;
              const complete = index < stepIndex - 1;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={[
                      "flow-nav-button",
                      active ? "flow-nav-button-active" : "",
                      complete ? "flow-nav-button-complete" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-current={active ? "step" : undefined}
                    disabled={!enabled}
                    onClick={() => setActiveStep(item.id)}
                  >
                    <span className="flow-nav-number" aria-hidden="true">
                      {complete ? "✓" : index + 1}
                    </span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.hint}</small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="sidebar-actions">
          {base ? (
            <button
              type="button"
              className="button button-secondary button-small"
              onClick={startOver}
            >
              Start over
            </button>
          ) : null}
          <p className="sidebar-note">
            Deterministic extraction only. No AI, OCR, paid cost data, live payments or persistent
            file storage. Do not upload confidential documents.
          </p>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar no-print">
          <div>
            <p className="breadcrumb">
              Step {stepIndex} of {STEPS.length} — {step?.label}
            </p>
            <h1>{projectName}</h1>
          </div>
          <div className="topbar-tags">
            <span className="tag tag-muted">{PROJECT_TYPE_LABELS[project.projectType]}</span>
            {analysis ? (
              <span className="tag tag-muted">
                {analysis.metrics.documentsAccepted} document
                {analysis.metrics.documentsAccepted === 1 ? "" : "s"}
              </span>
            ) : (
              <span className="tag tag-muted">No documents loaded</span>
            )}
            {correctionCount > 0 ? (
              <span className="tag tag-evidence">
                {correctionCount} corrected document{correctionCount === 1 ? "" : "s"}
              </span>
            ) : null}
            <span className="tag tag-muted">Cost data OFF</span>
            <span className="tag tag-muted">Payments disabled</span>
          </div>
        </header>

        <main className="app-content" id="analysis-content">
          {activeStep === "project" ? (
            <ProjectStep
              value={project}
              onChange={setProject}
              hasAnalysis={base !== null}
              onContinue={() => setActiveStep(base ? "review" : "documents")}
            />
          ) : null}

          {activeStep === "documents" ? (
            <div className="view-stack">
              <UploadPanel
                projectType={project.projectType}
                hasAnalysis={base !== null}
                onAnalysis={loadAnalysis}
              />
              {base ? (
                <div className="step-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setActiveStep("project")}
                  >
                    Back to project
                  </button>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => setActiveStep("review")}
                  >
                    Continue to review
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {activeStep === "review" && analysis ? (
            <div className="view-stack">
              <section className="step-heading">
                <div>
                  <p className="eyebrow">Step 3 of 5</p>
                  <h2>Review what BuildScope extracted</h2>
                  <p>
                    Correct a field or line-item category before relying on the comparison. Every
                    correction is marked and keeps its source evidence.
                  </p>
                </div>
                <div className="button-row">
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() => setActiveStep("documents")}
                  >
                    Back to documents
                  </button>
                  <button
                    type="button"
                    className="button button-primary button-small"
                    onClick={() => setActiveStep("compare")}
                  >
                    Continue to comparison
                  </button>
                </div>
              </section>
              <div className="step-summary">
                <span>
                  <strong>{analysis.metrics.documentsAccepted}</strong> documents accepted
                </span>
                <span>
                  <strong>{analysis.metrics.lineItemsExtracted}</strong> line items extracted
                </span>
                <span>
                  <strong>{analysis.metrics.findings}</strong> findings and questions
                </span>
                <span>
                  <strong>{correctionCount}</strong> corrected documents
                </span>
              </div>
              <DocumentsPanel
                analysis={analysis}
                onCorrect={correctDocument}
                onResetDocument={resetDocument}
              />
            </div>
          ) : null}

          {activeStep === "compare" && analysis ? (
            <div className="view-stack">
              <section className="step-heading">
                <div>
                  <p className="eyebrow">Step 4 of 5</p>
                  <h2>Compare scope, money and open questions</h2>
                  <p>
                    Switch views to inspect the same evidence from different angles. Unknown or
                    unpriced scope stays outside every total.
                  </p>
                </div>
                <button
                  type="button"
                  className="button button-primary button-small"
                  onClick={() => setActiveStep("report")}
                >
                  Continue to report
                </button>
              </section>
              <div className="subtabs" role="tablist" aria-label="Comparison views">
                {COMPARE_VIEWS.map((view) => (
                  <button
                    key={view.id}
                    type="button"
                    role="tab"
                    aria-selected={compareView === view.id}
                    className={compareView === view.id ? "subtab subtab-active" : "subtab"}
                    onClick={() => setCompareView(view.id)}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
              {compareView === "scope" ? <ComparisonPanel analysis={analysis} /> : null}
              {compareView === "responsibilities" ? (
                <ResponsibilitiesPanel analysis={analysis} />
              ) : null}
              {compareView === "costs" ? <FinancialPanel analysis={analysis} /> : null}
              {compareView === "changes" ? (
                <ChangesPanel
                  changes={changes}
                  baselineCents={analysis.documents.reduce<number | null>((highest, document) => {
                    const total = document.statedTotalCents.value;
                    return total === null ? highest : Math.max(highest ?? total, total);
                  }, null)}
                  onChanges={setChanges}
                />
              ) : null}
              {compareView === "risks" ? (
                <RiskPanel projectType={project.projectType} location={project.location} />
              ) : null}
              {compareView === "findings" ? <FindingsPanel analysis={analysis} /> : null}
              <div className="step-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setActiveStep("review")}
                >
                  Back to review
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setActiveStep("report")}
                >
                  Continue to report
                </button>
              </div>
            </div>
          ) : null}

          {activeStep === "report" && analysis ? (
            <div className="view-stack">
              <section className="step-heading no-print">
                <div>
                  <p className="eyebrow">Step 5 of 5</p>
                  <h2>Your review report</h2>
                  <p>
                    Print or save the report, then use the open questions to get clear answers
                    before signing or paying.
                  </p>
                </div>
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={() => setActiveStep("compare")}
                >
                  Back to comparison
                </button>
              </section>
              <ReportPanel analysis={analysis} projectName={projectName} />
            </div>
          ) : null}
        </main>

        <footer className="app-footer no-print">
          <p>
            BuildScope Check is a deterministic document review aid, not a construction quote, legal
            advice, property report or professional certification.
          </p>
        </footer>
      </div>
    </div>
  );
}
