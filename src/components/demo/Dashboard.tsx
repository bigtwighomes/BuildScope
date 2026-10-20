"use client";

import { useState } from "react";
import Link from "next/link";
import type { DemoProject } from "@/lib/demo/types";
import { ChangesView } from "./ChangesView";
import { FindingsView } from "./FindingsView";
import { FinancialView } from "./FinancialView";
import { OverviewView } from "./OverviewView";
import { ResponsibilitiesView } from "./ResponsibilitiesView";
import { ReportView } from "./ReportView";
import { RiskView } from "./RiskView";
import { ScopeView } from "./ScopeView";
import { DemoBadge } from "./shared";

const VIEWS = [
  { id: "overview", label: "Overview" },
  { id: "scope", label: "Scope comparison" },
  { id: "responsibilities", label: "Responsibilities" },
  { id: "costs", label: "Costs & unknowns" },
  { id: "changes", label: "Changes" },
  { id: "risks", label: "Location & risks" },
  { id: "findings", label: "Findings & questions" },
  { id: "report", label: "Report preview" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

export function DemoWorkspace({ project }: { readonly project: DemoProject }) {
  const [activeView, setActiveView] = useState<ViewId>("overview");

  return (
    <div className="app-shell">
      <aside className="app-sidebar no-print">
        <Link href="/" className="app-brand">
          <span className="brand-mark" aria-hidden="true">
            BS
          </span>
          <span>
            <strong>BuildScope Check</strong>
            <small>Quote intelligence</small>
          </span>
        </Link>

        <nav aria-label="Demo workspace sections">
          <ul className="app-nav">
            {VIEWS.map((view) => (
              <li key={view.id}>
                <button
                  type="button"
                  className={activeView === view.id ? "nav-button nav-button-active" : "nav-button"}
                  aria-current={activeView === view.id ? "page" : undefined}
                  onClick={() => setActiveView(view.id)}
                >
                  {view.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-note">
          <p>
            <strong>P2 static demo.</strong> The <Link href="/analyze">P3 document lab</Link> adds
            deterministic text-PDF upload. AI extraction, payments, live location screening and
            licensed cost data remain unimplemented.
          </p>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar no-print">
          <div>
            <p className="breadcrumb">Demo project</p>
            <h1>{project.name}</h1>
          </div>
          <div className="topbar-tags">
            <DemoBadge>All data synthetic</DemoBadge>
            <span className="tag tag-muted">Cost data OFF</span>
            <span className="tag tag-muted">Payments disabled</span>
          </div>
        </header>

        <main className="app-content" id="demo-content">
          {activeView === "overview" ? (
            <OverviewView
              project={project}
              onOpenScope={() => setActiveView("scope")}
              onOpenFindings={() => setActiveView("findings")}
            />
          ) : null}
          {activeView === "scope" ? <ScopeView project={project} /> : null}
          {activeView === "responsibilities" ? <ResponsibilitiesView project={project} /> : null}
          {activeView === "costs" ? <FinancialView project={project} /> : null}
          {activeView === "changes" ? <ChangesView project={project} /> : null}
          {activeView === "risks" ? <RiskView project={project} /> : null}
          {activeView === "findings" ? <FindingsView project={project} /> : null}
          {activeView === "report" ? <ReportView project={project} /> : null}
        </main>

        <footer className="app-footer no-print">
          <p>
            Synthetic demo only. Planning support, not a construction quote, legal advice or
            professional certification.
          </p>
        </footer>
      </div>
    </div>
  );
}
