import type { ProjectType, RiskObservation, RiskStatus } from "@/lib/documents/types";
import { buildRiskObservations } from "@/lib/documents/risk";
import { SectionCard } from "./shared";

const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  verified_source_statement: "Verified source statement",
  customer_reported: "Customer reported",
  screening_indicator: "Screening indicator",
  possible_issue: "Possible issue",
  not_evaluated: "Not evaluated",
  not_found: "Nothing found",
  service_unavailable: "Service unavailable",
  outside_coverage: "Outside coverage",
  professionally_verified: "Professionally verified",
};

function riskTagClass(status: RiskStatus): string {
  if (status === "professionally_verified" || status === "verified_source_statement") {
    return "tag tag-evidence";
  }
  if (status === "possible_issue" || status === "screening_indicator") {
    return "tag tag-warning";
  }
  if (status === "not_found" || status === "not_evaluated") return "tag tag-muted";
  return "tag tag-question";
}

function RiskCard({ observation }: { readonly observation: RiskObservation }) {
  return (
    <article className="risk-card">
      <div className="change-card-head">
        <h3>{observation.topic}</h3>
        <span className={riskTagClass(observation.status)}>
          {RISK_STATUS_LABELS[observation.status]}
        </span>
      </div>
      <p>{observation.observation}</p>
      <dl className="cost-totals">
        <div>
          <dt>Source</dt>
          <dd>
            {observation.sourceUrl ? (
              <a href={observation.sourceUrl} target="_blank" rel="noreferrer">
                {observation.sourceName}
              </a>
            ) : (
              observation.sourceName
            )}
          </dd>
        </div>
        <div>
          <dt>Version or date</dt>
          <dd>{observation.versionOrDate}</dd>
        </div>
        <div>
          <dt>Retrieved</dt>
          <dd>{observation.retrievedAt ?? "Not retrieved"}</dd>
        </div>
        <div>
          <dt>Resolution</dt>
          <dd>{observation.resolution}</dd>
        </div>
      </dl>
      <p className="change-unknown">
        <strong>Limitation:</strong> {observation.limitations}
      </p>
      <p>
        <strong>Next step:</strong> {observation.customerAction}
      </p>
    </article>
  );
}

export function RiskPanel({
  projectType,
  location,
}: {
  readonly projectType: ProjectType;
  readonly location: string;
}) {
  const observations = buildRiskObservations(projectType, location);

  return (
    <div className="view-stack">
      <SectionCard
        title="Site and project screening questions"
        description="This is a checklist of questions, not a risk finding or a property report. No parcel, address, flood map, licence or jurisdiction lookup has been performed."
        aside={<span className="tag tag-warning">Not evaluated</span>}
      >
        <p className="notice notice-warning" role="note">
          {location.trim()
            ? `You entered "${location.trim()}". It has not been verified. Treat every item below as an open question and confirm it with the named source or a qualified professional.`
            : "No project location was entered. Every item below remains an open question."}
        </p>
        <div className="risk-grid">
          {observations.map((observation) => (
            <RiskCard key={observation.id} observation={observation} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
