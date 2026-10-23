"use client";

import { useId, useState } from "react";
import { createChangeReview } from "@/lib/documents/changes";
import { formatMoneyCents, parseMoneyToCents } from "@/lib/documents/money";
import {
  CHANGE_REVIEW_STATUSES,
  type ChangeReview,
  type ChangeReviewStatus,
} from "@/lib/documents/types";
import { SectionCard } from "./shared";

const REASON_LABELS: Record<ChangeReview["reason"], string> = {
  owner_requested: "Owner request",
  site_condition: "Site condition",
  code_authority: "Code or authority",
  supplier: "Supplier",
  contractor: "Contractor",
  unknown: "Not stated",
};

const STATUS_LABELS: Record<ChangeReviewStatus, string> = {
  DRAFT: "Draft",
  REQUESTED: "Requested",
  QUOTED: "Quoted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  UNKNOWN: "Unknown",
};

function optionalMoney(input: string): number | null {
  if (input.trim() === "") return null;
  return parseMoneyToCents(input);
}

function optionalPercent(input: string): number | null {
  if (input.trim() === "") return null;
  const value = Number(input);
  return Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
}

function statusTagClass(status: ChangeReviewStatus): string {
  if (status === "APPROVED") return "tag tag-evidence";
  if (status === "REJECTED") return "tag tag-muted";
  if (status === "QUOTED" || status === "REQUESTED") return "tag tag-warning";
  return "tag tag-question";
}

export function ChangesPanel({
  changes,
  baselineCents,
  onChanges,
}: {
  readonly changes: readonly ChangeReview[];
  readonly baselineCents: number | null;
  readonly onChanges: (changes: readonly ChangeReview[]) => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState<ChangeReview["reason"]>("owner_requested");
  const [status, setStatus] = useState<ChangeReviewStatus>("QUOTED");
  const [baseline, setBaseline] = useState(
    baselineCents === null ? "" : (baselineCents / 100).toFixed(2),
  );
  const [additions, setAdditions] = useState("");
  const [credits, setCredits] = useState("");
  const [feePercent, setFeePercent] = useState("");
  const [fixedFee, setFixedFee] = useState("");
  const [scheduleImpact, setScheduleImpact] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addChange() {
    if (title.trim().length === 0) {
      setError("Give the change request a short title.");
      return;
    }
    const baselineCents = optionalMoney(baseline);
    const additionsCents = optionalMoney(additions);
    const creditsCents = optionalMoney(credits);
    const fixedFeeCents = optionalMoney(fixedFee);
    const moneyInputs = [
      { input: baseline, cents: baselineCents },
      { input: additions, cents: additionsCents },
      { input: credits, cents: creditsCents },
      { input: fixedFee, cents: fixedFeeCents },
    ];
    if (
      moneyInputs.some(({ input, cents }) => input.trim() !== "" && (cents === null || cents < 0))
    ) {
      setError(
        "Use non-negative dollar amounts with up to two decimal places, or leave the field blank.",
      );
      return;
    }
    const parsedFee = optionalPercent(feePercent);
    if (feePercent.trim() !== "" && parsedFee === null) {
      setError("Enter a fee percentage between 0 and 100, or leave it blank.");
      return;
    }
    const id =
      globalThis.crypto?.randomUUID?.() ??
      `change-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const next = createChangeReview({
      id,
      title,
      description,
      reason,
      status,
      baselineAmountCents: baselineCents,
      additionsCents,
      creditsCents,
      feePercent: parsedFee,
      fixedFeeCents,
      scheduleImpact,
      createdAt: new Date().toISOString(),
    });
    onChanges([...changes, next]);
    setTitle("");
    setDescription("");
    setAdditions("");
    setCredits("");
    setFeePercent("");
    setFixedFee("");
    setScheduleImpact("");
    setError(null);
  }

  return (
    <div className="view-stack">
      <SectionCard
        title="Change and revision review"
        description="Record a requested or quoted change, separate additions, credits and fees, and keep unknown exposure visible. These entries are customer-reported working notes, not extracted contract terms."
        aside={<span className="tag tag-muted">Local to this session</span>}
      >
        <div className="change-layout">
          <div className="change-form">
            <h3 className="subsection-title">Add a change</h3>
            <label className="field" htmlFor={titleId}>
              <span className="field-label">Title</span>
              <input
                id={titleId}
                type="text"
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Window package upgrade"
              />
            </label>
            <label className="field" htmlFor={descriptionId}>
              <span className="field-label">What changed?</span>
              <textarea
                id={descriptionId}
                rows={3}
                maxLength={800}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
            <div className="form-grid">
              <label className="field">
                <span className="field-label">Reason</span>
                <select
                  value={reason}
                  onChange={(event) => setReason(event.target.value as ChangeReview["reason"])}
                >
                  {Object.entries(REASON_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field-label">Status</span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ChangeReviewStatus)}
                >
                  {CHANGE_REVIEW_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-grid">
              <label className="field">
                <span className="field-label">Baseline amount</span>
                <input
                  inputMode="decimal"
                  value={baseline}
                  onChange={(event) => setBaseline(event.target.value)}
                  placeholder="0.00"
                />
              </label>
              <label className="field">
                <span className="field-label">Additions</span>
                <input
                  inputMode="decimal"
                  value={additions}
                  onChange={(event) => setAdditions(event.target.value)}
                  placeholder="0.00"
                />
              </label>
              <label className="field">
                <span className="field-label">Credits</span>
                <input
                  inputMode="decimal"
                  value={credits}
                  onChange={(event) => setCredits(event.target.value)}
                  placeholder="0.00"
                />
              </label>
              <label className="field">
                <span className="field-label">Fee %</span>
                <input
                  inputMode="decimal"
                  value={feePercent}
                  onChange={(event) => setFeePercent(event.target.value)}
                  placeholder="e.g. 12"
                />
              </label>
              <label className="field">
                <span className="field-label">Fixed fee</span>
                <input
                  inputMode="decimal"
                  value={fixedFee}
                  onChange={(event) => setFixedFee(event.target.value)}
                  placeholder="0.00"
                />
              </label>
              <label className="field">
                <span className="field-label">Schedule impact</span>
                <input
                  type="text"
                  maxLength={200}
                  value={scheduleImpact}
                  onChange={(event) => setScheduleImpact(event.target.value)}
                  placeholder="e.g. 10 business days"
                />
              </label>
            </div>
            <p className="notice notice-info" role="note">
              The percentage fee is applied to positive changed work only. Credits, schedule,
              financing and indirect impacts stay visible as assumptions rather than being treated
              as zero.
            </p>
            {error ? (
              <p className="notice notice-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="button-row">
              <button type="button" className="button button-primary" onClick={addChange}>
                Add change
              </button>
            </div>
          </div>

          <div className="change-list" aria-live="polite">
            <div className="change-list-head">
              <h3 className="subsection-title">Change register</h3>
              <span className="tag tag-muted">{changes.length}</span>
            </div>
            {changes.length === 0 ? (
              <p className="empty-state">
                No change requests recorded. A change only appears here because you entered it;
                BuildScope has not received or verified a change order.
              </p>
            ) : (
              <ul className="change-cards">
                {changes.map((change) => (
                  <li className="change-card" key={change.id}>
                    <div className="change-card-head">
                      <h4>{change.title}</h4>
                      <span className={statusTagClass(change.status)}>
                        {STATUS_LABELS[change.status]}
                      </span>
                    </div>
                    <p className="cost-basis">{REASON_LABELS[change.reason]}</p>
                    {change.description ? <p>{change.description}</p> : null}
                    <dl className="cost-totals">
                      <div>
                        <dt>Documented change</dt>
                        <dd>
                          {change.documentedDeltaCents === null
                            ? "Not priced"
                            : formatMoneyCents(change.documentedDeltaCents)}
                        </dd>
                      </div>
                      <div>
                        <dt>Additions / credits</dt>
                        <dd>
                          {change.additionsCents === null
                            ? "Not stated"
                            : formatMoneyCents(change.additionsCents)}{" "}
                          /{" "}
                          {change.creditsCents === null
                            ? "Not stated"
                            : formatMoneyCents(change.creditsCents)}
                        </dd>
                      </div>
                      <div>
                        <dt>Fee</dt>
                        <dd>
                          {change.feePercent === null ? "Not stated" : `${change.feePercent}%`}
                          {change.fixedFeeCents === null
                            ? ""
                            : ` + ${formatMoneyCents(change.fixedFeeCents)}`}
                        </dd>
                      </div>
                      <div>
                        <dt>Schedule</dt>
                        <dd>{change.scheduleImpact || "Not stated"}</dd>
                      </div>
                    </dl>
                    <p className="change-unknown">
                      <strong>Unknown exposure:</strong> {change.unknownExposure}
                    </p>
                    <button
                      type="button"
                      className="button button-ghost button-small"
                      onClick={() => onChanges(changes.filter((item) => item.id !== change.id))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
