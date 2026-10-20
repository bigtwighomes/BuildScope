"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Analysis, DocumentCorrection, DocumentCorrections } from "@/lib/documents/types";
import { buildAnalysis } from "@/lib/documents/analysis";
import { ComparisonPanel } from "./ComparisonPanel";
import { DocumentsPanel } from "./DocumentsPanel";
import { FinancialPanel } from "./FinancialPanel";
import { FindingsPanel } from "./FindingsPanel";
import { OverviewPanel } from "./OverviewPanel";
import { ReportPanel } from "./ReportPanel";
import { ResponsibilitiesPanel } from "./ResponsibilitiesPanel";
import { UploadPanel } from "./UploadPanel";

const VIEWS = [
  { id: "overview", label: "Overview" },
  { id: "documents", label: "Documents" },
  { id: "comparison", label: "Scope comparison" },
  { id: "responsibilities", label: "Responsibilities" },
  { id: "costs", label: "Costs & unknowns" },
  { id: "findings", label: "Findings & questions" },
  { id: "report", label: "Report" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

export function AnalyzeWorkspace({
  initialAnalysis,
}: {
  readonly initialAnalysis: Analysis | null;
}) {
  const [base, setBase] = useState<Analysis | null>(initialAnalysis);
  const [corrections, setCorrections] = useState<DocumentCorrections>({});
  const [activeView, setActiveView] = useState<ViewId>("overview");

  const analysis = useMemo(() => {
    if (!base) return null;
    if (Object.keys(corrections).length === 0) return base;
    return buildAnalysis(base.documents, {
      projectType: base.projectType,
      corrections,
      rejections: base.rejections,
      analysisId: base.analysisId,
      generatedAt: base.generatedAt,
    });
  }, [base, corrections]);

  function loadAnalysis(next: Analysis) {
    setBase(next);
    setCorrections({});
    setActiveView("overview");
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

  const projectName =
    analysis?.documents.find((document) => document.projectName.value)?.projectName.value ??
    analysis?.documents[0]?.fileName ??
    "New document analysis";
  const correctionCount = Object.keys(corrections).length;

  return (
    <div className="app-shell">
      <aside className="app-sidebar no-print">
        <Link href="/" className="app-brand">
          <span className="brand-mark" aria-hidden="true">
            BS
          </span>
          <span>
            <strong>BuildScope Check</strong>
            <small>Document analysis</small>
          </span>
        </Link>

        <nav aria-label="Analysis workspace sections">
          <ul className="app-nav">
            {VIEWS.map((view) => (
              <li key={view.id}>
                <button
                  type="button"
                  className={activeView === view.id ? "nav-button nav-button-active" : "nav-button"}
                  aria-current={activeView === view.id ? "page" : undefined}
                  disabled={!analysis && view.id !== "overview"}
                  onClick={() => setActiveView(view.id)}
                >
                  {view.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-actions">
          <button
            type="button"
            className="button button-secondary button-small"
            onClick={() => {
              setBase(null);
              setCorrections({});
              setActiveView("overview");
            }}
          >
            New analysis
          </button>
          <Link className="sidebar-link" href="/demo">
            Open the P2 synthetic demo
          </Link>
          <p className="sidebar-note">
            Deterministic extraction only. No AI, OCR, paid cost data, live payments or persistent
            file storage.
          </p>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar no-print">
          <div>
            <p className="breadcrumb">Synthetic document analysis</p>
            <h1>{projectName}</h1>
          </div>
          <div className="topbar-tags">
            <span className="tag tag-warning">Synthetic test data</span>
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
          {activeView === "overview" ? (
            <div className="view-stack">
              <UploadPanel hasAnalysis={base !== null} onAnalysis={loadAnalysis} />
              {analysis ? (
                <OverviewPanel
                  analysis={analysis}
                  onOpenDocuments={() => setActiveView("documents")}
                  onOpenComparison={() => setActiveView("comparison")}
                  onOpenFindings={() => setActiveView("findings")}
                />
              ) : (
                <section className="card">
                  <div className="card-head">
                    <div>
                      <h2>How this analysis works</h2>
                      <p className="card-sub">
                        The pipeline is deterministic and evidence-linked. It does not ask an AI
                        model to invent scope, totals or responsibilities.
                      </p>
                    </div>
                  </div>
                  <div className="card-body">
                    <ol className="status-list">
                      <li>
                        Validate the PDF header, size, encryption, page count and extractable text.
                      </li>
                      <li>
                        Extract fields, line items, exclusions, responsibilities, specifications and
                        terms.
                      </li>
                      <li>Recalculate quantity × unit price and stated totals in integer cents.</li>
                      <li>
                        Compare each scope area and label missing information instead of assuming
                        zero.
                      </li>
                      <li>
                        Show findings with document, page, section and quoted source evidence.
                      </li>
                    </ol>
                    <p className="notice notice-warning" role="note">
                      This is a synthetic P3 lab. Uploads are not stored. Do not upload confidential
                      documents, and do not treat any result as a real quote or professional advice.
                    </p>
                  </div>
                </section>
              )}
            </div>
          ) : null}
          {analysis && activeView === "documents" ? (
            <DocumentsPanel
              analysis={analysis}
              onCorrect={correctDocument}
              onResetDocument={resetDocument}
            />
          ) : null}
          {analysis && activeView === "comparison" ? <ComparisonPanel analysis={analysis} /> : null}
          {analysis && activeView === "responsibilities" ? (
            <ResponsibilitiesPanel analysis={analysis} />
          ) : null}
          {analysis && activeView === "costs" ? <FinancialPanel analysis={analysis} /> : null}
          {analysis && activeView === "findings" ? <FindingsPanel analysis={analysis} /> : null}
          {analysis && activeView === "report" ? <ReportPanel analysis={analysis} /> : null}
        </main>

        <footer className="app-footer no-print">
          <p>
            Synthetic document lab. Deterministic extraction and arithmetic only; not a construction
            quote, legal advice or professional certification.
          </p>
        </footer>
      </div>
    </div>
  );
}
