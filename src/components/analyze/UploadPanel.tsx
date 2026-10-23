"use client";

import { useId, useState } from "react";
import { PROJECT_TYPE_LABELS, type Analysis, type ProjectType } from "@/lib/documents/types";

interface UploadPanelProps {
  readonly projectType: ProjectType;
  readonly hasAnalysis: boolean;
  readonly onAnalysis: (analysis: Analysis) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function UploadPanel({ projectType, hasAnalysis, onAnalysis }: UploadPanelProps) {
  const inputId = useId();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return;
    setError(null);
    const next = [...files];
    const messages: string[] = [];
    for (const file of Array.from(incoming)) {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        messages.push(`${file.name} is not a PDF.`);
        continue;
      }
      if (file.size > 4 * 1024 * 1024) {
        messages.push(`${file.name} is larger than 4 MB.`);
        continue;
      }
      if (next.length >= 3) {
        messages.push("Only three PDFs can be compared at once.");
        break;
      }
      if (next.some((candidate) => candidate.name === file.name && candidate.size === file.size)) {
        messages.push(`${file.name} is already selected.`);
        continue;
      }
      next.push(file);
    }
    setFiles(next);
    if (messages.length > 0) setError(messages.join(" "));
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  async function analyze() {
    if (files.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    setStatus("Extracting text and comparing documents.");
    try {
      const form = new FormData();
      form.set("projectType", projectType);
      for (const file of files) form.append("files", file);
      const response = await fetch("/api/analyze", { method: "POST", body: form });
      const payload = (await response.json().catch(() => null)) as
        Analysis | { error?: string } | null;
      if (!response.ok) {
        setError(
          payload && "error" in payload && payload.error
            ? payload.error
            : "The documents could not be analyzed.",
        );
        setStatus(null);
        return;
      }
      if (!payload || !("documents" in payload)) {
        setError("The analysis response was incomplete.");
        setStatus(null);
        return;
      }
      onAnalysis(payload);
      setFiles([]);
      setStatus(
        payload.documents.length > 0
          ? "Analysis complete. Review the extracted fields before relying on any comparison."
          : "No documents passed validation. Review the rejection reasons below.",
      );
    } catch {
      setError("The upload could not reach the analysis service.");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  async function loadSample() {
    if (busy) return;
    setBusy(true);
    setError(null);
    setStatus("Loading the three synthetic proposals.");
    try {
      const response = await fetch("/api/analyze/sample", { method: "POST" });
      const payload = (await response.json().catch(() => null)) as
        Analysis | { error?: string } | null;
      if (!response.ok || !payload || !("documents" in payload)) {
        setError(
          payload && "error" in payload && payload.error
            ? payload.error
            : "The synthetic sample could not be loaded.",
        );
        setStatus(null);
        return;
      }
      onAnalysis(payload);
      setFiles([]);
      setStatus("Synthetic example loaded. All content is fictional test data.");
    } catch {
      setError("The synthetic sample could not be loaded.");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card upload-card" aria-labelledby="upload-title">
      <div className="card-head">
        <div>
          <p className="eyebrow">Step 2 of 5</p>
          <h2 id="upload-title">
            {hasAnalysis ? "Replace the documents" : "Add two or three proposals"}
          </h2>
          <p className="card-sub">
            Upload up to three text-based PDFs. Each document is validated, extracted and compared
            in memory. No AI extraction, OCR, paid cost data or file storage is used.
          </p>
        </div>
        <span className="tag tag-muted">{PROJECT_TYPE_LABELS[projectType]}</span>
      </div>
      <div className="card-body">
        <div className="upload-grid">
          <div>
            <label className="upload-drop" htmlFor={inputId}>
              <span className="upload-drop-title">Choose up to three PDFs</span>
              <span className="upload-drop-note">
                4 MB each, 40 pages each, text-based only. Scanned pages are rejected or flagged.
              </span>
              <span className="button button-secondary button-small">Browse files</span>
            </label>
            <input
              id={inputId}
              className="visually-hidden"
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
            {files.length > 0 ? (
              <ul className="file-list">
                {files.map((file, index) => (
                  <li className="file-item" key={`${file.name}-${file.size}-${index}`}>
                    <span>
                      <strong>{file.name}</strong>
                      <small>{formatFileSize(file.size)}</small>
                    </span>
                    <button
                      type="button"
                      className="button button-ghost button-small"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="upload-hint">
                No files selected. Use the synthetic sample to explore the full workflow.
              </p>
            )}
          </div>

          <div className="upload-actions">
            <div className="upload-summary">
              <span className="field-label">Project type</span>
              <strong>{PROJECT_TYPE_LABELS[projectType]}</strong>
              <span className="field-note">
                Used when the documents do not state a project type. Change it in step 1.
              </span>
            </div>
            <div className="button-row">
              <button
                type="button"
                className="button button-primary"
                disabled={files.length === 0 || busy}
                onClick={analyze}
              >
                {busy
                  ? "Analyzing…"
                  : `Analyze ${files.length || ""} PDF${files.length === 1 ? "" : "s"}`}
              </button>
              <button
                type="button"
                className="button button-secondary"
                disabled={busy}
                onClick={loadSample}
              >
                Use synthetic example
              </button>
            </div>
            <p className="upload-hint" role="note">
              Files stay in memory for this request only. Do not upload confidential documents.
              Every result requires your review.
            </p>
          </div>
        </div>

        {error ? (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        ) : null}
        <div aria-live="polite" className="upload-status">
          {status ? <p className="notice notice-info">{status}</p> : null}
        </div>
      </div>
    </section>
  );
}
