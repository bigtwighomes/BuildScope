"use client";

import { DemoBadge, Disclosure, RiskBadge, SectionCard } from "./shared";
import type { DemoProject } from "@/lib/demo/types";

export function RiskView({ project }: { readonly project: DemoProject }) {
  return (
    <div className="view-stack">
      <SectionCard
        title="Location and risk screening"
        description="Screening only. No live Census, FEMA, USGS or jurisdiction lookup was performed for this synthetic project."
        aside={<DemoBadge>No live calls</DemoBadge>}
      >
        <div className="location-card">
          <div>
            <p className="location-label">Project location (synthetic intake)</p>
            <p className="location-value">
              {project.location.label} · ZIP {project.location.zip}
            </p>
            <p className="location-detail">
              {project.location.county}, {project.location.state}
            </p>
          </div>
          <p className="location-resolution">{project.location.resolution}</p>
        </div>

        <div className="risk-grid">
          {project.risks.map((risk) => (
            <article className="risk-card" key={risk.id}>
              <div className="risk-head">
                <h3>{risk.topic}</h3>
                <RiskBadge status={risk.status} />
              </div>
              <p>{risk.observation}</p>
              <dl className="risk-meta">
                <div>
                  <dt>Source</dt>
                  <dd>
                    <a href={risk.sourceUrl} target="_blank" rel="noreferrer noopener">
                      {risk.sourceName}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Resolution</dt>
                  <dd>{risk.resolution}</dd>
                </div>
                <div>
                  <dt>Retrieved</dt>
                  <dd>{risk.retrievedAt}</dd>
                </div>
                <div>
                  <dt>Limitations</dt>
                  <dd>{risk.limitations}</dd>
                </div>
                <div>
                  <dt>Suggested action</dt>
                  <dd>{risk.customerAction}</dd>
                </div>
              </dl>
              {risk.demoPlaceholder ? (
                <p className="risk-placeholder">
                  Demo placeholder — this observation is fabricated and no source was queried.
                </p>
              ) : null}
            </article>
          ))}
        </div>

        <Disclosure>
          Not found, service unavailable, outside coverage and not assessed are different from no
          risk. Hazard feeds screen; they do not certify parcel conditions. Confirm site-specific
          conditions with qualified local professionals.
        </Disclosure>
      </SectionCard>
    </div>
  );
}
